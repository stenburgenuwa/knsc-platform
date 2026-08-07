import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample data...');

  // Create League
  const league = await prisma.league.create({
    data: {
      name: 'Kenya National Sub County League 2026',
      description: 'Official league',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: 'ACTIVE',
    },
  });
  console.log('✅ League created:', league.name);

  // Create Clubs
  const clubs = await Promise.all([
    prisma.club.create({
      data: {
        name: 'AFC Leopards',
        leagueId: league.id,
        homeGround: 'Kasarani Stadium',
        manager: 'Patrick Aussems',
        founded: 1964,
        colours: 'Yellow and Blue',
        status: 'ACTIVE',
      },
    }),
    prisma.club.create({
      data: {
        name: 'Gor Mahia',
        leagueId: league.id,
        homeGround: 'Moi International Sports Centre',
        manager: 'Mark Harrison',
        founded: 1968,
        colours: 'Green and White',
        status: 'ACTIVE',
      },
    }),
    prisma.club.create({
      data: {
        name: 'Kaizer Chiefs',
        leagueId: league.id,
        homeGround: 'FKF Arena',
        manager: 'Arthur Zwane',
        founded: 1970,
        colours: 'Gold and Black',
        status: 'ACTIVE',
      },
    }),
    prisma.club.create({
      data: {
        name: 'Orlando Pirates',
        leagueId: league.id,
        homeGround: 'Orlando Stadium',
        manager: 'Jose Riveiro',
        founded: 1937,
        colours: 'Black and White',
        status: 'ACTIVE',
      },
    }),
    prisma.club.create({
      data: {
        name: 'Tusker FC',
        leagueId: league.id,
        homeGround: 'Moi Stadium',
        manager: 'John Kamau',
        founded: 1975,
        colours: 'Red and White',
        status: 'ACTIVE',
      },
    }),
    prisma.club.create({
      data: {
        name: 'Kariobangi Sharks',
        leagueId: league.id,
        homeGround: 'Ruaraka Grounds',
        manager: 'William Muluya',
        founded: 2011,
        colours: 'Blue and White',
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✅ ${clubs.length} clubs created`);

  // Create Players
  const players = await Promise.all([
    prisma.player.create({
      data: {
        name: 'Harambee Stars',
        clubId: clubs[0].id,
        position: 'FORWARD',
        jerseyNumber: 10,
        dateOfBirth: new Date('1995-05-15'),
        approved: true,
        goals: 12,
        yellowCards: 2,
        redCards: 0,
      },
    }),
    prisma.player.create({
      data: {
        name: 'Collins Shivachi',
        clubId: clubs[0].id,
        position: 'MIDFIELDER',
        jerseyNumber: 7,
        dateOfBirth: new Date('1998-03-22'),
        approved: true,
        goals: 8,
        yellowCards: 1,
        redCards: 0,
      },
    }),
    prisma.player.create({
      data: {
        name: 'Samuel Opiyo',
        clubId: clubs[1].id,
        position: 'FORWARD',
        jerseyNumber: 9,
        dateOfBirth: new Date('1996-07-12'),
        approved: true,
        goals: 11,
        yellowCards: 2,
        redCards: 0,
      },
    }),
    prisma.player.create({
      data: {
        name: 'Themba Zwane',
        clubId: clubs[2].id,
        position: 'FORWARD',
        jerseyNumber: 11,
        dateOfBirth: new Date('1994-09-20'),
        approved: true,
        goals: 14,
        yellowCards: 1,
        redCards: 0,
      },
    }),
  ]);
  console.log(`✅ ${players.length} players created`);

  // Create Referees
  const referees = await Promise.all([
    prisma.referee.create({
      data: {
        name: 'John Kariuki',
        leagueId: league.id,
        licenseNumber: 'KEN-REF-001',
        status: 'ACTIVE',
        yearsExperience: 15,
      },
    }),
    prisma.referee.create({
      data: {
        name: 'Michael Ng\'eno',
        leagueId: league.id,
        licenseNumber: 'KEN-REF-002',
        status: 'ACTIVE',
        yearsExperience: 12,
      },
    }),
  ]);
  console.log(`✅ ${referees.length} referees created`);

  // Create Fixtures
  const fixtures = await Promise.all([
    prisma.fixture.create({
      data: {
        leagueId: league.id,
        homeClubId: clubs[0].id,
        awayClubId: clubs[1].id,
        venue: 'Kasarani Stadium',
        kickoffTime: new Date('2026-08-10T15:00:00'),
        round: 1,
        competition: 'LEAGUE',
        status: 'UPCOMING',
      },
    }),
    prisma.fixture.create({
      data: {
        leagueId: league.id,
        homeClubId: clubs[2].id,
        awayClubId: clubs[3].id,
        venue: 'FKF Arena',
        kickoffTime: new Date('2026-08-11T16:00:00'),
        round: 1,
        competition: 'LEAGUE',
        status: 'UPCOMING',
      },
    }),
    prisma.fixture.create({
      data: {
        leagueId: league.id,
        homeClubId: clubs[0].id,
        awayClubId: clubs[2].id,
        venue: 'Kasarani Stadium',
        kickoffTime: new Date('2026-08-05T15:00:00'),
        round: 1,
        competition: 'LEAGUE',
        status: 'COMPLETED',
      },
    }),
    prisma.fixture.create({
      data: {
        leagueId: league.id,
        homeClubId: clubs[1].id,
        awayClubId: clubs[3].id,
        venue: 'Moi Centre',
        kickoffTime: new Date('2026-08-04T16:00:00'),
        round: 1,
        competition: 'LEAGUE',
        status: 'COMPLETED',
      },
    }),
  ]);
  console.log(`✅ ${fixtures.length} fixtures created`);

  // Create Match Reports
  await Promise.all([
    prisma.matchReport.create({
      data: {
        fixtureId: fixtures[2].id,
        summary: 'Exciting match with Leopards dominating',
        homeGoals: 2,
        awayGoals: 1,
        status: 'SUBMITTED',
      },
    }),
    prisma.matchReport.create({
      data: {
        fixtureId: fixtures[3].id,
        summary: 'Gor Mahia held Kaizer Chiefs',
        homeGoals: 1,
        awayGoals: 1,
        status: 'SUBMITTED',
      },
    }),
  ]);
  console.log('✅ Match reports created');

  // Create Announcements
  await Promise.all([
    prisma.announcement.create({
      data: {
        leagueId: league.id,
        title: 'Season Starts',
        content: 'The 2026 KNSCL season kicks off this weekend',
        category: 'LEAGUE',
        status: 'PUBLISHED',
      },
    }),
    prisma.announcement.create({
      data: {
        leagueId: league.id,
        title: 'Fixture Update',
        content: 'All fixtures for Round 2 confirmed',
        category: 'FIXTURES',
        status: 'PUBLISHED',
      },
    }),
  ]);
  console.log('✅ Announcements created');

  // Create Sponsors
  await Promise.all([
    prisma.sponsor.create({
      data: {
        leagueId: league.id,
        name: 'KCB Bank',
        logo: 'https://example.com/kcb.png',
        category: 'BANKING',
        status: 'ACTIVE',
      },
    }),
    prisma.sponsor.create({
      data: {
        leagueId: league.id,
        name: 'Safaricom',
        logo: 'https://example.com/safaricom.png',
        category: 'TELECOM',
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log('✅ Sponsors created');

  console.log('');
  console.log('🎉 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
