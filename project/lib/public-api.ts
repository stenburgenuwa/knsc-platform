import { getApiClient } from '@/lib/api-client';

export async function getFixtures(page = 1, limit = 12) {
  const client = getApiClient();
  return client.get(`/public/fixtures?page=${page}&limit=${limit}`);
}

export async function getResults(page = 1, limit = 12) {
  const client = getApiClient();
  return client.get(`/public/results?page=${page}&limit=${limit}`);
}

export async function getStandings() {
  const client = getApiClient();
  return client.get('/public/standings');
}

export async function getClubs(page = 1, limit = 12) {
  const client = getApiClient();
  return client.get(`/public/clubs?page=${page}&limit=${limit}`);
}

export async function getPlayers(page = 1, limit = 16) {
  const client = getApiClient();
  return client.get(`/public/players?page=${page}&limit=${limit}`);
}

export async function getNews(page = 1, limit = 10) {
  const client = getApiClient();
  return client.get(`/public/news?page=${page}&limit=${limit}`);
}

export async function getTopScorers(limit = 10) {
  const client = getApiClient();
  return client.get(`/public/top-scorers?limit=${limit}`);
}
