import { API_BASE_URL } from '../constants';
import type { ResultCardData, MatchReportData, PaginationData } from '../types';

export class ResultService {
  static async getResults(
    page: number = 1,
    limit: number = 12,
    filters?: { date?: string; competition?: string; club?: string }
  ): Promise<{ results: ResultCardData[]; pagination: PaginationData }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'completed',
        ...(filters?.date && { date: filters.date }),
        ...(filters?.competition && { competition: filters.competition }),
        ...(filters?.club && { club: filters.club }),
      });

      const response = await fetch(`${API_BASE_URL}/public/results?${params}`);
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    } catch (error) {
      console.error('Result service error:', error);
      throw error;
    }
  }

  static async getResultDetail(fixtureId: string): Promise<ResultCardData> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/results/${fixtureId}`);
      if (!response.ok) throw new Error('Result not found');
      return response.json();
    } catch (error) {
      console.error('Result detail error:', error);
      throw error;
    }
  }

  static async getMatchReport(fixtureId: string): Promise<MatchReportData> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/reports/${fixtureId}`);
      if (!response.ok) throw new Error('Match report not found');
      return response.json();
    } catch (error) {
      console.error('Match report error:', error);
      throw error;
    }
  }

  static async getLatestResults(limit: number = 5): Promise<ResultCardData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/public/results/latest?limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Latest results error:', error);
      return [];
    }
  }
}
