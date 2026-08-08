import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { POST as postPlayer, GET as getPlayers } from '../app/api/players/route';
import { PATCH as approvePlayer } from '../app/api/players/[id]/approve/route';
import { GET as getPlayer } from '../app/api/players/[id]/route';
import { GET as getClubs } from '../app/api/clubs/route';

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

async function makeUser(role: string, email: string, clubId?: string) {
  const user = await prisma.user.create({
    data: { email, passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: role as any, clubId },
  });
  return signAccessToken({ sub: user.id, email, role, clubId });
}

async function registerViaTeamManager(clubId: string, tmToken: string, overrides: Partial<any> = {}) {
  const res = await postPlayer(
    req(
      'POST',
      'http://localhost/api/players',
      {
        clubId,
        firstName: 'Brian',
        lastName: 'Kazungu',
        position: 'Forward',
        dateOfBirth: '2000-01-01',
        photoUrl: 'data:image/webp;base64,AAAA',
        idNumber: '12345678',
        height: 180,
        weight: 75,
        ...overrides,
      },
      tmToken
    )
  );
  const body = await res.json();
  return body.data;
}

describe('Player registration numbers', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('a Team Manager registration has no registration number and needs both approvals', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const tmToken = await makeUser('TEAM_MANAGER', 'tm@knscl.co.ke', club.id);

    const player = await registerViaTeamManager(club.id, tmToken);

    expect(player.approved).toBe(false);
    expect(player.leagueManagerApproved).toBe(false);
    expect(player.platformOwnerApproved).toBe(false);
    expect(player.registrationNumber).toBeNull();
  });

  it('registration number is only assigned once both League Manager and Platform Owner approve', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const tmToken = await makeUser('TEAM_MANAGER', 'tm@knscl.co.ke', club.id);
    const player = await registerViaTeamManager(club.id, tmToken);

    const lmToken = await makeUser('LEAGUE_MANAGER', 'lm@knscl.co.ke');
    const afterLm = await (await approvePlayer(req('PATCH', 'http://localhost/x', undefined, lmToken), { params: { id: player.id } })).json();
    expect(afterLm.data.registrationNumber).toBeNull();
    expect(afterLm.data.approved).toBe(true);

    const poToken = await makeUser('PLATFORM_OWNER', 'po@knscl.co.ke');
    const afterPo = await (await approvePlayer(req('PATCH', 'http://localhost/x', undefined, poToken), { params: { id: player.id } })).json();
    expect(afterPo.data.registrationNumber).toBe('KNSCL001');
  });

  it('registration numbers are sequential across players', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const tmToken = await makeUser('TEAM_MANAGER', 'tm@knscl.co.ke', club.id);
    const lmToken = await makeUser('LEAGUE_MANAGER', 'lm@knscl.co.ke');
    const poToken = await makeUser('PLATFORM_OWNER', 'po@knscl.co.ke');

    const p1 = await registerViaTeamManager(club.id, tmToken, { firstName: 'Player', lastName: 'One' });
    const p2 = await registerViaTeamManager(club.id, tmToken, { firstName: 'Player', lastName: 'Two' });

    for (const p of [p1, p2]) {
      await approvePlayer(req('PATCH', 'http://localhost/x', undefined, lmToken), { params: { id: p.id } });
      await approvePlayer(req('PATCH', 'http://localhost/x', undefined, poToken), { params: { id: p.id } });
    }

    const final1 = await prisma.player.findUniqueOrThrow({ where: { id: p1.id } });
    const final2 = await prisma.player.findUniqueOrThrow({ where: { id: p2.id } });
    expect(final1.registrationNumber).toBe('KNSCL001');
    expect(final2.registrationNumber).toBe('KNSCL002');
  });

  it('a Platform Owner registering a player directly assigns a registration number immediately', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const poToken = await makeUser('PLATFORM_OWNER', 'po@knscl.co.ke');

    const player = await registerViaTeamManager(club.id, poToken, { firstName: 'Owner', lastName: 'Signed' });

    expect(player.approved).toBe(true);
    expect(player.leagueManagerApproved).toBe(true);
    expect(player.platformOwnerApproved).toBe(true);
    expect(player.registrationNumber).toBe('KNSCL001');
  });

  it('registration numbers stay unique even under concurrent approvals across different players', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const tmToken = await makeUser('TEAM_MANAGER', 'tm@knscl.co.ke', club.id);
    const lmToken = await makeUser('LEAGUE_MANAGER', 'lm@knscl.co.ke');
    const poToken = await makeUser('PLATFORM_OWNER', 'po@knscl.co.ke');

    const p1 = await registerViaTeamManager(club.id, tmToken, { firstName: 'Player', lastName: 'One' });
    const p2 = await registerViaTeamManager(club.id, tmToken, { firstName: 'Player', lastName: 'Two' });
    await approvePlayer(req('PATCH', 'http://localhost/x', undefined, lmToken), { params: { id: p1.id } });
    await approvePlayer(req('PATCH', 'http://localhost/x', undefined, lmToken), { params: { id: p2.id } });

    // Both players get their final (Platform Owner) approval at the same time.
    await Promise.all([
      approvePlayer(req('PATCH', 'http://localhost/x', undefined, poToken), { params: { id: p1.id } }),
      approvePlayer(req('PATCH', 'http://localhost/x', undefined, poToken), { params: { id: p2.id } }),
    ]);

    const final1 = await prisma.player.findUniqueOrThrow({ where: { id: p1.id } });
    const final2 = await prisma.player.findUniqueOrThrow({ where: { id: p2.id } });
    expect(final1.registrationNumber).not.toBeNull();
    expect(final2.registrationNumber).not.toBeNull();
    expect(final1.registrationNumber).not.toBe(final2.registrationNumber);
  });

  it('registrationNumber is unique at the database level', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    await prisma.player.create({ data: { clubId: club.id, firstName: 'A', lastName: 'B', registrationNumber: 'KNSCL001' } });

    await expect(
      prisma.player.create({ data: { clubId: club.id, firstName: 'C', lastName: 'D', registrationNumber: 'KNSCL001' } })
    ).rejects.toThrow();
  });
});

