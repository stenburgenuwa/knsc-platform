import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';
import { resetTestDb } from './db-helpers';
import { POST as login } from '../app/api/auth/login/route';

function loginRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await resetTestDb();
    await prisma.user.create({
      data: {
        email: 'referee@knscl.co.ke',
        passwordHash: await bcrypt.hash('CorrectHorse1!', 10),
        firstName: 'Test',
        lastName: 'Referee',
        role: 'REFEREE',
      },
    });
  });

  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('rejects an unknown email', async () => {
    const res = await login(loginRequest({ email: 'nobody@knscl.co.ke', password: 'whatever' }));
    expect(res.status).toBe(401);
  });

  it('rejects a wrong password', async () => {
    const res = await login(loginRequest({ email: 'referee@knscl.co.ke', password: 'wrong' }));
    expect(res.status).toBe(401);
  });

  it('issues a token and the right role on correct credentials', async () => {
    const res = await login(loginRequest({ email: 'referee@knscl.co.ke', password: 'CorrectHorse1!' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.accessToken).toBeTypeOf('string');
    expect(body.data.user.roles).toEqual(['Referee']);
  });

  it('locks the account after 5 failed attempts, even with the correct password', async () => {
    for (let i = 0; i < 5; i++) {
      await login(loginRequest({ email: 'referee@knscl.co.ke', password: 'wrong' }));
    }

    const lockedRes = await login(loginRequest({ email: 'referee@knscl.co.ke', password: 'CorrectHorse1!' }));
    expect(lockedRes.status).toBe(423);

    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'referee@knscl.co.ke' } });
    expect(user.lockedUntil).not.toBeNull();
    expect(user.lockedUntil!.getTime()).toBeGreaterThan(Date.now());
  });

  it('resets the failed-attempt counter after a successful login', async () => {
    await login(loginRequest({ email: 'referee@knscl.co.ke', password: 'wrong' }));
    await login(loginRequest({ email: 'referee@knscl.co.ke', password: 'wrong' }));
    await login(loginRequest({ email: 'referee@knscl.co.ke', password: 'CorrectHorse1!' }));

    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'referee@knscl.co.ke' } });
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lockedUntil).toBeNull();
  });
});
