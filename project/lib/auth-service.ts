import { getApiClient } from '@/lib/api-client';

export async function login(email: string, password: string) {
  const client = getApiClient();
  return client.post('/auth/login', { email, password });
}

export async function logout() {
  const client = getApiClient();
  return client.post('/auth/logout');
}

export async function getDashboard(role: string) {
  const client = getApiClient();
  const endpoints: Record<string, string> = {
    'Platform Owner': '/platform-owner/dashboard',
    'League Manager': '/league-manager/dashboard',
    'Team Manager': '/team-manager/dashboard',
    'Referee': '/referee/dashboard',
  };
  return client.get(endpoints[role] || '/dashboard');
}