describe('GET /api/players/[id] profile', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('reports goal/card stats and grouped match history from existing MatchEvent data', async () => {
    const home = await prisma.club.create({ data: { name: 'Malindi United' } });
    const away = await prisma.club.create({ data: { name: 'Mtwapa FC' } });
    const player = await prisma.player.create({ data: { clubId: home.id, firstName: 'Brian', lastName: 'Kazungu', goals: 2, approved: true } });
    const fixture = await prisma.fixture.create({
      data: { homeClubId: home.id, awayClubId: away.id, fixtureDate: new Date(), homeScore: 3, awayScore: 1, status: 'COMPLETED' },
    });
    await prisma.matchEvent.create({ data: { fixtureId: fixture.id, playerId: player.id, type: 'GOAL', minute: 10 } });
    await prisma.matchEvent.create({ data: { fixtureId: fixture.id, playerId: player.id, type: 'YELLOW_CARD', minute: 55 } });

    const res = await getPlayer(req('GET', 'http://localhost/x'), { params: { id: player.id } });
    const body = await res.json();

    expect(body.data.stats).toEqual({ goals: 2, yellowCards: 1, redCards: 0 });
    expect(body.data.matchHistory).toHaveLength(1);
    expect(body.data.matchHistory[0].opponent).toBe('Mtwapa FC');
    expect(body.data.matchHistory[0].events).toHaveLength(2);
  });

  it('hides an unapproved player from an unauthenticated request', async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const player = await prisma.player.create({ data: { clubId: club.id, firstName: 'Pending', lastName: 'Player', approved: false } });

    const res = await getPlayer(req('GET', 'http://localhost/x'), { params: { id: player.id } });
    expect(res.status).toBe(404);
  });

  it("shows an unapproved player to their own club's Team Manager", async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const player = await prisma.player.create({ data: { clubId: club.id, firstName: 'Pending', lastName: 'Player', approved: false } });
    const tmToken = await makeUser('TEAM_MANAGER', 'tm@knscl.co.ke', club.id);

    const res = await getPlayer(req('GET', 'http://localhost/x', undefined, tmToken), { params: { id: player.id } });
    expect(res.status).toBe(200);
  });
});

describe('Club directory manager info', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it("exposes the club's Team Manager name and email but never password fields", async () => {
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: await bcrypt.hash('secret', 4), firstName: 'Fatuma', lastName: 'Baya', role: 'TEAM_MANAGER', clubId: club.id },
    });

    const res = await getClubs(req('GET', 'http://localhost/api/clubs'));
    const body = await res.json();
    const found = body.data.find((c: any) => c.id === club.id);

    expect(found.managers).toHaveLength(1);
    expect(found.managers[0].email).toBe('tm@knscl.co.ke');
    expect(found.managers[0].passwordHash).toBeUndefined();
  });
});
