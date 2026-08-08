import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { GET as getTeamSheets, PUT as putTeamSheet } from '../app/api/fixtures/[id]/team-sheets/route';

function req(method: string, body?: any, token?: string) {
  return new NextRequest('http://localhost/api/fixtures/x/team-sheets', {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function buildFixture(opts: { kickoffInPast?: boolean } = {}) {
  const [home, away] = await Promise.all([
    prisma.club.create({ data: { name: 'Malindi United' } }),
    prisma.club.create({ data: { name: 'Mtwapa FC' } }),
  ]);

  const homePlayers = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.player.create({ data: { clubId: home.id, firstName: `Home${i}`, lastName: 'Player', approved: true } })
    )
  );
  const unapproved = await prisma.player.create({ data: { clubId: home.id, firstName: 'Pending', lastName: 'Player', approved: false } });
  const awayPlayer = await prisma.player.create({ data: { clubId: away.id, firstName: 'Away', lastName: 'Player', approved: true } });

  const fixtureDate = opts.kickoffInPast ? new Date(Date.now() - 24 * 60 * 60 * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const fixture = await prisma.fixture.create({
    data: { homeClubId: home.id, awayClubId: away.id, fixtureDate, kickoffTime: '15:00' },
  });

  return { home, away, homePlayers, unapproved, awayPlayer, fixture };
}

function eighteen(players: any[]) {
  return { starters: players.slice(0, 11).map((p) => p.id), substitutes: players.slice(11, 18).map((p) => p.id) };
}

describe('Team sheets', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('a Team Manager can save a valid 11+7 team sheet for their own club', async () => {
    const { home, homePlayers, fixture } = await buildFixture();
    const tm = await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'TEAM_MANAGER', clubId: home.id },
    });
    const token = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER', clubId: home.id });
    const { starters, substitutes } = eighteen(homePlayers);

    const res = await putTeamSheet(
      req('PUT', { clubId: home.id, starters, substitutes, captainId: starters[0] }, token),
      { params: { id: fixture.id } }
    );
    expect(res.status).toBe(200);

    const stored = await prisma.teamSheet.findUnique({ where: { fixtureId_clubId: { fixtureId: fixture.id, clubId: home.id } }, include: { entries: true } });
    expect(stored?.entries).toHaveLength(18);
    expect(stored?.entries.filter((e) => e.role === 'STARTER')).toHaveLength(11);
    expect(stored?.entries.find((e) => e.isCaptain)?.playerId).toBe(starters[0]);
  });

  it('rejects a team sheet that is not exactly 11 starters', async () => {
    const { home, homePlayers, fixture } = await buildFixture();
    const tm = await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'TEAM_MANAGER', clubId: home.id },
    });
    const token = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER', clubId: home.id });

    const res = await putTeamSheet(
      req('PUT', { clubId: home.id, starters: homePlayers.slice(0, 10).map((p) => p.id), substitutes: homePlayers.slice(10, 17).map((p) => p.id), captainId: homePlayers[0].id }, token),
      { params: { id: fixture.id } }
    );
    expect(res.status).toBe(400);
  });

  it('rejects an unapproved player on the team sheet', async () => {
    const { home, homePlayers, unapproved, fixture } = await buildFixture();
    const tm = await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'TEAM_MANAGER', clubId: home.id },
    });
    const token = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER', clubId: home.id });
    const starters = homePlayers.slice(0, 10).map((p) => p.id).concat(unapproved.id);
    const substitutes = homePlayers.slice(10, 17).map((p) => p.id);

    const res = await putTeamSheet(
      req('PUT', { clubId: home.id, starters, substitutes, captainId: starters[0] }, token),
      { params: { id: fixture.id } }
    );
    expect(res.status).toBe(400);
  });

  it('a Team Manager cannot submit a team sheet for a club they do not manage', async () => {
    const { home, away, homePlayers, fixture } = await buildFixture();
    const tm = await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'TEAM_MANAGER', clubId: away.id },
    });
    const token = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER', clubId: away.id });
    const { starters, substitutes } = eighteen(homePlayers);

    const res = await putTeamSheet(
      req('PUT', { clubId: home.id, starters, substitutes, captainId: starters[0] }, token),
      { params: { id: fixture.id } }
    );
    expect(res.status).toBe(403);
  });

  it('locks the team sheet once kickoff has passed', async () => {
    const { home, homePlayers, fixture } = await buildFixture({ kickoffInPast: true });
    const tm = await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'TEAM_MANAGER', clubId: home.id },
    });
    const token = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER', clubId: home.id });
    const { starters, substitutes } = eighteen(homePlayers);

    const res = await putTeamSheet(
      req('PUT', { clubId: home.id, starters, substitutes, captainId: starters[0] }, token),
      { params: { id: fixture.id } }
    );
    expect(res.status).toBe(409);
  });

  it('an unassigned referee cannot view team sheets for a fixture', async () => {
    const { fixture } = await buildFixture();
    const referee = await prisma.user.create({
      data: { email: 'ref@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'REFEREE' },
    });
    const token = signAccessToken({ sub: referee.id, email: referee.email, role: 'REFEREE' });

    const res = await getTeamSheets(req('GET', undefined, token), { params: { id: fixture.id } });
    expect(res.status).toBe(403);
  });

  it('the assigned referee can view submitted team sheets', async () => {
    const { home, homePlayers, fixture } = await buildFixture();
    const tm = await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'TEAM_MANAGER', clubId: home.id },
    });
    const tmToken = signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER', clubId: home.id });
    const { starters, substitutes } = eighteen(homePlayers);
    await putTeamSheet(req('PUT', { clubId: home.id, starters, substitutes, captainId: starters[0] }, tmToken), { params: { id: fixture.id } });

    const referee = await prisma.user.create({
      data: { email: 'ref@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'REFEREE' },
    });
    await prisma.refereeAssignment.create({ data: { fixtureId: fixture.id, refereeId: referee.id } });
    const refToken = signAccessToken({ sub: referee.id, email: referee.email, role: 'REFEREE' });

    const res = await getTeamSheets(req('GET', undefined, refToken), { params: { id: fixture.id } });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.home.starters).toHaveLength(11);
    expect(body.data.away).toBeNull();
  });
});
