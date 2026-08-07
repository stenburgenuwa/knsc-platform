import { API_BASE_URL } from '../constants';
import type { LeagueStandingsRow } from '../types';

export class StandingsService {
  static async getLeagueStandings(leagueId?: string): Promise<LeagueStandingsRow[]> {
    try {
      const url = leagueId
        ? `${API_BASE_URL}/public/standings?leagueId=${leagueId}`
        : `${API_BASE_URL}/public/standings`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch standings');
      const data = await response.json();
      return data.standings || [];
    } catch (error) {
      console.error('Standings service error:', error);
      throw error;
    }
  }

  static async getTopScorers(limit: number = 10): Promise<Array<{ name: string; club: string; goals: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/top-scorers?limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.scorers || [];
    } catch (error) {
      console.error('Top scorers error:', error);
      return [];
    }
  }

  static async getLeagueStats(): Promise<{
    totalClubs: number;
    totalPlayers: number;
    totalMatches: number;
    goalsScoredTotal: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/statistics`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    } catch (error) {
      console.error('Statistics error:', error);
      throw error;
    }
  }
}
