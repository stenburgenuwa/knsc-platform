import { getApiClient } from '@/lib/api-client';

export async function login(email: string, password: string) {
  const client = getApiClient();
  return client.post('/auth/login', { email, password });
}

export async function getMe() {
  const client = getApiClient();
  return client.get('/auth/me');
}
