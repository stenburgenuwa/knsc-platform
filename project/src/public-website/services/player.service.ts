import { API_BASE_URL } from '../constants';
import type { PlayerCardData, PlayerProfileData, PaginationData } from '../types';

export class PlayerService {
  static async getPlayers(
    page: number = 1,
    limit: number = 16,
    filters?: { club?: string; position?: string }
  ): Promise<{ players: PlayerCardData[]; pagination: PaginationData }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        approved: 'true',
        ...(filters?.club && { club: filters.club }),
        ...(filters?.position && { position: filters.position }),
      });

      const response = await fetch(`${API_BASE_URL}/public/players?${params}`);
      if (!response.ok) throw new Error('Failed to fetch players');
      return response.json();
    } catch (error) {
      console.error('Player service error:', error);
      throw error;
    }
  }

  static async getPlayerDetail(playerId: string): Promise<PlayerProfileData> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/players/${playerId}`);
      if (!response.ok) throw new Error('Player not found');
      return response.json();
    } catch (error) {
      console.error('Player detail error:', error);
      throw error;
    }
  }

  static async getFeaturedPlayers(limit: number = 6): Promise<PlayerCardData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/players/featured?limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.players || [];
    } catch (error) {
      console.error('Featured players error:', error);
      return [];
    }
  }

  static async getTopScorers(limit: number = 10): Promise<PlayerProfileData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/players/top-scorers?limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.players || [];
    } catch (error) {
      console.error('Top scorers error:', error);
      return [];
    }
  }
}
