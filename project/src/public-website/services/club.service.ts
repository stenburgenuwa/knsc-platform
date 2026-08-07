import { API_BASE_URL } from '../constants';
import type { ClubCardData, ClubProfileData, PaginationData } from '../types';

export class ClubService {
  static async getClubs(
    page: number = 1,
    limit: number = 12
  ): Promise<{ clubs: ClubCardData[]; pagination: PaginationData }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/public/clubs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch clubs');
      return response.json();
    } catch (error) {
      console.error('Club service error:', error);
      throw error;
    }
  }

  static async getClubDetail(clubId: string): Promise<ClubProfileData> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/clubs/${clubId}`);
      if (!response.ok) throw new Error('Club not found');
      return response.json();
    } catch (error) {
      console.error('Club detail error:', error);
      throw error;
    }
  }

  static async getFeaturedClubs(limit: number = 3): Promise<ClubCardData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/clubs/featured?limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.clubs || [];
    } catch (error) {
      console.error('Featured clubs error:', error);
      return [];
    }
  }
}
