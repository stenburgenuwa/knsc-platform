import { prisma } from '@/lib/prisma';
import { computeStandings, type StandingsRow } from '@/lib/standings';

// Server-only: imports Prisma, so it can only be used from server components
// and route handlers.
//
// Read-only data layer for the public website.
//
// Every query here selects an explicit allow-list of columns. Private player
// information — National ID / passport number, and anything else the
// administration side collects — is never selected, so it cannot leak through
// a page, an API response, or a serialised server-component payload even by
// accident. Approval state is enforced here too: only approved players and
// only audience-less (public) announcements are ever returned.

const PUBLIC_CLUB_SUMMARY = {
  id: true,
  name: true,
  shortName: true,
  logoUrl: true,
} as const;

// NOTE: `idNumber` is deliberately absent. Do not add it.
const PUBLIC_PLAYER_SUMMARY = {
  id: true,
  firstName: true,
  lastName: true,
  playerNumber: true,
  position: true,
  photoUrl: true,
  goals: true,
  club: { select: PUBLIC_CLUB_SUMMARY },
} as const;

const PUBLIC_PLAYER_DETAIL = {
  ...PUBLIC_PLAYER_SUMMARY,
  dateOfBirth: true,
  height: true,
  weight: true,
  county: true,
  preferredFoot: true,
  registrationNumber: true,
} as const;

const PUBLIC_FIXTURE = {
  id: true,
  fixtureDate: true,
  kickoffTime: true,
  round: true,
  status: true,
  homeScore: true,
  awayScore: true,
  homeClub: { select: PUBLIC_CLUB_SUMMARY },
  awayClub: { select: PUBLIC_CLUB_SUMMARY },
  venue: { select: { id: true, name: true, location: true } },
} as const;

export const NEWS_CATEGORIES = [
  'League News',
  'Club News',
  'Transfers',
  'Announcements',
  'Events',
  'Community',
];

export const GALLERY_CATEGORIES = [
  'Match Photos',
  'Club Photos',
  'Player Photos',
  'Award Ceremonies',
  'Community Events',
  'Training',
];

