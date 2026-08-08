import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import { POST as postFixture } from '../app/api/fixtures/route';
import { PATCH as patchFixture } from '../app/api/fixtures/[id]/route';
import { PATCH as patchClub } from '../app/api/clubs/[id]/route';

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

async function makeLeagueManager() {
  const lm = await prisma.user.create({
    data: { email: 'lm@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'LEAGUE_MANAGER' },
  });
  return signAccessToken({ sub: lm.id, email: lm.email, role: 'LEAGUE_MANAGER' });
}

describe('Fixture venue follows the home club', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('a new fixture automatically uses the home club\'s registered venue', async () => {
    const venue = await prisma.venue.create({ data: { name: 'Kilifi United Grounds' } });
    const home = await prisma.club.create({ data: { name: 'Kilifi United', homeVenueId: venue.id } });
    const away = await prisma.club.create({ data: { name: 'Bofa FC' } });
    const token = await makeLeagueManager();

    const res = await postFixture(
      req('POST', 'http://localhost/x', { homeClubId: home.id, awayClubId: away.id, fixtureDate: new Date().toISOString() }, token)
    );
    const body = await res.json();

    expect(body.data.venue.name).toBe('Kilifi United Grounds');
  });

  it('the away club\'s venue has no effect on the fixture venue', async () => {
    const awayVenue = await prisma.venue.create({ data: { name: 'Bofa Grounds' } });
    const home = await prisma.club.create({ data: { name: 'Kilifi United' } });
    const away = await prisma.club.create({ data: { name: 'Bofa FC', homeVenueId: awayVenue.id } });
    const token = await makeLeagueManager();

    const res = await postFixture(
      req('POST', 'http://localhost/x', { homeClubId: home.id, awayClubId: away.id, fixtureDate: new Date().toISOString() }, token)
    );
    const body = await res.json();

    expect(body.data.venue).toBeNull();
  });

  it('a home club without a registered venue results in TBC (no venue)', async () => {
    const home = await prisma.club.create({ data: { name: 'Kilifi United' } });
    const away = await prisma.club.create({ data: { name: 'Bofa FC' } });
    const token = await makeLeagueManager();

    const res = await postFixture(
      req('POST', 'http://localhost/x', { homeClubId: home.id, awayClubId: away.id, fixtureDate: new Date().toISOString() }, token)
    );
    const body = await res.json();

    expect(body.data.venueId).toBeNull();
    expect(body.data.venue).toBeNull();
  });

  it('changing the home club on an existing fixture updates the venue automatically', async () => {
    const kilifiVenue = await prisma.venue.create({ data: { name: 'Kilifi United Grounds' } });
    const malindiVenue = await prisma.venue.create({ data: { name: 'Malindi Stadium' } });
    const kilifi = await prisma.club.create({ data: { name: 'Kilifi United', homeVenueId: kilifiVenue.id } });
    const malindi = await prisma.club.create({ data: { name: 'Malindi United', homeVenueId: malindiVenue.id } });
    const bofa = await prisma.club.create({ data: { name: 'Bofa FC' } });
    const token = await makeLeagueManager();

    const created = await postFixture(
      req('POST', 'http://localhost/x', { homeClubId: kilifi.id, awayClubId: bofa.id, fixtureDate: new Date().toISOString() }, token)
    );
    const { data: fixture } = await created.json();
    expect(fixture.venue.name).toBe('Kilifi United Grounds');

    const updated = await patchFixture(req('PATCH', 'http://localhost/x', { homeClubId: malindi.id }, token), { params: { id: fixture.id } });
    const updatedBody = await updated.json();

    expect(updatedBody.data.venue.name).toBe('Malindi Stadium');
  });

  it('manually supplied venueId is ignored — the home club always wins', async () => {
    const venue = await prisma.venue.create({ data: { name: 'Kilifi United Grounds' } });
    const decoyVenue = await prisma.venue.create({ data: { name: 'Some Other Ground' } });
    const home = await prisma.club.create({ data: { name: 'Kilifi United', homeVenueId: venue.id } });
    const away = await prisma.club.create({ data: { name: 'Bofa FC' } });
    const token = await makeLeagueManager();

    const res = await postFixture(
      req('POST', 'http://localhost/x', { homeClubId: home.id, awayClubId: away.id, venueId: decoyVenue.id, fixtureDate: new Date().toISOString() }, token)
    );
    const body = await res.json();

    expect(body.data.venue.name).toBe('Kilifi United Grounds');
  });

  it('League Manager setting a club\'s home venue by name reuses an existing venue rather than duplicating it', async () => {
    await prisma.venue.create({ data: { name: 'Malindi Stadium' } });
    const club = await prisma.club.create({ data: { name: 'Malindi United' } });
    const token = await makeLeagueManager();

    await patchClub(req('PATCH', 'http://localhost/x', { homeVenueName: '  malindi stadium  ' }, token), { params: { id: club.id } });

    const venues = await prisma.venue.findMany();
    expect(venues).toHaveLength(1);
    const updatedClub = await prisma.club.findUniqueOrThrow({ where: { id: club.id } });
    expect(updatedClub.homeVenueId).toBe(venues[0].id);
  });

  it('League Manager setting a brand-new venue name creates exactly one venue', async () => {
    const club = await prisma.club.create({ data: { name: 'Bamba United' } });
    const token = await makeLeagueManager();

    await patchClub(req('PATCH', 'http://localhost/x', { homeVenueName: 'Bamba Stadium' }, token), { params: { id: club.id } });

    const venues = await prisma.venue.findMany();
    expect(venues).toHaveLength(1);
    expect(venues[0].name).toBe('Bamba Stadium');
  });
});
