import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { GET as getPlayers } from '../app/api/players/route';

async function seedTwoClubsWithPendingPlayers() {
  const [clubA, clubB] = await Promise.all([
    prisma.club.create({ data: { name: 'Malindi United' } }),
    prisma.club.create({ data: { name: 'Mtwapa FC' } }),
  ]);
  await prisma.player.create({
    data: { clubId: clubA.id, firstName: 'A-Pending', lastName: 'Player', approved: false },
  });
  await prisma.player.create({
    data: { clubId: clubB.id, firstName: 'B-Pending', lastName: 'Player', approved: false },
  });
  return { clubA, clubB };
}

function playersRequest(query: string, token?: string) {
  return new NextRequest(`http://localhost/api/players${query}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

describe('GET /api/players visibility scoping', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('never returns unapproved players to an unauthenticated request', async () => {
    await seedTwoClubsWithPendingPlayers();
    const res = await getPlayers(playersRequest('?includePending=true'));
    const body = await res.json();
    expect(body.data).toHaveLength(0);
  });

  it("a Team Manager only sees their own club's pending players, even without passing clubId", async () => {
    const { clubA } = await seedTwoClubsWithPendingPlayers();
    const token = signAccessToken({ sub: 'tm-1', email: 'tm@knscl.co.ke', role: 'TEAM_MANAGER', clubId: clubA.id });

    const res = await getPlayers(playersRequest('?includePending=true', token));
    const body = await res.json();

    expect(body.data).toHaveLength(1);
    expect(body.data[0].firstName).toBe('A-Pending');
  });

  it('a Team Manager cannot see another club\'s pending players by passing its clubId explicitly', async () => {
    const { clubA, clubB } = await seedTwoClubsWithPendingPlayers();
    const token = signAccessToken({ sub: 'tm-1', email: 'tm@knscl.co.ke', role: 'TEAM_MANAGER', clubId: clubA.id });

    const res = await getPlayers(playersRequest(`?includePending=true&clubId=${clubB.id}`, token));
    const body = await res.json();

    // Falls back to approved-only for the club it's not scoped to, so the
    // unapproved B-Pending player must not leak through.
    expect(body.data.find((p: any) => p.firstName === 'B-Pending')).toBeUndefined();
  });

  it('a League Manager sees pending players across every club', async () => {
    await seedTwoClubsWithPendingPlayers();
    const token = signAccessToken({ sub: 'lm-1', email: 'lm@knscl.co.ke', role: 'LEAGUE_MANAGER' });

    const res = await getPlayers(playersRequest('?includePending=true', token));
    const body = await res.json();

    expect(body.data).toHaveLength(2);
  });
});