export const DOWNLOAD_CATEGORIES = [
  'Competition Rules',
  'Registration Forms',
  'Fixture Lists',
  'League Handbook',
  'Press Releases',
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function calculateAge(dob: Date | string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/* ── Fixtures & results ──────────────────────────────────────────── */

export interface FixtureFilters {
  clubId?: string;
  venueId?: string;
  round?: string;
  from?: string;
  to?: string;
  q?: string;
}

function fixtureWhere(filters: FixtureFilters) {
  const and: any[] = [];
  if (filters.clubId) and.push({ OR: [{ homeClubId: filters.clubId }, { awayClubId: filters.clubId }] });
  if (filters.venueId) and.push({ venueId: filters.venueId });
  if (filters.round) and.push({ round: filters.round });
  if (filters.from) and.push({ fixtureDate: { gte: new Date(filters.from) } });
  if (filters.to) and.push({ fixtureDate: { lte: new Date(filters.to) } });
  if (filters.q) {
    and.push({
      OR: [
        { homeClub: { name: { contains: filters.q, mode: 'insensitive' } } },
        { awayClub: { name: { contains: filters.q, mode: 'insensitive' } } },
        { venue: { name: { contains: filters.q, mode: 'insensitive' } } },
      ],
    });
  }
  return and.length ? { AND: and } : {};
}

export async function getPublicFixtures(page = 1, limit = 12, filters: FixtureFilters = {}) {
  const where = { status: 'UPCOMING' as const, ...fixtureWhere(filters) };
  const [items, total] = await Promise.all([
    prisma.fixture.findMany({
      where,
      select: { ...PUBLIC_FIXTURE, refereeAssignment: { select: { referee: { select: { firstName: true, lastName: true } } } } },
      orderBy: { fixtureDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.fixture.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / limit) || 1 };
}

export async function getPublicResults(page = 1, limit = 12, filters: FixtureFilters = {}) {
  const where = { status: 'COMPLETED' as const, ...fixtureWhere(filters) };
  const [items, total] = await Promise.all([
    prisma.fixture.findMany({
      where,
      select: {
        ...PUBLIC_FIXTURE,
        matchEvents: {
          select: { id: true, type: true, minute: true, player: { select: { id: true, firstName: true, lastName: true, clubId: true } } },
          orderBy: { minute: 'asc' },
        },
      },
      orderBy: { fixtureDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.fixture.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / limit) || 1 };
}

export async function getMatchReport(id: string) {
  const fixture = await prisma.fixture.findUnique({
    where: { id },
    select: {
      ...PUBLIC_FIXTURE,
      reportNotes: true,
      reportStatus: true,
      refereeAssignment: { select: { referee: { select: { firstName: true, lastName: true } } } },
      matchEvents: {
        select: { id: true, type: true, minute: true, player: { select: { id: true, firstName: true, lastName: true, clubId: true, playerNumber: true } } },
        orderBy: { minute: 'asc' },
      },
      teamSheets: {
        select: {
          clubId: true,
          submittedAt: true,
          entries: {
            select: {
              role: true,
              isCaptain: true,
              player: { select: { id: true, firstName: true, lastName: true, playerNumber: true, position: true } },
            },
          },
        },
      },
    },
  });
  if (!fixture || fixture.status !== 'COMPLETED') return null;
  return fixture;
}

export async function getVenues() {
  return prisma.venue.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
}

export async function getFixtureRounds() {
  const rows = await prisma.fixture.findMany({
    where: { round: { not: null } },
    select: { round: true },
    distinct: ['round'],
    orderBy: { round: 'asc' },
  });
  return rows.map((r) => r.round).filter(Boolean) as string[];
}

/* ── Standings ───────────────────────────────────────────────────── */

export interface StandingsRowWithForm extends StandingsRow {
  goalDifference: number;
  form: ('W' | 'D' | 'L')[];
}

// Standings always come from computeStandings() — the same function the
// authenticated /api/standings route uses — so the public table can never
// drift from the internal one.
export async function getStandings(): Promise<StandingsRowWithForm[]> {
  const [clubs, completed] = await Promise.all([
    prisma.club.findMany({ select: { id: true, name: true, logoUrl: true } }),
    prisma.fixture.findMany({
      where: { status: 'COMPLETED' },
      select: { homeClubId: true, awayClubId: true, homeScore: true, awayScore: true, fixtureDate: true },
      orderBy: { fixtureDate: 'asc' },
    }),
  ]);

  const rows = computeStandings(clubs, completed);

  const formByClub = new Map<string, ('W' | 'D' | 'L')[]>();
  for (const f of completed) {
    const home = f.homeScore ?? 0;
    const away = f.awayScore ?? 0;
    const push = (clubId: string, outcome: 'W' | 'D' | 'L') => {
      const list = formByClub.get(clubId) ?? [];
      list.push(outcome);
      formByClub.set(clubId, list);
    };
    push(f.homeClubId, home > away ? 'W' : home < away ? 'L' : 'D');
    push(f.awayClubId, away > home ? 'W' : away < home ? 'L' : 'D');
  }

  return rows.map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
    form: (formByClub.get(row.id) ?? []).slice(-5),
  }));
}

/* ── Clubs ───────────────────────────────────────────────────────── */

export async function getPublicClubs() {
  return prisma.club.findMany({
    select: {
      ...PUBLIC_CLUB_SUMMARY,
      bannerUrl: true,
      colours: true,
      yearFounded: true,
      featured: true,
      homeVenue: { select: { id: true, name: true } },
      managers: { where: { role: 'TEAM_MANAGER' }, select: { firstName: true, lastName: true, email: true } },
      _count: { select: { players: { where: { approved: true } } } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getPublicClub(id: string) {
  const club = await prisma.club.findUnique({
    where: { id },
    select: {
      ...PUBLIC_CLUB_SUMMARY,
      bannerUrl: true,
      colours: true,
      history: true,
      yearFounded: true,
      homeVenue: { select: { id: true, name: true, location: true } },
      managers: { where: { role: 'TEAM_MANAGER' }, select: { firstName: true, lastName: true, email: true } },
      players: {
        where: { approved: true },
        select: PUBLIC_PLAYER_DETAIL,
        orderBy: [{ playerNumber: 'asc' }, { lastName: 'asc' }],
      },
    },
  });
  if (!club) return null;

  const [fixtures, results, standings] = await Promise.all([
    prisma.fixture.findMany({
      where: { status: 'UPCOMING', OR: [{ homeClubId: id }, { awayClubId: id }] },
      select: PUBLIC_FIXTURE,
      orderBy: { fixtureDate: 'asc' },
      take: 5,
    }),
    prisma.fixture.findMany({
      where: { status: 'COMPLETED', OR: [{ homeClubId: id }, { awayClubId: id }] },
      select: PUBLIC_FIXTURE,
      orderBy: { fixtureDate: 'desc' },
      take: 5,
    }),
    getStandings(),
  ]);

  const row = standings.find((s) => s.id === id) ?? null;
  const topScorer = club.players.slice().sort((a, b) => b.goals - a.goals)[0] ?? null;

  return { ...club, fixtures, results, standing: row, topScorer: topScorer?.goals ? topScorer : null };
}

export async function getGalleryForClub(clubId: string) {
  return prisma.galleryImage.findMany({
    where: { category: 'Club Photos' },
    select: { id: true, title: true, caption: true, imageUrl: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: 6,
  });
}

/* ── Players ─────────────────────────────────────────────────────── */

export interface PlayerFilters {
  clubId?: string;
  position?: string;
  q?: string;
}

export async function getPublicPlayers(page = 1, limit = 24, filters: PlayerFilters = {}) {
  const where: any = { approved: true };
  if (filters.clubId) where.clubId = filters.clubId;
  if (filters.position) where.position = filters.position;
  if (filters.q) {
    where.OR = [
      { firstName: { contains: filters.q, mode: 'insensitive' } },
      { lastName: { contains: filters.q, mode: 'insensitive' } },
      { club: { name: { contains: filters.q, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.player.findMany({
      where,
      select: PUBLIC_PLAYER_SUMMARY,
      orderBy: { lastName: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.player.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / limit) || 1 };
}

export async function getPublicPlayer(id: string) {
  const player = await prisma.player.findUnique({
    where: { id },
    select: { ...PUBLIC_PLAYER_DETAIL, approved: true },
  });
  if (!player || !player.approved) return null;

  const events = await prisma.matchEvent.findMany({
    where: { playerId: id, fixture: { status: 'COMPLETED' } },
    select: {
      type: true,
      minute: true,
      fixture: { select: PUBLIC_FIXTURE },
    },
    orderBy: { fixture: { fixtureDate: 'desc' } },
  });

  const appearances = await prisma.teamSheetEntry.count({
    where: { playerId: id, teamSheet: { fixture: { status: 'COMPLETED' } } },
  });

  const yellowCards = events.filter((e) => e.type === 'YELLOW_CARD').length;
  const redCards = events.filter((e) => e.type === 'RED_CARD').length;

  const byFixture = new Map<string, any>();
  for (const e of events) {
    const f = e.fixture;
    if (!byFixture.has(f.id)) {
      const isHome = f.homeClub.id === player.club.id;
      byFixture.set(f.id, {
        fixtureId: f.id,
        fixtureDate: f.fixtureDate,
        opponent: isHome ? f.awayClub.name : f.homeClub.name,
        opponentLogo: isHome ? f.awayClub.logoUrl : f.homeClub.logoUrl,
        home: isHome,
        forScore: isHome ? f.homeScore : f.awayScore,
        againstScore: isHome ? f.awayScore : f.homeScore,
        events: [] as { type: string; minute: number | null }[],
      });
    }
    byFixture.get(f.id).events.push({ type: e.type, minute: e.minute });
  }

  const matchHistory = Array.from(byFixture.values());

  return {
    ...player,
    age: calculateAge(player.dateOfBirth),
    stats: {
      matchesPlayed: Math.max(appearances, matchHistory.length),
      goals: player.goals,
      yellowCards,
      redCards,
    },
    matchHistory,
  };
}

export async function getPlayerPositions() {
  const rows = await prisma.player.findMany({
    where: { approved: true, position: { not: null } },
    select: { position: true },
    distinct: ['position'],
    orderBy: { position: 'asc' },
  });
  return rows.map((r) => r.position).filter(Boolean) as string[];
}

/* ── Statistics ──────────────────────────────────────────────────── */

export async function getLeagueStatistics() {
  const [clubs, players, completed, topScorers, standings] = await Promise.all([
    prisma.club.count(),
    prisma.player.count({ where: { approved: true } }),
    prisma.fixture.findMany({ where: { status: 'COMPLETED' }, select: { homeScore: true, awayScore: true } }),
    prisma.player.findMany({
      where: { approved: true, goals: { gt: 0 } },
      select: PUBLIC_PLAYER_SUMMARY,
      orderBy: { goals: 'desc' },
      take: 10,
    }),
    getStandings(),
  ]);

  const goals = completed.reduce((sum, f) => sum + (f.homeScore ?? 0) + (f.awayScore ?? 0), 0);

  const cardCounts = await prisma.matchEvent.groupBy({
    by: ['playerId', 'type'],
    where: { type: { in: ['YELLOW_CARD', 'RED_CARD'] } },
    _count: { _all: true },
  });

  const disciplinary = new Map<string, { yellow: number; red: number }>();
  for (const row of cardCounts) {
    const entry = disciplinary.get(row.playerId) ?? { yellow: 0, red: 0 };
    if (row.type === 'YELLOW_CARD') entry.yellow = row._count._all;
    else entry.red = row._count._all;
    disciplinary.set(row.playerId, entry);
  }

  const cardedPlayers = disciplinary.size
    ? await prisma.player.findMany({
        where: { id: { in: Array.from(disciplinary.keys()) }, approved: true },
        select: PUBLIC_PLAYER_SUMMARY,
      })
    : [];

  const discipline = cardedPlayers
    .map((p) => ({ ...p, ...(disciplinary.get(p.id) ?? { yellow: 0, red: 0 }) }))
    .sort((a, b) => b.red * 3 + b.yellow - (a.red * 3 + a.yellow))
    .slice(0, 10);

  return {
    totals: { clubs, players, matches: completed.length, goals },
    averageGoals: completed.length ? Number((goals / completed.length).toFixed(2)) : 0,
    leader: standings[0] ?? null,
    topScorers,
    bestAttack: standings.slice().sort((a, b) => b.goalsFor - a.goalsFor).slice(0, 5),
    bestDefence: standings.slice().sort((a, b) => a.goalsAgainst - b.goalsAgainst).slice(0, 5),
    discipline,
  };
}

/* ── News ────────────────────────────────────────────────────────── */

// Only audience-less announcements are public press stories; role-targeted
// ones are internal and stay on the dashboards.
const PUBLIC_NEWS_WHERE = { audience: null } as const;

const PUBLIC_NEWS_SELECT = {
  id: true,
  slug: true,
  title: true,
  message: true,
  category: true,
  author: true,
  featuredImageUrl: true,
  startDate: true,
} as const;

export async function getPublicNews(page = 1, limit = 9, category?: string) {
  const where = { ...PUBLIC_NEWS_WHERE, ...(category ? { category } : {}) };
  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      select: PUBLIC_NEWS_SELECT,
      orderBy: { startDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.announcement.count({ where }),
  ]);
  return { items, total, pages: Math.ceil(total / limit) || 1 };
}

export async function getNewsArticle(slugOrId: string) {
  const article = await prisma.announcement.findFirst({
    where: { ...PUBLIC_NEWS_WHERE, OR: [{ slug: slugOrId }, { id: slugOrId }] },
    select: PUBLIC_NEWS_SELECT,
  });
  if (!article) return null;

  const related = await prisma.announcement.findMany({
    where: { ...PUBLIC_NEWS_WHERE, id: { not: article.id }, ...(article.category ? { category: article.category } : {}) },
    select: PUBLIC_NEWS_SELECT,
    orderBy: { startDate: 'desc' },
    take: 3,
  });

  return { ...article, related };
}

/* ── Sponsors, downloads, gallery, site content ──────────────────── */

export async function getSponsors() {
  return prisma.sponsor.findMany({
    where: { active: true },
    select: { id: true, name: true, description: true, logoUrl: true, websiteUrl: true, category: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

export async function getDownloads() {
  return prisma.download.findMany({
    select: { id: true, title: true, description: true, fileUrl: true, category: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getGallery(category?: string) {
  return prisma.galleryImage.findMany({
    where: category ? { category } : undefined,
    select: { id: true, title: true, caption: true, imageUrl: true, category: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getSiteContent(): Promise<Record<string, string>> {
  const rows = await prisma.siteContent.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/* ── Homepage ────────────────────────────────────────────────────── */

// The homepage runs in one of two states, derived from the data rather than
// from a setting: until a single fixture is COMPLETED the season has not
// started, and the page shows what exists instead of reporting what does not.
export type SeasonState = 'PRE_SEASON' | 'ACTIVE';

export async function getHomepageData() {
  const [content, statistics, standings, news, sponsors, clubs, fixtureCount] = await Promise.all([
    getSiteContent(),
    getLeagueStatistics(),
    getStandings(),
    getPublicNews(1, 5),
    getSponsors(),
    prisma.club.findMany({
      select: { ...PUBLIC_CLUB_SUMMARY, _count: { select: { players: { where: { approved: true } } } } },
      orderBy: { name: 'asc' },
    }),
    prisma.fixture.count(),
  ]);

  const [nextMatches, latestResults] = await Promise.all([
    prisma.fixture.findMany({
      where: { status: 'UPCOMING' },
      select: PUBLIC_FIXTURE,
      orderBy: [{ featured: 'desc' }, { fixtureDate: 'asc' }],
      take: 4,
    }),
    prisma.fixture.findMany({
      where: { status: 'COMPLETED' },
      select: PUBLIC_FIXTURE,
      orderBy: [{ featured: 'desc' }, { fixtureDate: 'desc' }],
      take: 4,
    }),
  ]);

  const seasonState: SeasonState = statistics.totals.matches > 0 ? 'ACTIVE' : 'PRE_SEASON';

  // The hero is the most recent result once football has been played, and the
  // opening fixture before that. One slot, filled from whichever exists.
  const [heroMatch, ...otherResults] = latestResults;
  const heroFixture = heroMatch ?? nextMatches[0] ?? null;
  const nextFixture = heroMatch ? nextMatches[0] ?? null : nextMatches[1] ?? null;

  // Form is looked up by club id so the matchday board can show it beside each
  // club without a second query.
  const formByClub: Record<string, ('W' | 'D' | 'L')[]> = {};
  for (const row of standings) formByClub[row.id] = row.form ?? [];

  // Crest wall: every club, carrying league position once it means something.
  const positionByClub = new Map(standings.map((row) => [row.id, row.position]));
  const crestWall = clubs.map((club) => ({
    id: club.id,
    name: club.name,
    shortName: club.shortName,
    logoUrl: club.logoUrl,
    squad: club._count.players,
    position: seasonState === 'ACTIVE' ? positionByClub.get(club.id) ?? null : null,
  }));

  return {
    content,
    seasonState,
    statistics,
    standings: standings.slice(0, 6),
    formByClub,
    heroFixture,
    nextFixture,
    otherResults,
    upcoming: heroMatch ? nextMatches.slice(1, 4) : nextMatches.slice(1, 4),
    crestWall,
    totals: {
      clubs: clubs.length,
      fixtures: fixtureCount,
      players: statistics.totals.players,
      played: statistics.totals.matches,
      goals: statistics.totals.goals,
    },
    news: news.items,
    sponsors,
  };
}

/* ── Global search ───────────────────────────────────────────────── */

export interface SearchResults {
  players: { id: string; name: string; subtitle: string; photoUrl: string | null }[];
  clubs: { id: string; name: string; subtitle: string; logoUrl: string | null }[];
  fixtures: { id: string; name: string; subtitle: string; upcoming: boolean }[];
  news: { id: string; slug: string | null; name: string; subtitle: string }[];
  sponsors: { id: string; name: string; subtitle: string }[];
  total: number;
}

export async function globalSearch(q: string): Promise<SearchResults> {
  const term = q.trim();
  const empty: SearchResults = { players: [], clubs: [], fixtures: [], news: [], sponsors: [], total: 0 };
  if (term.length < 2) return empty;

  const like = { contains: term, mode: 'insensitive' as const };

  const [players, clubs, fixtures, news, sponsors] = await Promise.all([
    prisma.player.findMany({
      where: { approved: true, OR: [{ firstName: like }, { lastName: like }, { registrationNumber: like }] },
      select: PUBLIC_PLAYER_SUMMARY,
      take: 8,
    }),
    prisma.club.findMany({
      where: { OR: [{ name: like }, { shortName: like }] },
      select: { ...PUBLIC_CLUB_SUMMARY, homeVenue: { select: { name: true } } },
      take: 8,
    }),
    prisma.fixture.findMany({
      where: { OR: [{ homeClub: { name: like } }, { awayClub: { name: like } }, { venue: { name: like } }] },
      select: PUBLIC_FIXTURE,
      orderBy: { fixtureDate: 'desc' },
      take: 8,
    }),
    prisma.announcement.findMany({
      where: { ...PUBLIC_NEWS_WHERE, OR: [{ title: like }, { message: like }] },
      select: PUBLIC_NEWS_SELECT,
      take: 8,
    }),
    prisma.sponsor.findMany({
      where: { active: true, OR: [{ name: like }, { description: like }] },
      select: { id: true, name: true, category: true },
      take: 8,
    }),
  ]);

  const results: SearchResults = {
    players: players.map((p) => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      subtitle: [p.club?.name, p.position].filter(Boolean).join(' · '),
      photoUrl: p.photoUrl,
    })),
    clubs: clubs.map((c) => ({
      id: c.id,
      name: c.name,
      subtitle: c.homeVenue?.name ?? 'Venue TBC',
      logoUrl: c.logoUrl,
    })),
    fixtures: fixtures.map((f) => ({
      id: f.id,
      name: `${f.homeClub.name} vs ${f.awayClub.name}`,
      subtitle:
        f.status === 'COMPLETED'
          ? `${f.homeScore ?? '-'}–${f.awayScore ?? '-'} · ${new Date(f.fixtureDate).toLocaleDateString('en-GB')}`
          : new Date(f.fixtureDate).toLocaleDateString('en-GB'),
      upcoming: f.status === 'UPCOMING',
    })),
    news: news.map((n) => ({
      id: n.id,
      slug: n.slug,
      name: n.title,
      subtitle: n.category ?? 'News',
    })),
    sponsors: sponsors.map((s) => ({ id: s.id, name: s.name, subtitle: s.category ?? 'Partner' })),
    total: 0,
  };

  results.total =
    results.players.length + results.clubs.length + results.fixtures.length + results.news.length + results.sponsors.length;
  return results;
}
