import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { GET as getCases, POST as postCase } from '../app/api/disciplinary/route';
import { PATCH as patchCase, DELETE as deleteCase } from '../app/api/disciplinary/[id]/route';
import { deletePlayerCascade, deleteClubCascade } from '../lib/cascade';

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

describe('Disciplinary cases', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('a League Manager can open a disciplinary case for a player', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const player = await prisma.player.create({ data: { clubId: club.id, firstName: 'Brian', lastName: 'Kazungu' } });
    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
    });
    const token = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });

    const res = await postCase(req('POST', 'http://localhost/x', { playerId: player.id, reason: 'Red card — violent conduct' }, token));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.status).toBe('OPEN');
    expect(body.data.clubId).toBe(club.id);
  });

  it('a Team Manager cannot open a disciplinary case', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const player = await prisma.player.create({ data: { clubId: club.id, firstName: 'Brian', lastName: 'Kazungu' } });
    const tm = await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'TEAM_MANAGER', clubId: club.id },
    });
    const token = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER', clubId: club.id });

    const res = await postCase(req('POST', 'http://localhost/x', { playerId: player.id, reason: 'x' }, token));
    expect(res.status).toBe(403);
  });

  it('a League Manager can resolve a case, and GET filters by status', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const player = await prisma.player.create({ data: { clubId: club.id, firstName: 'Brian', lastName: 'Kazungu' } });
    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
    });
    const token = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });
    const created = await postCase(req('POST', 'http://localhost/x', { playerId: player.id, reason: 'x' }, token));
    const { data: c } = await created.json();

    await patchCase(req('PATCH', 'http://localhost/x', { status: 'RESOLVED', decision: 'One-match ban' }, token), { params: { id: c.id } });

    const resolvedRes = await getCases(req('GET', 'http://localhost/api/disciplinary?status=RESOLVED', undefined, token));
    const resolvedBody = await resolvedRes.json();
    expect(resolvedBody.data).toHaveLength(1);

    const openRes = await getCases(req('GET', 'http://localhost/api/disciplinary?status=OPEN', undefined, token));
    const openBody = await openRes.json();
    expect(openBody.data).toHaveLength(0);
  });

  it('only a Platform Owner can delete a disciplinary case', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const player = await prisma.player.create({ data: { clubId: club.id, firstName: 'Brian', lastName: 'Kazungu' } });
    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
    });
    const lmToken = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });
    const created = await postCase(req('POST', 'http://localhost/x', { playerId: player.id, reason: 'x' }, lmToken));
    const { data: c } = await created.json();

    const forbidden = await deleteCase(req('DELETE', 'http://localhost/x', undefined, lmToken), { params: { id: c.id } });
    expect(forbidden.status).toBe(403);

    const owner = await prisma.user.create({
      data: { email: 'owner@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'PLATFORM_OWNER' },
    });
    const ownerToken = signAccessToken({ sub: owner.id, email: owner.email, role: 'PLATFORM_OWNER' });
    const ok = await deleteCase(req('DELETE', 'http://localhost/x', undefined, ownerToken), { params: { id: c.id } });
    expect(ok.status).toBe(200);
  });

  it('deleting a player also clears their disciplinary cases', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const player = await prisma.player.create({ data: { clubId: club.id, firstName: 'Brian', lastName: 'Kazungu' } });
    await prisma.disciplinaryCase.create({ data: { playerId: player.id, clubId: club.id, reason: 'x' } });

    await deletePlayerCascade(prisma, player.id);

    expect(await prisma.disciplinaryCase.count()).toBe(0);
  });

  it('deleting a club also clears its players\' disciplinary cases', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const player = await prisma.player.create({ data: { clubId: club.id, firstName: 'Brian', lastName: 'Kazungu' } });
    await prisma.disciplinaryCase.create({ data: { playerId: player.id, clubId: club.id, reason: 'x' } });

    await deleteClubCascade(prisma, club.id);

    expect(await prisma.disciplinaryCase.count()).toBe(0);
    expect(await prisma.club.count()).toBe(0);
  });
});
