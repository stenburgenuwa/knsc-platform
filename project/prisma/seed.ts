import { PrismaClient } from '@prisma/client';
import { seedDatabase } from '../lib/seed-data';

const prisma = new PrismaClient();

const DEFAULT_DEMO_PASSWORD = 'Password123!';
const DATABASE_URL = process.env.DATABASE_URL || '';
const isLocalDb = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');

if (!isLocalDb && !process.env.SEED_PASSWORD) {
  throw new Error(
    'Refusing to seed a non-local database with the well-known demo password. ' +
      'Set SEED_PASSWORD to a strong password before running `npm run seed` against production ' +
      '(all 5 seeded accounts will share it — rotate individually afterwards if needed).'
  );
}

const DEMO_PASSWORD = process.env.SEED_PASSWORD || DEFAULT_DEMO_PASSWORD;

async function main() {
  console.log('Seeding Kilifi North Sub County League data...');

  await prisma.matchEvent.deleteMany();
  await prisma.refereeAssignment.deleteMany();
  await prisma.teamSheetEntry.deleteMany();
  await prisma.teamSheet.deleteMany();
  await prisma.disciplinaryCase.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.player.deleteMany();
  await prisma.user.updateMany({ data: { clubId: null } });
  await prisma.user.deleteMany();
  await prisma.club.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.download.deleteMany();

  const result = await seedDatabase(prisma, DEMO_PASSWORD);

  console.log('Seed complete.');
  console.log(`${result.clubsCreated} clubs, ${result.usersCreated} users, demo password: ${result.password}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
