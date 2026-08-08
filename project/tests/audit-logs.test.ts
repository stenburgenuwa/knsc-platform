import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { GET as getAuditLogs } from '../app/api/audit-logs/route';
import { POST as postClub } from '../app/api/clubs/route';
import { POST as postUser } from '../app/api/users/route';

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

describe('Audit logs', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('creating a club and a user each write an audit log entry', async () => {
    const owner = await prisma.user.create({
      data: { email: 'owner@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'PLATFORM_OWNER' },
    });
    const token = signAccessToken({ sub: owner.id, email: owner.email, role: 'PLATFORM_OWNER' });

    await postClub(req('POST', 'http://localhost/x', { name: 'Malindi United' }, token));
    await postUser(req('POST', 'http://localhost/x', { email: 'ref@knscl.co.ke', firstName: 'Sam', lastName: 'Charo', role: 'REFEREE' }, token));

    const res = await getAuditLogs(req('GET', 'http://localhost/api/audit-logs', undefined, token));
    const body = await res.json();
    const actions = body.data.map((l: any) => l.action);

    expect(actions).toContain('CLUB_CREATED');
    expect(actions).toContain('USER_CREATED');
  });

  it('only a Platform Owner can read the audit log', async () => {
    const lm = await prisma.user.create({
      data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
    });
    const token = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });

    const res = await getAuditLogs(req('GET', 'http://localhost/api/audit-logs', undefined, token));
    expect(res.status).toBe(403);
  });

  it('the module filter narrows results', async () => {
    const owner = await prisma.user.create({
      data: { email: 'owner@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'PLATFORM_OWNER' },
    });
    const token = signAccessToken({ sub: owner.id, email: owner.email, role: 'PLATFORM_OWNER' });
    await postClub(req('POST', 'http://localhost/x', { name: 'Malindi United' }, token));
    await postUser(req('POST', 'http://localhost/x', { email: 'ref@knscl.co.ke', firstName: 'Sam', lastName: 'Charo', role: 'REFEREE' }, token));

    const res = await getAuditLogs(req('GET', 'http://localhost/api/audit-logs?module=clubs', undefined, token));
    const body = await res.json();

    expect(body.data.every((l: any) => l.module === 'clubs')).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });
});
