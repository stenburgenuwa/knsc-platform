import { prisma } from '../lib/prisma';

// Order matters: children before parents, or Postgres rejects the delete on a
// foreign key. Users are unlinked from clubs before clubs are removed.
export async function resetTestDb() {
  await prisma.$transaction([
    prisma.matchEvent.deleteMany(),
    prisma.refereeAssignment.deleteMany(),
    prisma.teamSheetEntry.deleteMany(),
    prisma.teamSheet.deleteMany(),
    prisma.disciplinaryCase.deleteMany(),
    prisma.fixture.deleteMany(),
    prisma.player.deleteMany(),
    prisma.user.updateMany({ data: { clubId: null } }),
    prisma.user.deleteMany(),
    prisma.club.deleteMany(),
    prisma.venue.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.auditLog.deleteMany(),
  ]);
  // Registration numbers are drawn from a global Postgres sequence, not tied
  // to any row, so it has to be reset independently for deterministic tests.
  await prisma.$executeRawUnsafe('ALTER SEQUENCE player_registration_seq RESTART WITH 1');
}
