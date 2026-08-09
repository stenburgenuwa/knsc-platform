import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { POST as postEvent } from '../app/api/fixtures/[id]/events/route';
import { DELETE as deleteEvent } from '../app/api/fixtures/[id]/events/[eventId]/route';
import { PUT as putTeamSheet } from '../app/api/fixtures/[id]/team-sheets/route';
import { GET as getReport } from '../app/api/fixtures/[id]/report/route';
import { PATCH as submitResult } from '../app/api/fixtures/[id]/result/route';

function req(method: string, body?: any, token?: string) {
  return new NextRequest('http://localhost/api/fixtures/x', {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function scenario() {
  const hash = await bcrypt.hash('x', 4);
  const [home, away, spare] = await Promise.all([
    prisma.club.create({ data: { name: 'Mtwapa United' } }),
    prisma.club.create({ data: { name: 'Gongoni Sharks' } }),
    prisma.club.create({ data: { name: 'Kilifi Rangers' } }),
  ]);

  const squad = async (clubId: string, prefix: string) =>
    Promise.all(
      Array.from({ length: 20 }).map((_, i) =>
        prisma.player.create({
          data: { clubId, firstName: `${prefix}${i}`, lastName: 'Player', approved: true, playerNumber: i + 1 },
        })
      )
    );

  const homePlayers = await squad(home.id, 'H');
  const awayPlayers = await squad(away.id, 'A');
  const outsider = await prisma.player.create({
    data: { clubId: spare.id, firstName: 'Outside', lastName: 'Player', approved: true },
  });

  const fixture = await prisma.fixture.create({
    data: {
      homeClubId: home.id,
      awayClubId: away.id,
      fixtureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      kickoffTime: '15:00',
    },
  });

  const referee = await prisma.user.create({
    data: { email: 'ref@knscl.co.ke', passwordHash: hash, firstName: 'R', lastName: 'Ef', role: 'REFEREE' },
  });
  await prisma.refereeAssignment.create({
    data: { fixtureId: fixture.id, refereeId: referee.id, status: 'ACCEPTED' },
  });
  const refToken = signAccessToken({ sub: referee.id, email: referee.email, role: 'REFEREE' });

  const lm = await prisma.user.create({
    data: { email: 'lm@knscl.co.ke', passwordHash: hash, firstName: 'L', lastName: 'M', role: 'LEAGUE_MANAGER' },
  });
  const rm = await prisma.user.create({
    data: { email: 'rm@knscl.co.ke', passwordHash: hash, firstName: 'R', lastName: 'M', role: 'REFEREE_MANAGER' },
  });
  const tm = await prisma.user.create({
    data: { email: 'tm@knscl.co.ke', passwordHash: hash, firstName: 'T', lastName: 'M', role: 'TEAM_MANAGER', clubId: home.id },
  });

  return {
    home, away, homePlayers, awayPlayers, outsider, fixture, referee, refToken,
    lmToken: signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' }),
    rmToken: signAccessToken({ sub: rm.id, email: rm.email, role: 'REFEREE_MANAGER' }),
    tmToken: signAccessToken({ sub: tm.id, email: tm.email, role: 'TEAM_MANAGER', clubId: home.id }),
  };
}

const eighteen = (players: any[]) => ({
  starters: players.slice(0, 11).map((p) => p.id),
  substitutes: players.slice(11, 18).map((p) => p.id),
});

describe('Match events', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('records an own goal without adding it to the scorer’s tally', async () => {
    const s = await scenario();
    const player = s.homePlayers[0];

    const res = await postEvent(
      req('POST', { playerId: player.id, type: 'OWN_GOAL', minute: 34 }, s.refToken),
      { params: { id: s.fixture.id } }
    );
    expect(res.status).toBe(201);
    expect((await prisma.player.findUniqueOrThrow({ where: { id: player.id } })).goals).toBe(0);
  });

  it('still credits an ordinary goal', async () => {
    const s = await scenario();
    await postEvent(req('POST', { playerId: s.homePlayers[0].id, type: 'GOAL' }, s.refToken), { params: { id: s.fixture.id } });
    expect((await prisma.player.findUniqueOrThrow({ where: { id: s.homePlayers[0].id } })).goals).toBe(1);
  });

  it('refuses a player from a club that is not in this match', async () => {
    const s = await scenario();
    const res = await postEvent(
      req('POST', { playerId: s.outsider.id, type: 'GOAL' }, s.refToken),
      { params: { id: s.fixture.id } }
    );
    expect(res.status).toBe(400);
  });

  it('refuses a player who was not named on the team sheet', async () => {
    const s = await scenario();
    await putTeamSheet(
      req('PUT', { clubId: s.home.id, ...eighteen(s.homePlayers), captainId: s.homePlayers[0].id }, s.tmToken),
      { params: { id: s.fixture.id } }
    );

    // Player 19 is in the squad but was not selected for this match.
    const unselected = s.homePlayers[19];
    const res = await postEvent(
      req('POST', { playerId: unselected.id, type: 'GOAL' }, s.refToken),
      { params: { id: s.fixture.id } }
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/team sheet/i);

    // A selected player is accepted.
    const ok = await postEvent(
      req('POST', { playerId: s.homePlayers[0].id, type: 'GOAL' }, s.refToken),
      { params: { id: s.fixture.id } }
    );
    expect(ok.status).toBe(201);
  });

  it('opens a suspension case as soon as a red card is recorded', async () => {
    const s = await scenario();
    await prisma.fixture.update({ where: { id: s.fixture.id }, data: { status: 'COMPLETED', fixtureDate: new Date('2026-01-01') } });

    await postEvent(
      req('POST', { playerId: s.homePlayers[0].id, type: 'RED_CARD' }, s.refToken),
      { params: { id: s.fixture.id } }
    );

    const [c] = await prisma.disciplinaryCase.findMany({ where: { playerId: s.homePlayers[0].id } });
    expect(c.suspensionType).toBe('STRAIGHT_RED');
    expect(c.matchesBanned).toBe(3);
  });

  it('withdraws the suspension when the card is removed', async () => {
    const s = await scenario();
    await prisma.fixture.update({ where: { id: s.fixture.id }, data: { status: 'COMPLETED', fixtureDate: new Date('2026-01-01') } });
    const created = await (
      await postEvent(req('POST', { playerId: s.homePlayers[0].id, type: 'RED_CARD' }, s.refToken), { params: { id: s.fixture.id } })
    ).json();

    await deleteEvent(req('DELETE', undefined, s.refToken), { params: { id: s.fixture.id, eventId: created.data.id } });
    expect(await prisma.disciplinaryCase.count({ where: { playerId: s.homePlayers[0].id } })).toBe(0);
  });
});

describe('Team sheets carry jersey and registration numbers', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('saves the jersey number the Team Manager entered and returns it with the registration number', async () => {
    const s = await scenario();
    const { starters, substitutes } = eighteen(s.homePlayers);
    await prisma.player.update({ where: { id: starters[0] }, data: { registrationNumber: 'KNSCL042' } });

    const res = await putTeamSheet(
      req('PUT', { clubId: s.home.id, starters, substitutes, captainId: starters[0], jerseyNumbers: { [starters[0]]: 7 } }, s.tmToken),
      { params: { id: s.fixture.id } }
    );
    expect(res.status).toBe(200);

    const entry = await prisma.teamSheetEntry.findFirstOrThrow({ where: { playerId: starters[0] } });
    expect(entry.jerseyNumber).toBe(7);
  });

  it('refuses two players wearing the same jersey number', async () => {
    const s = await scenario();
    const { starters, substitutes } = eighteen(s.homePlayers);
    const res = await putTeamSheet(
      req('PUT', {
        clubId: s.home.id, starters, substitutes, captainId: starters[0],
        jerseyNumbers: { [starters[0]]: 9, [starters[1]]: 9 },
      }, s.tmToken),
      { params: { id: s.fixture.id } }
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/same jersey/i);
  });

  it('refuses to select a suspended player', async () => {
    const s = await scenario();
    // A red card in an earlier, completed match.
    const earlier = await prisma.fixture.create({
      data: { homeClubId: s.home.id, awayClubId: s.away.id, fixtureDate: new Date('2026-01-01'), status: 'COMPLETED' },
    });
    await prisma.matchEvent.create({ data: { fixtureId: earlier.id, playerId: s.homePlayers[0].id, type: 'RED_CARD' } });

    const { starters, substitutes } = eighteen(s.homePlayers);
    const res = await putTeamSheet(
      req('PUT', { clubId: s.home.id, starters, substitutes, captainId: starters[1] }, s.tmToken),
      { params: { id: s.fixture.id } }
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/suspended/i);
  });
});

describe('Submitted match reports', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  async function fileReport() {
    const s = await scenario();
    await putTeamSheet(
      req('PUT', { clubId: s.home.id, ...eighteen(s.homePlayers), captainId: s.homePlayers[0].id }, s.tmToken),
      { params: { id: s.fixture.id } }
    );
    await postEvent(req('POST', { playerId: s.homePlayers[0].id, type: 'GOAL', minute: 22 }, s.refToken), { params: { id: s.fixture.id } });
    await postEvent(req('POST', { playerId: s.awayPlayers[0].id, type: 'YELLOW_CARD', minute: 61 }, s.refToken), { params: { id: s.fixture.id } });
    await submitResult(req('PATCH', { homeScore: 1, awayScore: 0, reportNotes: 'Heavy rain from the 70th minute.' }, s.refToken), {
      params: { id: s.fixture.id },
    });
    return s;
  }

  it('is available to the League Manager as soon as it is submitted', async () => {
    const s = await fileReport();
    const res = await getReport(req('GET', undefined, s.lmToken), { params: { id: s.fixture.id } });
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.reportStatus).toBe('SUBMITTED');
    expect(data.reportSubmittedAt).not.toBeNull();
    expect(data.homeScore).toBe(1);
  });

  it('is available to the Referee Manager', async () => {
    const s = await fileReport();
    const res = await getReport(req('GET', undefined, s.rmToken), { params: { id: s.fixture.id } });
    expect(res.status).toBe(200);
  });

  it('retains team sheets, events, referee and comments', async () => {
    const s = await fileReport();
    const { data } = await (await getReport(req('GET', undefined, s.lmToken), { params: { id: s.fixture.id } })).json();

    expect(data.teamSheets.home.starters).toHaveLength(11);
    expect(data.teamSheets.home.substitutes).toHaveLength(7);
    expect(data.goals).toHaveLength(1);
    expect(data.cards).toHaveLength(1);
    expect(data.referee.name).toBe('R Ef');
    expect(data.reportNotes).toMatch(/Heavy rain/);
    expect(data.homeClub.name).toBe('Mtwapa United');
  });

  it('separates events into home and away', async () => {
    const s = await fileReport();
    const { data } = await (await getReport(req('GET', undefined, s.lmToken), { params: { id: s.fixture.id } })).json();
    expect(data.events.filter((e: any) => e.side === 'HOME')).toHaveLength(1);
    expect(data.events.filter((e: any) => e.side === 'AWAY')).toHaveLength(1);
  });

  it('remains readable after approval', async () => {
    const s = await fileReport();
    await prisma.fixture.update({ where: { id: s.fixture.id }, data: { reportStatus: 'APPROVED' } });
    const res = await getReport(req('GET', undefined, s.lmToken), { params: { id: s.fixture.id } });
    expect(res.status).toBe(200);
    expect((await res.json()).data.reportStatus).toBe('APPROVED');
  });

  it('returns nothing for a fixture whose report was never filed', async () => {
    const s = await scenario();
    const res = await getReport(req('GET', undefined, s.lmToken), { params: { id: s.fixture.id } });
    expect(res.status).toBe(404);
  });

  it('is not readable by a Team Manager', async () => {
    const s = await fileReport();
    const res = await getReport(req('GET', undefined, s.tmToken), { params: { id: s.fixture.id } });
    expect(res.status).toBe(403);
  });
});
