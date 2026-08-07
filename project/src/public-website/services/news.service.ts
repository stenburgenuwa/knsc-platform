import { API_BASE_URL } from '../constants';
import type { NewsArticleData, PaginationData } from '../types';

export class NewsService {
  static async getNews(
    page: number = 1,
    limit: number = 10,
    category?: string
  ): Promise<{ news: NewsArticleData[]; pagination: PaginationData }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
      });

      const response = await fetch(`${API_BASE_URL}/public/news?${params}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    } catch (error) {
      console.error('News service error:', error);
      throw error;
    }
  }

  static async getNewsDetail(newsId: string): Promise<NewsArticleData> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/news/${newsId}`);
      if (!response.ok) throw new Error('News not found');
      return response.json();
    } catch (error) {
      console.error('News detail error:', error);
      throw error;
    }
  }

  static async getLatestNews(limit: number = 5): Promise<NewsArticleData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/news/latest?limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.news || [];
    } catch (error) {
      console.error('Latest news error:', error);
      return [];
    }
  }

  static async getFeaturedNews(limit: number = 3): Promise<NewsArticleData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/news/featured?limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.news || [];
    } catch (error) {
      console.error('Featured news error:', error);
      return [];
    }
  }
}
