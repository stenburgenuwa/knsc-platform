import { API_BASE_URL, DEFAULT_PAGE_LIMIT } from '../constants';
import type { HomePageStats, FixtureCardData, PaginationData } from '../types';

export class FixtureService {
  static async getUpcomingFixtures(
    page: number = 1,
    limit: number = 12,
    filters?: { competition?: string; round?: string; club?: string; venue?: string }
  ): Promise<{ fixtures: FixtureCardData[]; pagination: PaginationData }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'upcoming',
        ...(filters?.competition && { competition: filters.competition }),
        ...(filters?.round && { round: filters.round }),
        ...(filters?.club && { club: filters.club }),
        ...(filters?.venue && { venue: filters.venue }),
      });

      const response = await fetch(`${API_BASE_URL}/public/fixtures?${params}`);
      if (!response.ok) throw new Error('Failed to fetch fixtures');

      return response.json();
    } catch (error) {
      console.error('Fixture service error:', error);
      throw error;
    }
  }

  static async getFixtureDetail(fixtureId: string): Promise<FixtureCardData> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/fixtures/${fixtureId}`);
      if (!response.ok) throw new Error('Fixture not found');
      return response.json();
    } catch (error) {
      console.error('Fixture detail error:', error);
      throw error;
    }
  }

  static async getTodayFixtures(): Promise<FixtureCardData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/fixtures/today`);
      if (!response.ok) throw new Error('Failed to fetch today fixtures');
      const data = await response.json();
      return data.fixtures || [];
    } catch (error) {
      console.error('Today fixtures error:', error);
      return [];
    }
  }

  static async getNextFixture(): Promise<FixtureCardData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/fixtures/next`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('Next fixture error:', error);
      return null;
    }
  }
}
