import { API_BASE_URL } from '../constants';
import type { SponsorData, GalleryItem } from '../types';

export class ContentService {
  // Sponsors
  static async getSponsors(): Promise<SponsorData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/sponsors`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.sponsors || [];
    } catch (error) {
      console.error('Sponsors error:', error);
      return [];
    }
  }

  // Gallery
  static async getGallery(
    category?: string,
    page: number = 1,
    limit: number = 12
  ): Promise<{ items: GalleryItem[]; total: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
      });

      const response = await fetch(`${API_BASE_URL}/public/gallery?${params}`);
      if (!response.ok) return { items: [], total: 0 };
      return response.json();
    } catch (error) {
      console.error('Gallery error:', error);
      return { items: [], total: 0 };
    }
  }

  // Downloads
  static async getDownloads(): Promise<Array<{ id: string; title: string; url: string; category: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/downloads`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.downloads || [];
    } catch (error) {
      console.error('Downloads error:', error);
      return [];
    }
  }

  // Contact
  static async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to submit form');
      return response.json();
    } catch (error) {
      console.error('Contact form error:', error);
      throw error;
    }
  }

  // Search
  static async search(query: string, limit: number = 20): Promise<Array<{
    type: string;
    id: string;
    title: string;
    url: string;
  }>> {
    try {
      const params = new URLSearchParams({ q: query, limit: limit.toString() });
      const response = await fetch(`${API_BASE_URL}/public/search?${params}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Home page stats
  static async getHomePageStats(): Promise<{
    totalClubs: number;
    totalPlayers: number;
    totalMatches: number;
    goalsScoredTotal: number;
    leagueLeader: { clubName: string; clubLogo: string; points: number };
    topScorer: { playerName: string; clubName: string; goals: number };
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/home/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    } catch (error) {
      console.error('Home stats error:', error);
      throw error;
    }
  }
}
