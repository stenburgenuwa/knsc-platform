import { prisma } from '@/lib/prisma';

/*
  Automatic suspension tracking.

  Three rules, all driven by MatchEvent rows the referee records:

    STRAIGHT_RED   a red card in a match where the player did not also collect
                   two yellows                                   → 3 matches
    TWO_YELLOWS    two yellow cards in the same match            → 1 match
    FIVE_YELLOWS   five yellows accumulated across separate
                   matches (the tally then resets)               → 1 match

  Suspensions are counted in *team matches*, never in days. A ban that starts
  after fixture F is served by the player's club completing matches after F —
  so a postponed fixture delays the return, and a calendar month with no
  football serves nothing.

  Bans run consecutively: if a player picks up a second ban while the first is
  still outstanding, the second starts only once the first is fully served.

  The engine derives everything from match events on each read, which is what
  makes the result correct after any edit — deleting a card recalculates the
  ban rather than leaving a stale one behind. Results are also written into
  DisciplinaryCase so the League Manager's disciplinary register and the match
  report archive show the same thing the player profile shows.
*/

export type SuspensionType = 'STRAIGHT_RED' | 'TWO_YELLOWS' | 'FIVE_YELLOWS';

export const SUSPENSION_MATCHES: Record<SuspensionType, number> = {
  STRAIGHT_RED: 3,
  TWO_YELLOWS: 1,
  FIVE_YELLOWS: 1,
};

export const SUSPENSION_REASON: Record<SuspensionType, string> = {
  STRAIGHT_RED: 'Straight red card',
  TWO_YELLOWS: 'Two yellow cards in one match',
  FIVE_YELLOWS: 'Five yellow cards accumulated',
};

const YELLOW_ACCUMULATION_LIMIT = 5;

export type Suspension = {
  type: SuspensionType;
  reason: string;
  /** The fixture that triggered the ban. */
  fixtureId: string;
  matchesBanned: number;
  matchesServed: number;
  matchesRemaining: number;
};

export type PlayerSuspensionStatus = {
  suspended: boolean;
  /** Ready to render: "Available", "Suspended — 3 matches remaining", … */
  label: string;
  matchesRemaining: number;
  /** The ban currently being served, if any. */
  active: Suspension | null;
  /** Every ban ever triggered, oldest first, served or not. */
  history: Suspension[];
};

export const AVAILABLE: PlayerSuspensionStatus = {
  suspended: false,
  label: 'Available',
  matchesRemaining: 0,
  active: null,
  history: [],
};

function label(s: Suspension | null): string {
  if (!s) return 'Available';
  // A one-match ban reads more naturally as "next match" than "1 match
  // remaining", and that is the wording the league uses for accumulations.
  if (s.type === 'FIVE_YELLOWS' && s.matchesRemaining === 1) return 'Suspended — Next Match';
  return `Suspended — ${s.matchesRemaining} ${s.matchesRemaining === 1 ? 'match' : 'matches'} remaining`;
}

type EventRow = {
  type: string;
  fixtureId: string;
  fixture: { fixtureDate: Date; status: string };
};

