import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { GET as getAnnouncements, POST as postAnnouncement } from '../app/api/announcements/route';
import { DELETE as deleteAnnouncement } from '../app/api/announcements/[id]/route';
import { GET as getNews } from '../app/api/news/route';

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

async function makeUser(role: string, email: string) {
  return prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash('x', 4),
      firstName: 'Test',
      lastName: role,
      role: role as any,
    },
  });
}

describe('Announcements', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('a League Manager can publish an announcement targeted at Team Managers', async () => {
    const lm = await makeUser('LEAGUE_MANAGER', 'lm@knscl.co.ke');
    const token = signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });

    const res = await postAnnouncement(
      req('POST', 'http://localhost/api/announcements', { title: 'Fixture change', message: 'Kickoff moved to 4pm', audience: 'TEAM_MANAGER' }, token)
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.audience).toBe('TEAM_MANAGER');
    expect(body.data.createdById).toBe(lm.id);
  });

  it('a Team Manager cannot publish announcements', async () => {
    const tm = await makeUser('TEAM_MANAGER', 'tm@knscl.co.ke');
    const token = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER' });

    const res = await postAnnouncement(req('POST', 'http://localhost/api/announcements', { title: 'X', message: 'Y' }, token));
    expect(res.status).toBe(403);
  });

  it('a Team Manager sees global announcements and ones targeted at them, but not ones for Referees', async () => {
    const lm = await makeUser('LEAGUE_MANAGER', 'lm@knscl.co.ke');
    await prisma.announcement.create({ data: { title: 'For everyone', message: 'x', createdById: lm.id } });
    await prisma.announcement.create({ data: { title: 'For team managers', message: 'x', audience: 'TEAM_MANAGER', createdById: lm.id } });
    await prisma.announcement.create({ data: { title: 'For referees', message: 'x', audience: 'REFEREE', createdById: lm.id } });

    const tm = await makeUser('TEAM_MANAGER', 'tm@knscl.co.ke');
    const token = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER' });

    const res = await getAnnouncements(req('GET', 'http://localhost/api/announcements', undefined, token));
    const body = await res.json();
    const titles = body.data.map((a: any) => a.title);

    expect(titles).toContain('For everyone');
    expect(titles).toContain('For team managers');
    expect(titles).not.toContain('For referees');
  });

  it('the public news feed only shows announcements with no audience', async () => {
    const lm = await makeUser('LEAGUE_MANAGER', 'lm@knscl.co.ke');
    await prisma.announcement.create({ data: { title: 'Public story', message: 'x', createdById: lm.id } });
    await prisma.announcement.create({ data: { title: 'Internal notice', message: 'x', audience: 'REFEREE', createdById: lm.id } });

    const res = await getNews(req('GET', 'http://localhost/api/news'));
    const body = await res.json();
    const titles = body.data.map((a: any) => a.title);

    expect(titles).toContain('Public story');
    expect(titles).not.toContain('Internal notice');
  });

  it('only the creator (or Platform Owner) can delete an announcement', async () => {
    const rm1 = await makeUser('REFEREE_MANAGER', 'rm1@knscl.co.ke');
    const rm2 = await makeUser('REFEREE_MANAGER', 'rm2@knscl.co.ke');
    const announcement = await prisma.announcement.create({ data: { title: 'X', message: 'y', createdById: rm1.id } });

    const otherToken = signAccessToken({ sub: rm2.id, email: rm2.email, role: 'REFEREE_MANAGER' });
    const forbiddenRes = await deleteAnnouncement(
      req('DELETE', 'http://localhost/api/announcements/x', undefined, otherToken),
      { params: { id: announcement.id } }
    );
    expect(forbiddenRes.status).toBe(403);

    const ownerToken = signAccessToken({ sub: rm1.id, email: rm1.email, role: 'REFEREE_MANAGER' });
    const okRes = await deleteAnnouncement(
      req('DELETE', 'http://localhost/api/announcements/x', undefined, ownerToken),
      { params: { id: announcement.id } }
    );
    expect(okRes.status).toBe(200);
    expect(await prisma.announcement.findUnique({ where: { id: announcement.id } })).toBeNull();
  });
});
