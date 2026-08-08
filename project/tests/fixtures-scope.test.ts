import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { DELETE as deleteFixture, PATCH as patchFixture } from '../app/api/fixtures/[id]/route';
import { GET as getFixtures } from '../app/api/fixtures/route';

function req(method: string, url: string, body?: any, token?: string) {
  return new NextRequest(url, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function buildFixture() {
  const [home, away] = await Promise.all([
    prisma.club.create({ data: { name: 'Malindi United' } }),
    prisma.club.create({ data: { name: 'Mtwapa FC' } }),
  ]);
  return prisma.fixture.create({ data: { homeClubId: home.id, awayClubId: away.id, fixtureDate: new Date() } });
}

describe('Fixture route permission scoping', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('a League Manager can edit a fixture but cannot delete it', async () => {
    const fixture = await buildFixture();
    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
    });
    const token = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });

    const patchRes = await patchFixture(req('PATCH', 'http://localhost/x', { status: 'POSTPONED' }, token), { params: { id: fixture.id } });
    expect(patchRes.status).toBe(200);

    const deleteRes = await deleteFixture(req('DELETE', 'http://localhost/x', undefined, token), { params: { id: fixture.id } });
    expect(deleteRes.status).toBe(403);
    expect(await prisma.fixture.findUnique({ where: { id: fixture.id } })).not.toBeNull();
  });

  it('a Platform Owner can delete a fixture', async () => {
    const fixture = await buildFixture();
    const owner = await prisma.user.create({
      data: { email: 'owner@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'PLATFORM_OWNER' },
    });
    const token = signAccessToken({ sub: owner.id, email: owner.email, role: 'PLATFORM_OWNER' });

    const res = await deleteFixture(req('DELETE', 'http://localhost/x', undefined, token), { params: { id: fixture.id } });
    expect(res.status).toBe(200);
    expect(await prisma.fixture.findUnique({ where: { id: fixture.id } })).toBeNull();
  });

  it('GET /api/fixtures filters by reportStatus', async () => {
    const [home, away] = await Promise.all([
      prisma.club.create({ data: { name: 'Malindi United' } }),
      prisma.club.create({ data: { name: 'Mtwapa FC' } }),
    ]);
    await prisma.fixture.create({ data: { homeClubId: home.id, awayClubId: away.id, fixtureDate: new Date(), reportStatus: 'SUBMITTED', status: 'COMPLETED' } });
    await prisma.fixture.create({ data: { homeClubId: home.id, awayClubId: away.id, fixtureDate: new Date() } });

    const res = await getFixtures(req('GET', 'http://localhost/api/fixtures?status=all&reportStatus=SUBMITTED'));
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].reportStatus).toBe('SUBMITTED');
  });
});
