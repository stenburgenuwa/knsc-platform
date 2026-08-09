import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../lib/prisma';
import { resetTestDb } from './db-helpers';
import {
  applySuspensionsToTimeline,
  deriveSuspensionTriggers,
  getPlayerSuspensionStatus,
  syncSuspensionCases,
} from '../lib/suspensions';

const d = (day: number) => new Date(Date.UTC(2026, 0, day));

function ev(type: string, fixtureId: string, day: number) {
  return { type, fixtureId, fixture: { fixtureDate: d(day), status: 'COMPLETED' } };
}

describe('suspension rules (pure)', () => {
  it('gives a straight red three matches', () => {
    const t = deriveSuspensionTriggers([ev('RED_CARD', 'f1', 1)]);
    expect(t).toHaveLength(1);
    expect(t[0].type).toBe('STRAIGHT_RED');
    const [s] = applySuspensionsToTimeline(t, [d(1)]);
    expect(s.matchesBanned).toBe(3);
    expect(s.matchesRemaining).toBe(3);
  });

  it('treats two yellows in one match as a one-match ban, not a straight red', () => {
    const t = deriveSuspensionTriggers([ev('YELLOW_CARD', 'f1', 1), ev('YELLOW_CARD', 'f1', 1)]);
    expect(t.map((x) => x.type)).toEqual(['TWO_YELLOWS']);
    expect(applySuspensionsToTimeline(t, [d(1)])[0].matchesBanned).toBe(1);
  });

  it('does not double-count when the referee also records the resulting red', () => {
    const t = deriveSuspensionTriggers([
      ev('YELLOW_CARD', 'f1', 1),
      ev('YELLOW_CARD', 'f1', 1),
      ev('RED_CARD', 'f1', 1),
    ]);
    expect(t.map((x) => x.type)).toEqual(['TWO_YELLOWS']);
  });

  it('suspends after five yellows across separate matches and resets the tally', () => {
    const events = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ev('YELLOW_CARD', `f${n}`, n));
    const t = deriveSuspensionTriggers(events);
    expect(t.filter((x) => x.type === 'FIVE_YELLOWS')).toHaveLength(2);
    // The first ban is triggered by the fifth booking, the second by the tenth.
    expect(t[0].fixtureId).toBe('f5');
    expect(t[1].fixtureId).toBe('f10');
  });

  it('counts a ban against team matches, not days', () => {
    const t = deriveSuspensionTriggers([ev('RED_CARD', 'f1', 1)]);
    // Club has played two more matches since the sending-off.
    const [s] = applySuspensionsToTimeline(t, [d(1), d(8), d(15)]);
    expect(s.matchesServed).toBe(2);
    expect(s.matchesRemaining).toBe(1);
  });

  it('returns the player to available once every match is served', () => {
    const t = deriveSuspensionTriggers([ev('RED_CARD', 'f1', 1)]);
    const [s] = applySuspensionsToTimeline(t, [d(1), d(8), d(15), d(22)]);
    expect(s.matchesRemaining).toBe(0);
  });

  it('never serves more matches than the ban', () => {
    const t = deriveSuspensionTriggers([ev('RED_CARD', 'f1', 1)]);
    const [s] = applySuspensionsToTimeline(t, [d(1), d(2), d(3), d(4), d(5), d(6), d(7)]);
    expect(s.matchesServed).toBe(3);
    expect(s.matchesRemaining).toBe(0);
  });

  it('serves two bans triggered by the same match one after the other', () => {
    // Booked in four straight matches, then two yellows in the fifth: that is
    // a one-match dismissal AND the fifth booking of the season, so both bans
    // fall due at once and must queue rather than run together.
    const t = deriveSuspensionTriggers([
      ev('YELLOW_CARD', 'f1', 1),
      ev('YELLOW_CARD', 'f2', 2),
      ev('YELLOW_CARD', 'f3', 3),
      ev('YELLOW_CARD', 'f5', 5),
      ev('YELLOW_CARD', 'f5', 5),
    ]);
    expect(t.map((x) => x.type)).toEqual(['TWO_YELLOWS', 'FIVE_YELLOWS']);

    // The club has played one match since the sending-off.
    const [first, second] = applySuspensionsToTimeline(t, [d(1), d(2), d(3), d(5), d(6)]);
    expect(first.matchesRemaining).toBe(0);
    // The accumulation ban cannot start until the dismissal has been served.
    expect(second.matchesServed).toBe(0);
    expect(second.matchesRemaining).toBe(1);
  });
});

