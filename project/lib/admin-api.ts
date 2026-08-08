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

export async function updateClub(
  id: string,
  data: { logoUrl?: string | null; name?: string; shortName?: string; yearFounded?: number | null }
) {
  const client = getApiClient();
  return client.patch(`/clubs/${id}`, data);
}

export async function deleteClub(id: string) {
  const client = getApiClient();
  return client.delete(`/clubs/${id}`);
}

export async function getAllUsers() {
  const client = getApiClient();
  return client.get('/users');
}

export async function updateUser(
  id: string,
  data: { email?: string; firstName?: string; lastName?: string; role?: string; clubId?: string | null; password?: string }
) {
  const client = getApiClient();
  return client.patch(`/users/${id}`, data);
}

export async function deleteUser(id: string) {
  const client = getApiClient();
  return client.delete(`/users/${id}`);
}

export async function deletePlayer(id: string) {
  const client = getApiClient();
  return client.delete(`/players/${id}`);
}

export async function updateFixture(
  id: string,
  data: {
    homeClubId?: string;
    awayClubId?: string;
    venueId?: string | null;
    fixtureDate?: string;
    kickoffTime?: string;
    status?: string;
    homeScore?: number | null;
    awayScore?: number | null;
  }
) {
  const client = getApiClient();
  return client.patch(`/fixtures/${id}`, data);
}

export async function deleteFixture(id: string) {
  const client = getApiClient();
  return client.delete(`/fixtures/${id}`);
}

export async function resetAllData(confirmation: string) {
  const client = getApiClient();
  return client.post('/admin/reset', { confirmation });
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

export async function submitResult(fixtureId: string, homeScore: number, awayScore: number, reportNotes?: string) {
  const client = getApiClient();
  return client.patch(`/fixtures/${fixtureId}/result`, { homeScore, awayScore, reportNotes });
}

export async function reviewMatchReport(fixtureId: string, action: 'APPROVE' | 'RETURN', notes?: string) {
  const client = getApiClient();
  return client.patch(`/fixtures/${fixtureId}/report`, { action, notes });
}

export async function getDisciplinaryCases(opts?: { status?: string; clubId?: string }) {
  const client = getApiClient();
  const params = new URLSearchParams();
  if (opts?.status) params.set('status', opts.status);
  if (opts?.clubId) params.set('clubId', opts.clubId);
  const qs = params.toString();
  return client.get(`/disciplinary${qs ? `?${qs}` : ''}`);
}

export async function createDisciplinaryCase(data: {
  playerId: string;
  fixtureId?: string | null;
  reason: string;
  decision?: string;
  decisionDate?: string;
  status?: string;
  notes?: string;
}) {
  const client = getApiClient();
  return client.post('/disciplinary', data);
}

export async function updateDisciplinaryCase(
  id: string,
  data: { reason?: string; decision?: string; decisionDate?: string | null; status?: string; notes?: string }
) {
  const client = getApiClient();
  return client.patch(`/disciplinary/${id}`, data);
}

export async function deleteDisciplinaryCase(id: string) {
  const client = getApiClient();
  return client.delete(`/disciplinary/${id}`);
}

export async function getAuditLogs(opts?: { module?: string; limit?: number }) {
  const client = getApiClient();
  const params = new URLSearchParams();
  if (opts?.module) params.set('module', opts.module);
  if (opts?.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  return client.get(`/audit-logs${qs ? `?${qs}` : ''}`);
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

export async function getAnnouncements() {
  const client = getApiClient();
  return client.get('/announcements');
}

export async function createAnnouncement(data: { title: string; message: string; audience?: string | null; priority?: string }) {
  const client = getApiClient();
  return client.post('/announcements', data);
}

export async function deleteAnnouncement(id: string) {
  const client = getApiClient();
  return client.delete(`/announcements/${id}`);
}

export async function getTeamSheets(fixtureId: string) {
  const client = getApiClient();
  return client.get(`/fixtures/${fixtureId}/team-sheets`);
}

export async function saveTeamSheet(
  fixtureId: string,
  data: { clubId: string; starters: string[]; substitutes: string[]; captainId: string }
) {
  const client = getApiClient();
  return client.put(`/fixtures/${fixtureId}/team-sheets`, data);
}
