import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/auth';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
    });

    apiClient.interceptors.request.use((config) => {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
  }
  return apiClient;
}

export async function apiCall<T>(
  method: string,
  url: string,
  data?: any
): Promise<T> {
  const client = getApiClient();
  const response = await client({
    method,
    url,
    data,
  });
  return response.data;
}
