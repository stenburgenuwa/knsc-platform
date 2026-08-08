import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { resetTestDb } from './db-helpers';
import {
  getPublicPlayer,
  getPublicPlayers,
  getPublicClub,
  getPublicClubs,
  getStandings,
  getPublicNews,
  getNewsArticle,
  globalSearch,
  calculateAge,
  slugify,
} from '../lib/public-data';
import { GET as getPlayerApi } from '../app/api/players/[id]/route';
import { GET as getPlayersApi } from '../app/api/players/route';

function req(url: string, token?: string) {
  return new NextRequest(url, { headers: token ? { authorization: `Bearer ${token}` } : {} });
}

const PRIVATE_ID = 'ID-SECRET-12345678';

async function buildLeague() {
  const venue = await prisma.venue.create({ data: { name: 'Malindi Stadium' } });
  const [home, away] = await Promise.all([
    prisma.club.create({ data: { name: 'Malindi United', homeVenueId: venue.id } }),
    prisma.club.create({ data: { name: 'Mtwapa FC' } }),
  ]);
  const player = await prisma.player.create({
    data: {
      clubId: home.id,
      firstName: 'Brian',
      lastName: 'Kazungu',
      idNumber: PRIVATE_ID,
      height: 180,
      weight: 75,
      dateOfBirth: new Date('2000-06-15'),
      goals: 2,
      approved: true,
      registrationNumber: 'KNSCL001',
    },
  });
  const fixture = await prisma.fixture.create({
    data: {
      homeClubId: home.id,
      awayClubId: away.id,
      venueId: venue.id,
      fixtureDate: new Date(Date.now() - 86400000),
      status: 'COMPLETED',
      homeScore: 2,
      awayScore: 1,
    },
  });
  await prisma.matchEvent.create({ data: { fixtureId: fixture.id, playerId: player.id, type: 'GOAL', minute: 10 } });
  await prisma.matchEvent.create({ data: { fixtureId: fixture.id, playerId: player.id, type: 'YELLOW_CARD', minute: 55 } });

  return { venue, home, away, player, fixture };
}

describe('public data layer never exposes private player information', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('getPublicPlayer omits the National ID / passport number', async () => {
    const { player } = await buildLeague();

    const result = await getPublicPlayer(player.id);

    expect(result).not.toBeNull();
    expect(JSON.stringify(result)).not.toContain(PRIVATE_ID);
    expect((result as any).idNumber).toBeUndefined();
    // Publishable fields still come through.
    expect(result!.height).toBe(180);
    expect(result!.registrationNumber).toBe('KNSCL001');
  });

  it('getPublicPlayers omits private fields for every row', async () => {
    await buildLeague();

    const { items } = await getPublicPlayers();

    expect(items.length).toBeGreaterThan(0);
    expect(JSON.stringify(items)).not.toContain(PRIVATE_ID);
  });

  it('getPublicClub squad listings omit private fields', async () => {
    const { home } = await buildLeague();

    const club = await getPublicClub(home.id);

    expect(club!.players.length).toBe(1);
    expect(JSON.stringify(club)).not.toContain(PRIVATE_ID);
  });

  it('hides unapproved players from the public entirely', async () => {
    const { home } = await buildLeague();
    const pending = await prisma.player.create({
      data: { clubId: home.id, firstName: 'Pending', lastName: 'Player', approved: false, idNumber: PRIVATE_ID },
    });

    expect(await getPublicPlayer(pending.id)).toBeNull();

    const { items } = await getPublicPlayers();
    expect(items.find((p) => p.id === pending.id)).toBeUndefined();

    const club = await getPublicClub(home.id);
    expect(club!.players.find((p) => p.id === pending.id)).toBeUndefined();
  });

  it('the players API strips the ID number for anonymous callers but keeps it for administrators', async () => {
    const { player, home } = await buildLeague();

    const anon = await getPlayerApi(req('http://localhost/api/players/x'), { params: { id: player.id } });
    const anonBody = await anon.json();
    expect(anonBody.data.idNumber).toBeUndefined();

    const owner = await prisma.user.create({
      data: { email: 'owner@knscl.co.ke', passwordHash: await bcrypt.hash('x', 4), firstName: 'A', lastName: 'B', role: 'PLATFORM_OWNER' },
    });
    const token = signAccessToken({ sub: owner.id, email: owner.email, role: 'PLATFORM_OWNER' });
    const admin = await getPlayerApi(req('http://localhost/api/players/x', token), { params: { id: player.id } });
    const adminBody = await admin.json();
    expect(adminBody.data.idNumber).toBe(PRIVATE_ID);
    void home;
  });

  it('the players list API strips ID numbers for anonymous callers', async () => {
    await buildLeague();

    const res = await getPlayersApi(req('http://localhost/api/players'));
    const body = await res.json();

    expect(JSON.stringify(body)).not.toContain(PRIVATE_ID);
  });

  it('global search results never carry private fields', async () => {
    await buildLeague();

    const results = await globalSearch('Kazungu');

    expect(results.players.length).toBe(1);
    expect(JSON.stringify(results)).not.toContain(PRIVATE_ID);
  });
});

