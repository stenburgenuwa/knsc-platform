import { prisma } from '../lib/prisma';

export async function resetTestDb() {
  await prisma.$transaction([
    prisma.refereeAssignment.deleteMany(),
    prisma.fixture.deleteMany(),
    prisma.player.deleteMany(),
    prisma.user.deleteMany(),
    prisma.club.deleteMany(),
    prisma.venue.deleteMany(),
    prisma.announcement.deleteMany(),
  ]);
}
