import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { resetTestDb } from './db-helpers';
import {
  deleteClubCascade,
  deleteFixtureCascade,
  deletePlayerCascade,
  deleteUserCascade,
  resetAllData,
} from '../lib/cascade';

async function buildLeague() {
  const venue = await prisma.venue.create({ data: { name: 'Malindi Municipal Stadium' } });
  const [home, away] = await Promise.all([
    prisma.club.create({ data: { name: 'Malindi United' } }),
    prisma.club.create({ data: { name: 'Mtwapa FC' } }),
  ]);

  const [scorer, opponent] = await Promise.all([
    prisma.player.create({ data: { clubId: home.id, firstName: 'Brian', lastName: 'Kazungu', goals: 5 } }),
    prisma.player.create({ data: { clubId: away.id, firstName: 'Kelvin', lastName: 'Chengo', goals: 3 } }),
  ]);

  const referee = await prisma.user.create({
    data: {
      email: 'ref@knscl.co.ke',
      passwordHash: await bcrypt.hash('x', 4),
      firstName: 'Samuel',
      lastName: 'Charo',
      role: 'REFEREE',
    },
  });
  const teamManager = await prisma.user.create({
    data: {
      email: 'tm@knscl.co.ke',
      passwordHash: await bcrypt.hash('x', 4),
      firstName: 'Fatuma',
      lastName: 'Baya',
      role: 'TEAM_MANAGER',
      clubId: home.id,
    },
  });

  const fixture = await prisma.fixture.create({
    data: { homeClubId: home.id, awayClubId: away.id, venueId: venue.id, fixtureDate: new Date() },
  });
  await prisma.refereeAssignment.create({ data: { fixtureId: fixture.id, refereeId: referee.id } });
  await prisma.matchEvent.create({ data: { fixtureId: fixture.id, playerId: scorer.id, type: 'GOAL', minute: 10 } });
  await prisma.matchEvent.create({ data: { fixtureId: fixture.id, playerId: scorer.id, type: 'GOAL', minute: 40 } });
  await prisma.matchEvent.create({ data: { fixtureId: fixture.id, playerId: opponent.id, type: 'YELLOW_CARD', minute: 55 } });

  return { venue, home, away, scorer, opponent, referee, teamManager, fixture };
}

describe('cascade deletes', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('deleting a fixture clears its events and assignment', async () => {
    const { fixture } = await buildLeague();

    await deleteFixtureCascade(prisma, fixture.id);

    expect(await prisma.fixture.count()).toBe(0);
    expect(await prisma.matchEvent.count()).toBe(0);
    expect(await prisma.refereeAssignment.count()).toBe(0);
  });

  it('deleting a fixture returns the scorer\'s goal tally to its pre-match value', async () => {
    const { fixture, scorer } = await buildLeague();

    await deleteFixtureCascade(prisma, fixture.id);

    const after = await prisma.player.findUniqueOrThrow({ where: { id: scorer.id } });
    expect(after.goals).toBe(3); // started at 5, two GOAL events removed
  });

  it('deleting a fixture leaves both clubs and their players intact', async () => {
    const { fixture } = await buildLeague();

    await deleteFixtureCascade(prisma, fixture.id);

    expect(await prisma.club.count()).toBe(2);
    expect(await prisma.player.count()).toBe(2);
  });

  it('deleting a player clears their match events', async () => {
    const { scorer } = await buildLeague();

    await deletePlayerCascade(prisma, scorer.id);

    expect(await prisma.player.findUnique({ where: { id: scorer.id } })).toBeNull();
    expect(await prisma.matchEvent.count({ where: { playerId: scorer.id } })).toBe(0);
    // The opponent's yellow card is untouched.
    expect(await prisma.matchEvent.count()).toBe(1);
  });

  it('deleting a referee clears their assignments but keeps the fixture', async () => {
    const { referee, fixture } = await buildLeague();

    await deleteUserCascade(prisma, referee.id);

    expect(await prisma.user.findUnique({ where: { id: referee.id } })).toBeNull();
    expect(await prisma.refereeAssignment.count()).toBe(0);
    expect(await prisma.fixture.findUnique({ where: { id: fixture.id } })).not.toBeNull();
  });

  it('deleting a club removes its players and every fixture it appeared in', async () => {
    const { home } = await buildLeague();

    await deleteClubCascade(prisma, home.id);

    expect(await prisma.club.count()).toBe(1);
    expect(await prisma.fixture.count()).toBe(0);
    expect(await prisma.matchEvent.count()).toBe(0);
    expect(await prisma.refereeAssignment.count()).toBe(0);
    expect(await prisma.player.count()).toBe(1); // only the away club's player survives
  });

  it('deleting a club unassigns its team manager rather than deleting the account', async () => {
    const { home, teamManager } = await buildLeague();

    await deleteClubCascade(prisma, home.id);

    const after = await prisma.user.findUniqueOrThrow({ where: { id: teamManager.id } });
    expect(after.clubId).toBeNull();
    expect(after.role).toBe('TEAM_MANAGER');
  });

  it('deleting a club corrects the surviving opponent\'s goal tally', async () => {
    const { home, opponent } = await buildLeague();
    await prisma.matchEvent.create({
      data: {
        fixtureId: (await prisma.fixture.findFirstOrThrow()).id,
        playerId: opponent.id,
        type: 'GOAL',
        minute: 70,
      },
    });
    await prisma.player.update({ where: { id: opponent.id }, data: { goals: { increment: 1 } } });

    await deleteClubCascade(prisma, home.id);

    const after = await prisma.player.findUniqueOrThrow({ where: { id: opponent.id } });
    expect(after.goals).toBe(3); // back to its pre-match value
  });
});

describe('resetAllData', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('clears the league but keeps the acting owner signed-in-able', async () => {
    const { teamManager } = await buildLeague();
    const owner = await prisma.user.create({
      data: {
        email: 'owner@knscl.co.ke',
        passwordHash: await bcrypt.hash('x', 4),
        firstName: 'Grace',
        lastName: 'Mwangovya',
        role: 'PLATFORM_OWNER',
      },
    });

    const summary = await resetAllData(prisma, owner.id);

    expect(await prisma.club.count()).toBe(0);
    expect(await prisma.player.count()).toBe(0);
    expect(await prisma.fixture.count()).toBe(0);
    expect(await prisma.matchEvent.count()).toBe(0);
    expect(await prisma.venue.count()).toBe(0);

    const remaining = await prisma.user.findMany();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(owner.id);
    expect(await prisma.user.findUnique({ where: { id: teamManager.id } })).toBeNull();

    expect(summary.clubs).toBe(2);
    expect(summary.players).toBe(2);
  });
});
