export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  pagination?: { page: number; limit: number; total: number; hasNextPage: boolean; hasPreviousPage: boolean };
  timestamp: string;
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;

  private constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  static getInstance(baseUrl: string = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(baseUrl);
    }
    return ApiClient.instance;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  }

  buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }
}