describe('public competition data', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('standings include goal difference and recent form', async () => {
    await buildLeague();

    const rows = await getStandings();

    expect(rows).toHaveLength(2);
    expect(rows[0].clubName).toBe('Malindi United');
    expect(rows[0].points).toBe(3);
    expect(rows[0].goalDifference).toBe(1);
    expect(rows[0].form).toEqual(['W']);
    expect(rows[1].form).toEqual(['L']);
  });

  it('player profile derives stats and match history from match events', async () => {
    const { player } = await buildLeague();

    const result = await getPublicPlayer(player.id);

    expect(result!.stats).toEqual({ matchesPlayed: 1, goals: 2, yellowCards: 1, redCards: 0 });
    expect(result!.matchHistory).toHaveLength(1);
    expect(result!.matchHistory[0].opponent).toBe('Mtwapa FC');
  });

  it('club profile carries fixtures, results and league position', async () => {
    const { home } = await buildLeague();

    const club = await getPublicClub(home.id);

    expect(club!.standing?.position).toBe(1);
    expect(club!.results).toHaveLength(1);
    expect(club!.homeVenue?.name).toBe('Malindi Stadium');
  });

  it('club listings expose the manager name and email but no password hash', async () => {
    const { home } = await buildLeague();
    await prisma.user.create({
      data: { email: 'tm@knscl.co.ke', passwordHash: await bcrypt.hash('secret', 4), firstName: 'Fatuma', lastName: 'Baya', role: 'TEAM_MANAGER', clubId: home.id },
    });

    const clubs = await getPublicClubs();
    const found = clubs.find((c) => c.id === home.id)!;

    expect(found.managers[0].email).toBe('tm@knscl.co.ke');
    expect(JSON.stringify(clubs)).not.toContain('$2');
  });
});

describe('public news', () => {
  beforeEach(resetTestDb);
  afterAll(async () => {
    await resetTestDb();
    await prisma.$disconnect();
  });

  it('only audience-less announcements are public, and slugs resolve', async () => {
    await prisma.announcement.create({ data: { title: 'Public story', message: 'x', slug: 'public-story', category: 'League News' } });
    await prisma.announcement.create({ data: { title: 'Internal notice', message: 'x', audience: 'REFEREE' } });

    const { items } = await getPublicNews();
    expect(items.map((i) => i.title)).toEqual(['Public story']);

    const article = await getNewsArticle('public-story');
    expect(article?.title).toBe('Public story');

    expect(await getNewsArticle('internal-notice')).toBeNull();
  });

  it('category filtering narrows the feed', async () => {
    await prisma.announcement.create({ data: { title: 'A', message: 'x', category: 'Transfers' } });
    await prisma.announcement.create({ data: { title: 'B', message: 'x', category: 'League News' } });

    const { items } = await getPublicNews(1, 9, 'Transfers');
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('A');
  });
});

describe('helpers', () => {
  it('calculateAge counts a birthday that has not happened yet as the younger age', () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    const dob = new Date(today.getFullYear() - 30, tomorrow.getMonth(), tomorrow.getDate());
    // Guard against the fixture straddling a year boundary.
    if (dob.getMonth() >= today.getMonth()) {
      expect(calculateAge(dob)).toBe(29);
    }
    expect(calculateAge(null)).toBeNull();
  });

  it('slugify produces URL-safe slugs', () => {
    expect(slugify('Malindi United extends unbeaten run!')).toBe('malindi-united-extends-unbeaten-run');
  });
});