describe('suspension status (against the database)', () => {
  let clubId: string;
  let otherClubId: string;
  let playerId: string;

  beforeEach(async () => {
    await resetTestDb();
    const club = await prisma.club.create({ data: { name: 'Mtwapa United' } });
    const other = await prisma.club.create({ data: { name: 'Gongoni Sharks' } });
    clubId = club.id;
    otherClubId = other.id;
    const player = await prisma.player.create({
      data: { clubId, firstName: 'Juma', lastName: 'Kahindi', approved: true },
    });
    playerId = player.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const fixture = async (day: number, status: 'COMPLETED' | 'UPCOMING' = 'COMPLETED') =>
    prisma.fixture.create({
      data: { homeClubId: clubId, awayClubId: otherClubId, fixtureDate: d(day), status },
    });

  it('reports Available for a clean player', async () => {
    const status = await getPlayerSuspensionStatus(playerId);
    expect(status.suspended).toBe(false);
    expect(status.label).toBe('Available');
  });

  it('reports three matches remaining after a straight red', async () => {
    const f = await fixture(1);
    await prisma.matchEvent.create({ data: { fixtureId: f.id, playerId, type: 'RED_CARD' } });
    const status = await getPlayerSuspensionStatus(playerId);
    expect(status.suspended).toBe(true);
    expect(status.label).toBe('Suspended — 3 matches remaining');
  });

  it('counts down as the club plays and returns to Available', async () => {
    const f = await fixture(1);
    await prisma.matchEvent.create({ data: { fixtureId: f.id, playerId, type: 'RED_CARD' } });

    await fixture(8);
    expect((await getPlayerSuspensionStatus(playerId)).matchesRemaining).toBe(2);

    await fixture(15);
    await fixture(22);
    const status = await getPlayerSuspensionStatus(playerId);
    expect(status.suspended).toBe(false);
    expect(status.label).toBe('Available');
  });

  it('does not serve a suspension on a fixture that has not been played', async () => {
    const f = await fixture(1);
    await prisma.matchEvent.create({ data: { fixtureId: f.id, playerId, type: 'RED_CARD' } });
    await fixture(8, 'UPCOMING');
    expect((await getPlayerSuspensionStatus(playerId)).matchesRemaining).toBe(3);
  });

  it('labels a five-yellow accumulation as Next Match', async () => {
    for (let n = 1; n <= 5; n++) {
      const f = await fixture(n);
      await prisma.matchEvent.create({ data: { fixtureId: f.id, playerId, type: 'YELLOW_CARD' } });
    }
    const status = await getPlayerSuspensionStatus(playerId);
    expect(status.active?.type).toBe('FIVE_YELLOWS');
    expect(status.label).toBe('Suspended — Next Match');
  });

  it('writes the ban into the disciplinary register and withdraws it if the card is removed', async () => {
    const f = await fixture(1);
    const event = await prisma.matchEvent.create({ data: { fixtureId: f.id, playerId, type: 'RED_CARD' } });

    await syncSuspensionCases([playerId]);
    const opened = await prisma.disciplinaryCase.findMany({ where: { playerId } });
    expect(opened).toHaveLength(1);
    expect(opened[0].suspensionType).toBe('STRAIGHT_RED');
    expect(opened[0].matchesBanned).toBe(3);

    // Referee corrects the record — the ban must go with it.
    await prisma.matchEvent.delete({ where: { id: event.id } });
    await syncSuspensionCases([playerId]);
    expect(await prisma.disciplinaryCase.count({ where: { playerId } })).toBe(0);
    expect((await getPlayerSuspensionStatus(playerId)).suspended).toBe(false);
  });

  it('is idempotent — syncing twice does not duplicate the case', async () => {
    const f = await fixture(1);
    await prisma.matchEvent.create({ data: { fixtureId: f.id, playerId, type: 'RED_CARD' } });
    await syncSuspensionCases([playerId]);
    await syncSuspensionCases([playerId]);
    expect(await prisma.disciplinaryCase.count({ where: { playerId } })).toBe(1);
  });

  it('marks the case RESOLVED once the ban has been served', async () => {
    const f = await fixture(1);
    await prisma.matchEvent.create({ data: { fixtureId: f.id, playerId, type: 'RED_CARD' } });
    await fixture(8);
    await fixture(15);
    await fixture(22);
    await syncSuspensionCases([playerId]);
    const [c] = await prisma.disciplinaryCase.findMany({ where: { playerId } });
    expect(c.status).toBe('RESOLVED');
    expect(c.matchesServed).toBe(3);
  });

  it('leaves hand-opened disciplinary cases alone', async () => {
    const manual = await prisma.disciplinaryCase.create({
      data: { playerId, clubId, reason: 'Dissent towards an official' },
    });
    const f = await fixture(1);
    await prisma.matchEvent.create({ data: { fixtureId: f.id, playerId, type: 'RED_CARD' } });
    await syncSuspensionCases([playerId]);
    expect(await prisma.disciplinaryCase.findUnique({ where: { id: manual.id } })).not.toBeNull();
    expect(await prisma.disciplinaryCase.count({ where: { playerId } })).toBe(2);
  });
});
