import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { POST as createUser } from '../app/api/users/route';
import { PATCH as patchUser, DELETE as deleteUser } from '../app/api/users/[id]/route';

function req(method: string, body?: any, token?: string) {
  return new NextRequest('http://localhost/api/users', {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function createReferee() {
  return prisma.user.create({
    data: {
      email: 'ref@knscl.co.ke',
      passwordHash: await bcrypt.hash('x', 4),
      firstName: 'Samuel',
      lastName: 'Charo',
      role: 'REFEREE',
    },
  });
}

describe('Referee Manager scoping on /api/users', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('a Referee Manager can register a new referee account', async () => {
    const token = signAccessToken({ sub: 'rm-1', email: 'rm@knscl.co.ke', role: 'REFEREE_MANAGER' });

    const res = await createUser(
      req('POST', { email: 'new-ref@knscl.co.ke', firstName: 'Peter', lastName: 'Mwakio', role: 'REFEREE' }, token)
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.role).toBe('REFEREE');
  });

  it('a Referee Manager cannot register a non-referee account', async () => {
    const token = signAccessToken({ sub: 'rm-1', email: 'rm@knscl.co.ke', role: 'REFEREE_MANAGER' });

    const res = await createUser(
      req('POST', { email: 'sneaky@knscl.co.ke', firstName: 'Sly', lastName: 'Fox', role: 'LEAGUE_MANAGER' }, token)
    );

    expect(res.status).toBe(403);
  });

  it('a Referee Manager can edit an existing referee', async () => {
    const referee = await createReferee();
    const token = signAccessToken({ sub: 'rm-1', email: 'rm@knscl.co.ke', role: 'REFEREE_MANAGER' });

    const res = await patchUser(req('PATCH', { firstName: 'Sammy' }, token), { params: { id: referee.id } });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.firstName).toBe('Sammy');
  });

  it('a Referee Manager cannot promote a referee to another role', async () => {
    const referee = await createReferee();
    const token = signAccessToken({ sub: 'rm-1', email: 'rm@knscl.co.ke', role: 'REFEREE_MANAGER' });

    const res = await patchUser(req('PATCH', { role: 'LEAGUE_MANAGER' }, token), { params: { id: referee.id } });

    expect(res.status).toBe(403);
  });

  it('a Referee Manager cannot edit a non-referee account', async () => {
    const teamManager = await prisma.user.create({
      data: {
        email: 'tm@knscl.co.ke',
        passwordHash: await bcrypt.hash('x', 4),
        firstName: 'Fatuma',
        lastName: 'Baya',
        role: 'TEAM_MANAGER',
      },
    });
    const token = signAccessToken({ sub: 'rm-1', email: 'rm@knscl.co.ke', role: 'REFEREE_MANAGER' });

    const res = await patchUser(req('PATCH', { firstName: 'Nope' }, token), { params: { id: teamManager.id } });

    expect(res.status).toBe(403);
  });

  it('a Referee Manager can delete a referee account', async () => {
    const referee = await createReferee();
    const token = signAccessToken({ sub: 'rm-1', email: 'rm@knscl.co.ke', role: 'REFEREE_MANAGER' });

    const res = await deleteUser(req('DELETE', undefined, token), { params: { id: referee.id } });

    expect(res.status).toBe(200);
    expect(await prisma.user.findUnique({ where: { id: referee.id } })).toBeNull();
  });

  it('a Referee Manager cannot delete a non-referee account', async () => {
    const teamManager = await prisma.user.create({
      data: {
        email: 'tm@knscl.co.ke',
        passwordHash: await bcrypt.hash('x', 4),
        firstName: 'Fatuma',
        lastName: 'Baya',
        role: 'TEAM_MANAGER',
      },
    });
    const token = signAccessToken({ sub: 'rm-1', email: 'rm@knscl.co.ke', role: 'REFEREE_MANAGER' });

    const res = await deleteUser(req('DELETE', undefined, token), { params: { id: teamManager.id } });

    expect(res.status).toBe(403);
    expect(await prisma.user.findUnique({ where: { id: teamManager.id } })).not.toBeNull();
  });
});
