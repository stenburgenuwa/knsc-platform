// Pure standings computation, factored out of app/api/standings/route.ts
// so the W/D/L/points/GD logic can be unit tested without a database.

export interface StandingsFixture {
  homeClubId: string;
  awayClubId: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface StandingsClub {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface StandingsRow {
  id: string;
  clubName: string;
  logoUrl: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  position: number;
}

export function computeStandings(clubs: StandingsClub[], completedFixtures: StandingsFixture[]): StandingsRow[] {
  const table = new Map<string, Omit<StandingsRow, 'position'>>(
    clubs.map((club) => [
      club.id,
      {
        id: club.id,
        clubName: club.name,
        logoUrl: club.logoUrl ?? null,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      },
    ])
  );

  for (const fixture of completedFixtures) {
    const home = table.get(fixture.homeClubId);
    const away = table.get(fixture.awayClubId);
    const homeScore = fixture.homeScore ?? 0;
    const awayScore = fixture.awayScore ?? 0;
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;
    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (homeScore < awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return Array.from(table.values())
    .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
    .map((row, index) => ({ ...row, position: index + 1 }));
}
