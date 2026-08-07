import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface SeedResult {
  clubsCreated: number;
  usersCreated: number;
  password: string;
}

// Populates a fresh database with Kilifi North demo data: venues, clubs,
// players, fixtures/results, a referee assignment, news, and one login per
// role (all sharing `password`). Shared by the CLI seed script
// (prisma/seed.ts) and the one-time HTTPS setup endpoint
// (app/api/admin/seed/route.ts) so there's exactly one place this data is
// defined.
export async function seedDatabase(prisma: PrismaClient, password: string): Promise<SeedResult> {
  const venues = await Promise.all(
    [
      { name: 'Malindi Municipal Stadium', location: 'Malindi' },
      { name: 'Mtwapa Grounds', location: 'Mtwapa' },
      { name: 'Kilifi Township Stadium', location: 'Kilifi Town' },
      { name: 'Watamu Community Field', location: 'Watamu' },
    ].map((v) => prisma.venue.create({ data: v }))
  );

  const clubDefs = [
    { name: 'Malindi United', shortName: 'MUT', yearFounded: 2009, homeVenueId: venues[0].id },
    { name: 'Mtwapa FC', shortName: 'MTW', yearFounded: 2012, homeVenueId: venues[1].id },
    { name: 'Kilifi Township FC', shortName: 'KTF', yearFounded: 2005, homeVenueId: venues[2].id },
    { name: 'Watamu FC', shortName: 'WAT', yearFounded: 2015, homeVenueId: venues[3].id },
    { name: 'Ganze Sports Club', shortName: 'GSC', yearFounded: 2010, homeVenueId: venues[2].id },
    { name: 'Marereni United', shortName: 'MAR', yearFounded: 2013, homeVenueId: venues[0].id },
    { name: 'Sokoke Rangers', shortName: 'SOK', yearFounded: 2011, homeVenueId: venues[2].id },
    { name: 'Kaloleni Youth FC', shortName: 'KYF', yearFounded: 2014, homeVenueId: venues[1].id },
  ];
  const clubs = await Promise.all(clubDefs.map((c) => prisma.club.create({ data: c })));
  const clubByName = Object.fromEntries(clubs.map((c) => [c.name, c]));

  const passwordHash = await bcrypt.hash(password, 10);

  const users = await Promise.all([
    prisma.user.create({
      data: { email: 'owner@knscl.co.ke', passwordHash, firstName: 'Grace', lastName: 'Mwangovya', role: 'PLATFORM_OWNER' },
    }),
    prisma.user.create({
      data: { email: 'league.manager@knscl.co.ke', passwordHash, firstName: 'Daniel', lastName: 'Katana', role: 'LEAGUE_MANAGER' },
    }),
    prisma.user.create({
      data: {
        email: 'team.manager@knscl.co.ke',
        passwordHash,
        firstName: 'Fatuma',
        lastName: 'Baya',
        role: 'TEAM_MANAGER',
        clubId: clubByName['Malindi United'].id,
      },
    }),
    prisma.user.create({
      data: { email: 'referee@knscl.co.ke', passwordHash, firstName: 'Samuel', lastName: 'Charo', role: 'REFEREE' },
    }),
    prisma.user.create({
      data: { email: 'referee.manager@knscl.co.ke', passwordHash, firstName: 'Peter', lastName: 'Kadenge', role: 'REFEREE_MANAGER' },
    }),
  ]);
  const referee = users.find((u) => u.role === 'REFEREE')!;

  const playerNames: Record<string, [string, string][]> = {
    'Malindi United': [['Brian', 'Kazungu'], ['Elvis', 'Mwakio'], ['Josephat', 'Kahindi'], ['Omar', 'Salim']],
    'Mtwapa FC': [['Kelvin', 'Chengo'], ['Hassan', 'Ali'], ['Dennis', 'Baraka']],
    'Kilifi Township FC': [['Victor', 'Kalama'], ['Amani', 'Ngala']],
    'Watamu FC': [['Ibrahim', 'Juma'], ['Collins', 'Kadzo']],
  };
  let jersey = 1;
  for (const [clubName, names] of Object.entries(playerNames)) {
    let n = 7;
    for (const [firstName, lastName] of names) {
      await prisma.player.create({
        data: {
          clubId: clubByName[clubName].id,
          firstName,
          lastName,
          playerNumber: (jersey % 23) + 1,
          position: 'Forward',
          goals: Math.max(0, 12 - n),
          approved: true,
        },
      });
      jersey += 3;
      n -= 2;
    }
  }

  const completed = [
    { home: 'Malindi United', away: 'Mtwapa FC', homeScore: 2, awayScore: 0, daysAgo: 2, venue: 0 },
    { home: 'Kilifi Township FC', away: 'Watamu FC', homeScore: 1, awayScore: 1, daysAgo: 6, venue: 2 },
    { home: 'Ganze Sports Club', away: 'Marereni United', homeScore: 0, awayScore: 2, daysAgo: 9, venue: 2 },
    { home: 'Sokoke Rangers', away: 'Kaloleni Youth FC', homeScore: 3, awayScore: 1, daysAgo: 13, venue: 2 },
  ];
  for (const m of completed) {
    await prisma.fixture.create({
      data: {
        homeClubId: clubByName[m.home].id,
        awayClubId: clubByName[m.away].id,
        venueId: venues[m.venue].id,
        fixtureDate: new Date(Date.now() - m.daysAgo * 86400000),
        kickoffTime: '15:00',
        status: 'COMPLETED',
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      },
    });
  }

  const upcoming = [
    { home: 'Mtwapa FC', away: 'Ganze Sports Club', daysAhead: 3, venue: 1 },
    { home: 'Watamu FC', away: 'Malindi United', daysAhead: 5, venue: 3 },
    { home: 'Marereni United', away: 'Kilifi Township FC', daysAhead: 7, venue: 0 },
  ];
  const upcomingFixtures = [];
  for (const m of upcoming) {
    const fixture = await prisma.fixture.create({
      data: {
        homeClubId: clubByName[m.home].id,
        awayClubId: clubByName[m.away].id,
        venueId: venues[m.venue].id,
        fixtureDate: new Date(Date.now() + m.daysAhead * 86400000),
        kickoffTime: '15:00',
        status: 'UPCOMING',
      },
    });
    upcomingFixtures.push(fixture);
  }

  await prisma.refereeAssignment.create({
    data: { fixtureId: upcomingFixtures[0].id, refereeId: referee.id, status: 'ASSIGNED' },
  });

  await prisma.announcement.create({
    data: {
      title: 'Malindi United extends unbeaten run to five matches',
      message:
        'With a commanding 2–0 victory over Mtwapa FC last Saturday, Malindi United continues to dominate the Kilifi North standings. The victory extends their unbeaten run and cements their position atop the table with 13 points from five matches, setting a strong pace for the season.',
      startDate: new Date(Date.now() - 2 * 86400000),
    },
  });
  await prisma.announcement.create({
    data: {
      title: 'Referee assignments published for matchday 6',
      message: 'The Referee Manager has published match officials for the upcoming round of fixtures.',
      startDate: new Date(Date.now() - 1 * 86400000),
    },
  });
  await prisma.announcement.create({
    data: {
      title: 'Club registration window opens for new season',
      message: 'Clubs wishing to register or update their squad list should contact the League Manager before kickoff.',
      startDate: new Date(),
    },
  });

  return { clubsCreated: clubs.length, usersCreated: users.length, password };
}
