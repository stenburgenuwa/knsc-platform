import { getApiClient } from '@/lib/api-client';

export async function getDashboardSummary() {
  const client = getApiClient();
  return client.get('/dashboard-summary');
}

export async function uploadImage(blob: Blob, kind: 'player' | 'club') {
  const client = getApiClient();
  const form = new FormData();
  form.append('file', blob, `${kind}.webp`);
  form.append('kind', kind);
  return client.post('/uploads', form);
}

export async function createClub(data: {
  name: string;
  shortName?: string;
  yearFounded?: number;
  logoUrl?: string | null;
}) {
  const client = getApiClient();
  return client.post('/clubs', data);
}

export async function updateClub(id: string, data: { logoUrl?: string | null; name?: string }) {
  const client = getApiClient();
  return client.patch(`/clubs/${id}`, data);
}

export async function updatePlayer(
  id: string,
  data: { photoUrl?: string | null; firstName?: string; lastName?: string; playerNumber?: number; position?: string }
) {
  const client = getApiClient();
  return client.patch(`/players/${id}`, data);
}

export async function createUser(data: { email: string; firstName: string; lastName: string; role: string; clubId?: string }) {
  const client = getApiClient();
  return client.post('/users', data);
}

export async function getReferees() {
  const client = getApiClient();
  return client.get('/users?role=REFEREE');
}

export async function getVenues() {
  const client = getApiClient();
  return client.get('/venues');
}

export async function getPendingPlayers() {
  const client = getApiClient();
  return client.get('/players?includePending=true&limit=100');
}

export async function approvePlayer(id: string) {
  const client = getApiClient();
  return client.patch(`/players/${id}/approve`);
}

export async function registerPlayer(data: {
  clubId: string;
  firstName: string;
  lastName: string;
  playerNumber?: number;
  position?: string;
  dateOfBirth?: string;
  photoUrl?: string | null;
}) {
  const client = getApiClient();
  return client.post('/players', data);
}

export async function createFixture(data: { homeClubId: string; awayClubId: string; venueId?: string; fixtureDate: string; kickoffTime?: string }) {
  const client = getApiClient();
  return client.post('/fixtures', data);
}

export async function assignReferee(fixtureId: string, refereeId: string) {
  const client = getApiClient();
  return client.post(`/fixtures/${fixtureId}/assign`, { refereeId });
}

export async function submitResult(fixtureId: string, homeScore: number, awayScore: number) {
  const client = getApiClient();
  return client.patch(`/fixtures/${fixtureId}/result`, { homeScore, awayScore });
}

export async function getMyAssignments() {
  const client = getApiClient();
  return client.get('/referee-assignments');
}

export async function respondToAssignment(id: string, status: 'ACCEPTED' | 'DECLINED') {
  const client = getApiClient();
  return client.patch(`/referee-assignments/${id}`, { status });
}

export async function getMatchEvents(fixtureId: string) {
  const client = getApiClient();
  return client.get(`/fixtures/${fixtureId}/events`);
}

export async function recordMatchEvent(
  fixtureId: string,
  data: { playerId: string; type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD'; minute?: number }
) {
  const client = getApiClient();
  return client.post(`/fixtures/${fixtureId}/events`, data);
}

export async function deleteMatchEvent(fixtureId: string, eventId: string) {
  const client = getApiClient();
  return client.delete(`/fixtures/${fixtureId}/events/${eventId}`);
}
