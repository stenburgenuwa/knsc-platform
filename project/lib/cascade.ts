import { PrismaClient } from '@prisma/client';

// Deleting anything in this schema means clearing its dependants first —
// Postgres foreign keys will otherwise reject the delete. Each helper runs as
// a single transaction so a failure part-way through leaves nothing orphaned.
//
// Goal tallies live denormalised on Player.goals (they're also set directly by
// the seed, so they can't simply be recomputed from MatchEvent rows). Whenever
// GOAL events are removed we decrement the scorer to keep top scorers honest.

type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

async function removeFixturesAndEvents(tx: Tx, fixtureIds: string[]) {
  if (fixtureIds.length === 0) return;

  const goalEvents = await tx.matchEvent.findMany({
    where: { fixtureId: { in: fixtureIds }, type: 'GOAL' },
    select: { playerId: true },
  });

  const goalsByPlayer = new Map<string, number>();
  for (const { playerId } of goalEvents) {
    goalsByPlayer.set(playerId, (goalsByPlayer.get(playerId) ?? 0) + 1);
  }

  await tx.matchEvent.deleteMany({ where: { fixtureId: { in: fixtureIds } } });
  await tx.refereeAssignment.deleteMany({ where: { fixtureId: { in: fixtureIds } } });

  const teamSheets = await tx.teamSheet.findMany({ where: { fixtureId: { in: fixtureIds } }, select: { id: true } });
  if (teamSheets.length > 0) {
    await tx.teamSheetEntry.deleteMany({ where: { teamSheetId: { in: teamSheets.map((s) => s.id) } } });
    await tx.teamSheet.deleteMany({ where: { id: { in: teamSheets.map((s) => s.id) } } });
  }

  for (const [playerId, count] of goalsByPlayer) {
    await tx.player.update({ where: { id: playerId }, data: { goals: { decrement: count } } });
  }

  await tx.fixture.deleteMany({ where: { id: { in: fixtureIds } } });
}

export async function deleteFixtureCascade(prisma: PrismaClient, fixtureId: string) {
  await prisma.$transaction(async (tx) => {
    await removeFixturesAndEvents(tx as Tx, [fixtureId]);
  });
}

export async function deletePlayerCascade(prisma: PrismaClient, playerId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.matchEvent.deleteMany({ where: { playerId } });
    await tx.teamSheetEntry.deleteMany({ where: { playerId } });
    await tx.disciplinaryCase.deleteMany({ where: { playerId } });
    await tx.player.delete({ where: { id: playerId } });
  });
}

export async function deleteUserCascade(prisma: PrismaClient, userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.refereeAssignment.deleteMany({ where: { refereeId: userId } });
    await tx.user.delete({ where: { id: userId } });
  });
}

export async function deleteClubCascade(prisma: PrismaClient, clubId: string) {
  await prisma.$transaction(async (tx) => {
    const fixtures = await tx.fixture.findMany({
      where: { OR: [{ homeClubId: clubId }, { awayClubId: clubId }] },
      select: { id: true },
    });
    await removeFixturesAndEvents(tx as Tx, fixtures.map((f) => f.id));

    // Any remaining events belonging to this club's players (defensive — the
    // events API only allows events on fixtures the player's club is in).
    const players = await tx.player.findMany({ where: { clubId }, select: { id: true } });
    if (players.length > 0) {
      await tx.matchEvent.deleteMany({ where: { playerId: { in: players.map((p) => p.id) } } });
      await tx.teamSheetEntry.deleteMany({ where: { playerId: { in: players.map((p) => p.id) } } });
    }
    await tx.disciplinaryCase.deleteMany({ where: { clubId } });
    await tx.player.deleteMany({ where: { clubId } });

    // Team managers survive the club; they just become unassigned.
    await tx.user.updateMany({ where: { clubId }, data: { clubId: null } });

    await tx.club.delete({ where: { id: clubId } });
  });
}

// Typed exactly by the operator to unlock the wipe-everything action.
export const RESET_CONFIRMATION = 'DELETE ALL DATA';

export interface ResetSummary {
  clubs: number;
  players: number;
  fixtures: number;
  users: number;
  announcements: number;
  venues: number;
}

// Wipes league data so a real season can be entered from scratch. The acting
// owner's own account is kept, otherwise they would lock themselves out.
export async function resetAllData(prisma: PrismaClient, preserveUserId: string): Promise<ResetSummary> {
  return prisma.$transaction(async (tx) => {
    const [clubs, players, fixtures, users, announcements, venues] = await Promise.all([
      tx.club.count(),
      tx.player.count(),
      tx.fixture.count(),
      tx.user.count({ where: { id: { not: preserveUserId } } }),
      tx.announcement.count(),
      tx.venue.count(),
    ]);

    await tx.matchEvent.deleteMany();
    await tx.refereeAssignment.deleteMany();
    await tx.teamSheetEntry.deleteMany();
    await tx.teamSheet.deleteMany();
    await tx.disciplinaryCase.deleteMany();
    await tx.fixture.deleteMany();
    await tx.player.deleteMany();
    await tx.user.updateMany({ data: { clubId: null } });
    await tx.user.deleteMany({ where: { id: { not: preserveUserId } } });
    await tx.club.deleteMany();
    await tx.venue.deleteMany();
    await tx.announcement.deleteMany();

    return { clubs, players, fixtures, users, announcements, venues };
  });
}
