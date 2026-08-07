import { getApiClient } from '@/lib/api-client';

// Routes served under app/api/*, mounted at NEXT_PUBLIC_API_URL (default /api) — no /public prefix.
export async function getFixtures(page = 1, limit = 12) {
  const client = getApiClient();
  return client.get(`/fixtures?page=${page}&limit=${limit}`);
}

export async function getResults(page = 1, limit = 12) {
  const client = getApiClient();
  return client.get(`/results?page=${page}&limit=${limit}`);
}

export async function getStandings() {
  const client = getApiClient();
  return client.get('/standings');
}

export async function getClubs(page = 1, limit = 12) {
  const client = getApiClient();
  return client.get(`/clubs?page=${page}&limit=${limit}`);
}

export async function getClub(id: string) {
  const client = getApiClient();
  return client.get(`/clubs/${id}`);
}

export async function getPlayers(page = 1, limit = 16, opts?: { clubId?: string; includePending?: boolean }) {
  const client = getApiClient();
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (opts?.clubId) params.set('clubId', opts.clubId);
  if (opts?.includePending) params.set('includePending', 'true');
  return client.get(`/players?${params.toString()}`);
}

export async function getNews(page = 1, limit = 10) {
  const client = getApiClient();
  return client.get(`/news?page=${page}&limit=${limit}`);
}