/*
  Turns a player's card history into an ordered list of bans. Exported so it
  can be unit-tested without a database.
*/
export function deriveSuspensionTriggers(
  events: EventRow[]
): { type: SuspensionType; fixtureId: string; fixtureDate: Date }[] {
  // Group by fixture, keeping fixtures in the order they were played.
  const byFixture = new Map<string, { date: Date; yellows: number; reds: number }>();
  for (const e of events) {
    const entry = byFixture.get(e.fixtureId) || { date: e.fixture.fixtureDate, yellows: 0, reds: 0 };
    if (e.type === 'YELLOW_CARD') entry.yellows += 1;
    if (e.type === 'RED_CARD') entry.reds += 1;
    byFixture.set(e.fixtureId, entry);
  }

  const fixtures = [...byFixture.entries()]
    .map(([fixtureId, v]) => ({ fixtureId, ...v }))
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.fixtureId.localeCompare(b.fixtureId));

  const triggers: { type: SuspensionType; fixtureId: string; fixtureDate: Date }[] = [];
  let runningYellows = 0;

  for (const f of fixtures) {
    if (f.yellows >= 2) {
      // Two yellows *are* the dismissal. A red recorded alongside them is the
      // same sending-off, not a second offence, so it never adds three matches.
      triggers.push({ type: 'TWO_YELLOWS', fixtureId: f.fixtureId, fixtureDate: f.date });
    } else if (f.reds > 0) {
      triggers.push({ type: 'STRAIGHT_RED', fixtureId: f.fixtureId, fixtureDate: f.date });
    }

    // Accumulation counts every yellow shown, including those in a match that
    // already produced a sending-off.
    runningYellows += f.yellows;
    while (runningYellows >= YELLOW_ACCUMULATION_LIMIT) {
      triggers.push({ type: 'FIVE_YELLOWS', fixtureId: f.fixtureId, fixtureDate: f.date });
      runningYellows -= YELLOW_ACCUMULATION_LIMIT;
    }
  }

  return triggers;
}

/*
  Works out how much of each ban has been served, given the dates of the club's
  completed matches. Bans queue: each one starts at the later of (the first
  club match after its trigger) and (the end of the previous ban).
*/
export function applySuspensionsToTimeline(
  triggers: { type: SuspensionType; fixtureId: string; fixtureDate: Date }[],
  completedClubMatchDates: Date[]
): Suspension[] {
  const timeline = [...completedClubMatchDates].sort((a, b) => a.getTime() - b.getTime());
  const played = timeline.length;
  let cursor = 0; // index into the timeline where the next ban may begin

  return triggers.map((t) => {
    // First completed club match played strictly after the triggering fixture.
    const firstEligible = timeline.findIndex((d) => d.getTime() > t.fixtureDate.getTime());
    const start = Math.max(firstEligible === -1 ? played : firstEligible, cursor);
    const matchesBanned = SUSPENSION_MATCHES[t.type];
    const matchesServed = Math.min(Math.max(played - start, 0), matchesBanned);
    cursor = start + matchesBanned;

    return {
      type: t.type,
      reason: SUSPENSION_REASON[t.type],
      fixtureId: t.fixtureId,
      matchesBanned,
      matchesServed,
      matchesRemaining: matchesBanned - matchesServed,
    };
  });
}

/*
  The read path used by dashboards, the public profile and the team-sheet
  guard. Pure derivation — nothing here depends on a job having run.
*/
export async function getPlayerSuspensionStatus(playerId: string): Promise<PlayerSuspensionStatus> {
  const player = await prisma.player.findUnique({ where: { id: playerId }, select: { clubId: true } });
  if (!player) return AVAILABLE;

  const [events, clubMatches] = await Promise.all([
    prisma.matchEvent.findMany({
      where: { playerId, type: { in: ['YELLOW_CARD', 'RED_CARD'] }, fixture: { status: 'COMPLETED' } },
      select: { type: true, fixtureId: true, fixture: { select: { fixtureDate: true, status: true } } },
    }),
    prisma.fixture.findMany({
      where: {
        status: 'COMPLETED',
        OR: [{ homeClubId: player.clubId }, { awayClubId: player.clubId }],
      },
      select: { fixtureDate: true },
    }),
  ]);

  const history = applySuspensionsToTimeline(
    deriveSuspensionTriggers(events),
    clubMatches.map((m) => m.fixtureDate)
  );
  const active = history.find((s) => s.matchesRemaining > 0) || null;

  return {
    suspended: Boolean(active),
    label: label(active),
    matchesRemaining: active?.matchesRemaining ?? 0,
    active,
    history,
  };
}

