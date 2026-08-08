import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { PATCH as submitResult } from '../app/api/fixtures/[id]/result/route';
import { PATCH as reviewReport } from '../app/api/fixtures/[id]/report/route';
import { POST as postEvent } from '../app/api/fixtures/[id]/events/route';

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

async function buildAssignedFixture() {
  const [home, away] = await Promise.all([
    prisma.club.create({ data: { name: 'Malindi United' } }),
    prisma.club.create({ data: { name: 'Mtwapa FC' } }),
  ]);
  const scorer = await prisma.player.create({ data: { clubId: home.id, firstName: 'Brian', lastName: 'Kazungu' } });
  const referee = await prisma.user.create({
    data: { email: 'ref@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'REFEREE' },
  });
  const fixture = await prisma.fixture.create({ data: { homeClubId: home.id, awayClubId: away.id, fixtureDate: new Date() } });
  await prisma.refereeAssignment.create({ data: { fixtureId: fixture.id, refereeId: referee.id, status: 'ACCEPTED' } });
  const refToken = signAccessToken({ sub: referee.id, email: referee.email, role: 'REFEREE' });
  return { home, away, scorer, referee, fixture, refToken };
}

describe('Match report submit/lock/review workflow', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('a referee submitting a result puts the report into SUBMITTED and locks event edits', async () => {
    const { fixture, refToken, scorer } = await buildAssignedFixture();

    const res = await submitResult(
      req('PATCH', 'http://localhost/x', { homeScore: 2, awayScore: 1 }, refToken),
      { params: { id: fixture.id } }
    );
    const body = await res.json();
    expect(body.data.reportStatus).toBe('SUBMITTED');

    const eventRes = await postEvent(
      req('POST', 'http://localhost/x', { playerId: scorer.id, type: 'GOAL' }, refToken),
      { params: { id: fixture.id } }
    );
    expect(eventRes.status).toBe(409);
  });

  it('a Platform Owner or League Manager entering a score is auto-approved with no review needed', async () => {
    const { fixture } = await buildAssignedFixture();
    const owner = await prisma.user.create({
      data: { email: 'owner@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'PLATFORM_OWNER' },
    });
    const token = signAccessToken({ sub: owner.id, email: owner.email, role: 'PLATFORM_OWNER' });

    const res = await submitResult(req('PATCH', 'http://localhost/x', { homeScore: 2, awayScore: 1 }, token), { params: { id: fixture.id } });
    const body = await res.json();
    expect(body.data.reportStatus).toBe('APPROVED');
  });

  it('a League Manager can approve a submitted report', async () => {
    const { fixture, refToken } = await buildAssignedFixture();
    await submitResult(req('PATCH', 'http://localhost/x', { homeScore: 2, awayScore: 1 }, refToken), { params: { id: fixture.id } });

    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
    });
    const lmToken = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });

    const res = await reviewReport(req('PATCH', 'http://localhost/x', { action: 'APPROVE' }, lmToken), { params: { id: fixture.id } });
    const body = await res.json();
    expect(body.data.reportStatus).toBe('APPROVED');
  });

  it('a League Manager returning a report unlocks the referee to fix events and resubmit', async () => {
    const { fixture, refToken, scorer } = await buildAssignedFixture();
    await submitResult(req('PATCH', 'http://localhost/x', { homeScore: 2, awayScore: 1 }, refToken), { params: { id: fixture.id } });

    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
    });
    const lmToken = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });
    await reviewReport(req('PATCH', 'http://localhost/x', { action: 'RETURN', notes: 'Score looks wrong' }, lmToken), { params: { id: fixture.id } });

    const eventRes = await postEvent(req('POST', 'http://localhost/x', { playerId: scorer.id, type: 'GOAL' }, refToken), { params: { id: fixture.id } });
    expect(eventRes.status).toBe(201);

    const resubmitRes = await submitResult(req('PATCH', 'http://localhost/x', { homeScore: 3, awayScore: 1 }, refToken), { params: { id: fixture.id } });
    const body = await resubmitRes.json();
    expect(body.data.reportStatus).toBe('SUBMITTED');
  });

  it('cannot review a report that has not been submitted', async () => {
    const { fixture } = await buildAssignedFixture();
    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
    });
    const lmToken = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });

    const res = await reviewReport(req('PATCH', 'http://localhost/x', { action: 'APPROVE' }, lmToken), { params: { id: fixture.id } });
    expect(res.status).toBe(409);
  });

  it('a referee cannot change an already-approved report', async () => {
    const { fixture, refToken } = await buildAssignedFixture();
    await submitResult(req('PATCH', 'http://localhost/x', { homeScore: 2, awayScore: 1 }, refToken), { params: { id: fixture.id } });
    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
    });
    const lmToken = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });
    await reviewReport(req('PATCH', 'http://localhost/x', { action: 'APPROVE' }, lmToken), { params: { id: fixture.id } });

    const res = await submitResult(req('PATCH', 'http://localhost/x', { homeScore: 5, awayScore: 5 }, refToken), { params: { id: fixture.id } });
    expect(res.status).toBe(409);
  });
});
