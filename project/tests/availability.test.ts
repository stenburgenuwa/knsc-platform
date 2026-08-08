import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { PATCH as patchMe } from '../app/api/auth/me/route';

function req(body: any, token?: string) {
  return new NextRequest('http://localhost/api/auth/me', {
    method: 'PATCH',
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/auth/me (referee availability)', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('a referee can set their own availability', async () => {
    const referee = await prisma.user.create({
      data: {
        email: 'ref@knscl.co.ke',
        passwordHash: await bcrypt.hash('x', 4),
        firstName: 'Samuel',
        lastName: 'Charo',
        role: 'REFEREE',
      },
    });
    const token = signAccessToken({ sub: referee.id, email: referee.email, role: 'REFEREE' });

    const res = await patchMe(req({ availability: 'INJURED' }, token));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.availability).toBe('INJURED');

    const after = await prisma.user.findUniqueOrThrow({ where: { id: referee.id } });
    expect(after.availability).toBe('INJURED');
  });

  it('rejects an invalid availability value', async () => {
    const referee = await prisma.user.create({
      data: {
        email: 'ref@knscl.co.ke',
        passwordHash: await bcrypt.hash('x', 4),
        firstName: 'Samuel',
        lastName: 'Charo',
        role: 'REFEREE',
      },
    });
    const token = signAccessToken({ sub: referee.id, email: referee.email, role: 'REFEREE' });

    const res = await patchMe(req({ availability: 'ON_HOLIDAY' }, token));
    expect(res.status).toBe(400);
  });

  it('a non-referee cannot set availability', async () => {
    const teamManager = await prisma.user.create({
      data: {
        email: 'tm@knscl.co.ke',
        passwordHash: await bcrypt.hash('x', 4),
        firstName: 'Fatuma',
        lastName: 'Baya',
        role: 'TEAM_MANAGER',
      },
    });
    const token = signAccessToken({ sub: teamManager.id, email: teamManager.email, role: 'TEAM_MANAGER' });

    const res = await patchMe(req({ availability: 'AVAILABLE' }, token));
    expect(res.status).toBe(403);
  });
});