/** Batch form of the above, so a squad list is one pair of queries not N. */
export async function getSuspensionStatuses(playerIds: string[]): Promise<Record<string, PlayerSuspensionStatus>> {
  if (playerIds.length === 0) return {};

  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, clubId: true },
  });
  const clubIds = [...new Set(players.map((p) => p.clubId))];

  const [events, clubMatches] = await Promise.all([
    prisma.matchEvent.findMany({
      where: { playerId: { in: playerIds }, type: { in: ['YELLOW_CARD', 'RED_CARD'] }, fixture: { status: 'COMPLETED' } },
      select: { playerId: true, type: true, fixtureId: true, fixture: { select: { fixtureDate: true, status: true } } },
    }),
    prisma.fixture.findMany({
      where: {
        status: 'COMPLETED',
        OR: [{ homeClubId: { in: clubIds } }, { awayClubId: { in: clubIds } }],
      },
      select: { fixtureDate: true, homeClubId: true, awayClubId: true },
    }),
  ]);

  const eventsByPlayer = new Map<string, EventRow[]>();
  for (const e of events) {
    const list = eventsByPlayer.get(e.playerId) || [];
    list.push(e);
    eventsByPlayer.set(e.playerId, list);
  }

  const out: Record<string, PlayerSuspensionStatus> = {};
  for (const p of players) {
    const timeline = clubMatches
      .filter((m) => m.homeClubId === p.clubId || m.awayClubId === p.clubId)
      .map((m) => m.fixtureDate);
    const history = applySuspensionsToTimeline(
      deriveSuspensionTriggers(eventsByPlayer.get(p.id) || []),
      timeline
    );
    const active = history.find((s) => s.matchesRemaining > 0) || null;
    out[p.id] = {
      suspended: Boolean(active),
      label: label(active),
      matchesRemaining: active?.matchesRemaining ?? 0,
      active,
      history,
    };
  }
  return out;
}

/*
  Writes the derived bans into DisciplinaryCase so they appear in the League
  Manager's register alongside hand-opened cases. Called after match events
  change. Idempotent: the (playerId, fixtureId, suspensionType) unique key
  means re-running never duplicates, and bans whose trigger has been deleted
  are removed again.
*/
export async function syncSuspensionCases(playerIds: string[]): Promise<void> {
  if (playerIds.length === 0) return;

  const statuses = await getSuspensionStatuses(playerIds);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, clubId: true },
  });
  const clubByPlayer = new Map(players.map((p) => [p.id, p.clubId]));

  for (const playerId of playerIds) {
    const status = statuses[playerId];
    const clubId = clubByPlayer.get(playerId);
    if (!status || !clubId) continue;

    const keep = new Set(status.history.map((s) => `${s.fixtureId}:${s.type}`));

    // Drop automatic cases whose triggering card no longer exists.
    const existing = await prisma.disciplinaryCase.findMany({
      where: { playerId, suspensionType: { not: null } },
      select: { id: true, fixtureId: true, suspensionType: true },
    });
    const stale = existing.filter((c) => !keep.has(`${c.fixtureId}:${c.suspensionType}`));
    if (stale.length > 0) {
      await prisma.disciplinaryCase.deleteMany({ where: { id: { in: stale.map((c) => c.id) } } });
    }

    for (const s of status.history) {
      const data = {
        reason: SUSPENSION_REASON[s.type],
        matchesBanned: s.matchesBanned,
        matchesServed: s.matchesServed,
        status: (s.matchesRemaining === 0 ? 'RESOLVED' : 'OPEN') as 'RESOLVED' | 'OPEN',
        decision: `${s.matchesBanned}-match suspension. ${s.matchesServed} of ${s.matchesBanned} served.`,
      };
      await prisma.disciplinaryCase.upsert({
        where: {
          playerId_fixtureId_suspensionType: {
            playerId,
            fixtureId: s.fixtureId,
            suspensionType: s.type,
          },
        },
        create: { playerId, clubId, fixtureId: s.fixtureId, suspensionType: s.type, ...data },
        update: data,
      });
    }
  }
}

/** Every player who has a card in this fixture — the set to resync after an edit. */
export async function playersInFixture(fixtureId: string): Promise<string[]> {
  const rows = await prisma.matchEvent.findMany({
    where: { fixtureId },
    select: { playerId: true },
    distinct: ['playerId'],
  });
  return rows.map((r) => r.playerId);
}
