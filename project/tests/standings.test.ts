import { describe, expect, it } from 'vitest';
import { computeStandings } from '../lib/standings';

const CLUBS = [
  { id: 'a', name: 'Malindi United' },
  { id: 'b', name: 'Mtwapa FC' },
  { id: 'c', name: 'Watamu FC' },
];

describe('computeStandings', () => {
  it('awards 3 points for a win and 0 for a loss', () => {
    const rows = computeStandings(CLUBS, [{ homeClubId: 'a', awayClubId: 'b', homeScore: 2, awayScore: 0 }]);
    const a = rows.find((r) => r.id === 'a')!;
    const b = rows.find((r) => r.id === 'b')!;
    expect(a.points).toBe(3);
    expect(a.won).toBe(1);
    expect(b.points).toBe(0);
    expect(b.lost).toBe(1);
  });

  it('awards 1 point each for a draw', () => {
    const rows = computeStandings(CLUBS, [{ homeClubId: 'a', awayClubId: 'b', homeScore: 1, awayScore: 1 }]);
    expect(rows.find((r) => r.id === 'a')!.points).toBe(1);
    expect(rows.find((r) => r.id === 'b')!.points).toBe(1);
    expect(rows.find((r) => r.id === 'a')!.drawn).toBe(1);
  });

  it('tracks goals for/against/played across multiple fixtures for the same club', () => {
    const rows = computeStandings(CLUBS, [
      { homeClubId: 'a', awayClubId: 'b', homeScore: 2, awayScore: 1 },
      { homeClubId: 'c', awayClubId: 'a', homeScore: 0, awayScore: 3 },
    ]);
    const a = rows.find((r) => r.id === 'a')!;
    expect(a.played).toBe(2);
    expect(a.goalsFor).toBe(5);
    expect(a.goalsAgainst).toBe(1);
    expect(a.won).toBe(2);
    expect(a.points).toBe(6);
  });

  it('sorts by points first, then goal difference, and assigns 1-based positions', () => {
    const rows = computeStandings(CLUBS, [
      // a: 1 win (3pts, GD +2)
      { homeClubId: 'a', awayClubId: 'b', homeScore: 2, awayScore: 0 },
      // c: 1 win with bigger goal difference (3pts, GD +4) — should rank above a despite equal points
      { homeClubId: 'c', awayClubId: 'b', homeScore: 4, awayScore: 0 },
    ]);
    expect(rows[0].id).toBe('c');
    expect(rows[0].position).toBe(1);
    expect(rows[1].id).toBe('a');
    expect(rows[1].position).toBe(2);
  });

  it('treats a fixture with a null score as 0-0 rather than throwing', () => {
    const rows = computeStandings(CLUBS, [{ homeClubId: 'a', awayClubId: 'b', homeScore: null, awayScore: null }]);
    expect(rows.find((r) => r.id === 'a')!.drawn).toBe(1);
  });

  it('ignores fixtures referencing a club not in the standings set', () => {
    const rows = computeStandings(CLUBS, [{ homeClubId: 'a', awayClubId: 'unknown-club', homeScore: 1, awayScore: 0 }]);
    expect(rows.find((r) => r.id === 'a')!.played).toBe(0);
  });

  it('gives every club a row even with zero fixtures played', () => {
    const rows = computeStandings(CLUBS, []);
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.played === 0 && r.points === 0)).toBe(true);
  });
});
