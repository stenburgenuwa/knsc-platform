'use client';

import { useEffect, useState } from 'react';
import {
  getDashboardSummary,
  getMyAssignments,
  respondToAssignment,
  submitResult,
  getMatchEvents,
  recordMatchEvent,
  deleteMatchEvent,
  getTeamSheets,
  type MatchEventType,
} from '@/lib/admin-api';
import StatCard from '@/components/StatCard';
import Avatar from '@/components/Avatar';
import { getMe, updateMyAvailability } from '@/lib/auth-service';
import AnnouncementsPanel from '@/components/AnnouncementsPanel';

const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
  ON_LEAVE: 'On leave',
  INJURED: 'Injured',
};

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const EVENT_LABELS: Record<string, string> = {
  GOAL: 'Goal',
  OWN_GOAL: 'Own goal',
  YELLOW_CARD: 'Yellow card',
  RED_CARD: 'Red card',
};

const EVENT_TYPES = ['GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD'] as const;

const fullName = (p: { firstName: string; middleName?: string | null; lastName: string }) =>
  [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');

export default function RefereeDashboard() {
  const [data, setData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [events, setEvents] = useState<Record<string, any[]>>({});
  const [teamSheets, setTeamSheets] = useState<Record<string, { home: any; away: any }>>({});
  const [teamSheetsOpen, setTeamSheetsOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  // Keyed by `${fixtureId}:HOME` / `:AWAY` so the two sides never share a draft.
  const [eventForm, setEventForm] = useState<Record<string, { playerId: string; type: string; minute: string }>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string>('AVAILABLE');
  const [availabilitySaving, setAvailabilitySaving] = useState(false);

  const load = async () => {
    try {
      const [summary, assignmentsRes, meRes] = await Promise.all([getDashboardSummary(), getMyAssignments(), getMe()]);
      setData(summary.data?.data);
      setAvailability(meRes.data?.data?.availability || 'AVAILABLE');
      const list = assignmentsRes.data?.data || [];
      setAssignments(list);

      const accepted = list.filter((a: any) => a.status === 'ACCEPTED' || a.status === 'COMPLETED');

      const eventEntries = await Promise.all(
        accepted.map(async (a: any) => {
          const res = await getMatchEvents(a.fixture.id);
          return [a.fixture.id, res.data?.data || []] as const;
        })
      );
      setEvents(Object.fromEntries(eventEntries));

      const teamSheetEntries = await Promise.all(
        accepted.map(async (a: any) => {
          const res = await getTeamSheets(a.fixture.id);
          return [a.fixture.id, res.data?.data || { home: null, away: null }] as const;
        })
      );
      setTeamSheets(Object.fromEntries(teamSheetEntries));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const respond = async (id: string, decision: 'ACCEPTED' | 'DECLINED') => {
    await respondToAssignment(id, decision);
    load();
  };

  const handleSubmitResult = async (fixtureId: string) => {
    const s = scores[fixtureId];
    if (!s || s.home === '' || s.away === '') {
      setStatus('Enter both scores before submitting.');
      return;
    }
    try {
      await submitResult(fixtureId, Number(s.home), Number(s.away), notes[fixtureId]);
      setStatus('Match report submitted for review.');
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to submit result.');
    }
  };

  const handleAddEvent = async (fixtureId: string, side: 'HOME' | 'AWAY') => {
    const key = `${fixtureId}:${side}`;
    const form = eventForm[key];
    if (!form?.playerId || !form?.type) {
      setStatus('Pick a player and an event type first.');
      return;
    }
    try {
      await recordMatchEvent(fixtureId, {
        playerId: form.playerId,
        type: form.type as MatchEventType,
        minute: form.minute ? Number(form.minute) : undefined,
      });
      setStatus(null);
      setEventForm({ ...eventForm, [key]: { playerId: '', type: 'GOAL', minute: '' } });
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to record event.');
    }
  };

  const handleRemoveEvent = async (fixtureId: string, eventId: string) => {
    await deleteMatchEvent(fixtureId, eventId);
    load();
  };

  const handleAvailabilityChange = async (value: string) => {
    setAvailability(value);
    setAvailabilitySaving(true);
    try {
      await updateMyAvailability(value as any);
    } catch {
      // reload to fall back to the last-saved value if the update failed
      load();
    } finally {
      setAvailabilitySaving(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>Referee Dashboard</h1>

      {loading ? (
        <p className="text-muted">Loading&hellip;</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <StatCard label="Assigned Matches" value={data?.assignedMatches || 0} />
            <StatCard label="Pending Reports" value={data?.pendingReports || 0} tone="warning" />
            <StatCard label="Average Rating" value={data?.avgRating || '4.5'} tone="accent" />
            <StatCard label="Matches Officiated" value={data?.matchesOfficiated || 0} />
          </div>

          <div className="card elev-sm" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 className="card-title">My Availability</h3>
            <p className="card-meta">The Referee Manager sees this before assigning you to a fixture.</p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="input"
                style={{ maxWidth: 220 }}
                value={availability}
                disabled={availabilitySaving}
                onChange={(e) => handleAvailabilityChange(e.target.value)}
              >
                {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <span className={`tag ${availability === 'AVAILABLE' ? 'tag-accent' : 'tag-neutral'}`}>
                {AVAILABILITY_LABELS[availability]}
              </span>
            </div>
          </div>

          <div className="card elev-sm">
            <h3 className="card-title">My Assignments</h3>
            {status && <p className="card-meta">{status}</p>}
            {assignments.length === 0 ? (
              <p className="card-meta">No assignments yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {assignments.map((a) => {
                  const sheets = teamSheets[a.fixture.id] || { home: null, away: null };
                  // Only the players their Team Manager named — 11 starters
                  // plus 7 substitutes — can appear in the match record.
                  const selected = (sheet: any) => (sheet ? [...sheet.starters, ...sheet.substitutes] : []);
                  const homeSelected = selected(sheets.home);
                  const awaySelected = selected(sheets.away);
                  const fixtureEvents = events[a.fixture.id] || [];
                  const reportStatus = a.fixture.reportStatus;
                  const reportLocked = reportStatus === 'SUBMITTED' || reportStatus === 'APPROVED';
                  const canEnterResult = a.status === 'ACCEPTED' && (a.fixture.status === 'UPCOMING' || reportStatus === 'RETURNED');

                  return (
                    <div key={a.id} style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                            {a.fixture.homeClub.name} vs {a.fixture.awayClub.name}
                          </p>
                          <p className="card-meta">
                            {a.fixture.venue?.name || 'Venue TBC'} &bull; {formatDate(a.fixture.fixtureDate)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                          <span className="tag tag-neutral">{a.status}</span>
                          {reportStatus === 'SUBMITTED' && <span className="tag tag-accent">Report awaiting review</span>}
                          {reportStatus === 'APPROVED' && <span className="tag tag-accent">Report approved</span>}
                          {reportStatus === 'RETURNED' && <span className="tag tag-accent-2">Returned &mdash; please correct</span>}
                        </div>
                      </div>

                      {a.status === 'ASSIGNED' && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                          <button className="btn btn-primary" onClick={() => respond(a.id, 'ACCEPTED')}>Accept</button>
                          <button className="btn btn-secondary" onClick={() => respond(a.id, 'DECLINED')}>Decline</button>
                        </div>
                      )}

                      {(a.status === 'ACCEPTED' || a.status === 'COMPLETED') && (
                        <div style={{ marginTop: 'var(--space-3)' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ marginBottom: 'var(--space-2)' }}
                            onClick={() => setTeamSheetsOpen({ ...teamSheetsOpen, [a.fixture.id]: !teamSheetsOpen[a.fixture.id] })}
                          >
                            {teamSheetsOpen[a.fixture.id] ? 'Hide Team Sheets' : 'View Team Sheets'}
                          </button>

                          {teamSheetsOpen[a.fixture.id] && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                              {[
                                { label: `Home — ${a.fixture.homeClub.name}`, sheet: sheets.home },
                                { label: `Away — ${a.fixture.awayClub.name}`, sheet: sheets.away },
                              ].map(({ label, sheet }) => (
                                <div key={label}>
                                  <p className="card-kicker">{label}</p>
                                  {!sheet ? (
                                    <p className="card-meta">Team sheet not submitted yet.</p>
                                  ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                      <table className="table">
                                        <thead>
                                          <tr>
                                            <th style={{ width: 36 }}>#</th>
                                            <th style={{ width: 52 }}>Photo</th>
                                            <th>Player name</th>
                                            <th>Registration number</th>
                                            <th>Jersey number</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {[...sheet.starters, ...sheet.substitutes].map((p: any, idx: number) => (
                                            <tr key={p.playerId}>
                                              <td>{idx + 1}</td>
                                              <td><Avatar src={p.photoUrl} name={fullName(p)} size={34} rounded="square" /></td>
                                              <td>
                                                {fullName(p)}
                                                {p.isCaptain && <span className="tag tag-accent-2" style={{ marginLeft: 6 }}>C</span>}
                                              </td>
                                              <td>{p.registrationNumber || '—'}</td>
                                              <td>{p.jerseyNumber ?? '—'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="card-kicker" style={{ marginBottom: 'var(--space-2)' }}>Match Events</p>

                          {/* Home and away are kept apart so the referee is
                              always recording against the right team. */}
                          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            {([
                              { side: 'HOME', club: a.fixture.homeClub, players: homeSelected },
                              { side: 'AWAY', club: a.fixture.awayClub, players: awaySelected },
                            ] as const).map(({ side, club, players }) => {
                              const sideEvents = fixtureEvents.filter((ev: any) => ev.player.clubId === club.id);
                              const sideForm =
                                eventForm[`${a.fixture.id}:${side}`] || { playerId: '', type: 'GOAL', minute: '' };
                              const key = `${a.fixture.id}:${side}`;
                              return (
                                <div key={side}>
                                  <p className="card-meta" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)', marginBottom: 4 }}>
                                    {side === 'HOME' ? 'Home' : 'Away'} &mdash; {club.name}
                                  </p>

                                  {sideEvents.length === 0 ? (
                                    <p className="card-meta">No events recorded.</p>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 'var(--space-2)' }}>
                                      {sideEvents.map((ev: any) => (
                                        <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, gap: 6 }}>
                                          <span>
                                            {ev.minute ? `${ev.minute}' ` : ''}
                                            <strong>{EVENT_LABELS[ev.type] || ev.type}</strong> &mdash; {fullName(ev.player)}
                                          </span>
                                          {!reportLocked && (
                                            <button className="btn btn-ghost" style={{ fontSize: 12, flex: 'none' }} onClick={() => handleRemoveEvent(a.fixture.id, ev.id)}>
                                              Remove
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {!reportLocked && (
                                    players.length === 0 ? (
                                      <p className="card-meta">
                                        {club.name} have not submitted a team sheet, so there are no selected players to record against.
                                      </p>
                                    ) : (
                                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                        <div className="field" style={{ marginBottom: 0, minWidth: 150 }}>
                                          <label htmlFor={`player-${key}`}>Player</label>
                                          <select
                                            id={`player-${key}`}
                                            className="input"
                                            value={sideForm.playerId}
                                            onChange={(e) => setEventForm({ ...eventForm, [key]: { ...sideForm, playerId: e.target.value } })}
                                          >
                                            <option value="">Select player&hellip;</option>
                                            {players.map((p: any) => (
                                              <option key={p.playerId} value={p.playerId}>
                                                {p.jerseyNumber ? `${p.jerseyNumber}. ` : ''}{fullName(p)}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="field" style={{ marginBottom: 0 }}>
                                          <label htmlFor={`type-${key}`}>Event</label>
                                          <select
                                            id={`type-${key}`}
                                            className="input"
                                            value={sideForm.type}
                                            onChange={(e) => setEventForm({ ...eventForm, [key]: { ...sideForm, type: e.target.value } })}
                                          >
                                            {EVENT_TYPES.map((t) => <option key={t} value={t}>{EVENT_LABELS[t]}</option>)}
                                          </select>
                                        </div>
                                        <div className="field" style={{ marginBottom: 0 }}>
                                          <label htmlFor={`min-${key}`}>Minute</label>
                                          <input
                                            id={`min-${key}`}
                                            type="number"
                                            className="input"
                                            style={{ width: 70 }}
                                            value={sideForm.minute}
                                            onChange={(e) => setEventForm({ ...eventForm, [key]: { ...sideForm, minute: e.target.value } })}
                                          />
                                        </div>
                                        <button className="btn btn-secondary" onClick={() => handleAddEvent(a.fixture.id, side)}>Add Event</button>
                                      </div>
                                    )
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {reportLocked && (
                            <p className="card-meta">Match events are locked while the report is {reportStatus === 'APPROVED' ? 'approved' : 'awaiting review'}.</p>
                          )}
                        </div>
                      )}

                      {canEnterResult && (
                        <div style={{ marginTop: 'var(--space-3)' }}>
                          {reportStatus === 'RETURNED' && a.fixture.reportNotes && (
                            <p className="card-meta" style={{ marginBottom: 'var(--space-2)' }}>
                              League Manager's note: {a.fixture.reportNotes}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div className="field" style={{ marginBottom: 0 }}>
                              <label>Home score</label>
                              <input
                                type="number"
                                className="input"
                                style={{ width: 90 }}
                                value={scores[a.fixture.id]?.home ?? a.fixture.homeScore ?? ''}
                                onChange={(e) => setScores({ ...scores, [a.fixture.id]: { home: e.target.value, away: scores[a.fixture.id]?.away ?? String(a.fixture.awayScore ?? '') } })}
                              />
                            </div>
                            <div className="field" style={{ marginBottom: 0 }}>
                              <label>Away score</label>
                              <input
                                type="number"
                                className="input"
                                style={{ width: 90 }}
                                value={scores[a.fixture.id]?.away ?? a.fixture.awayScore ?? ''}
                                onChange={(e) => setScores({ ...scores, [a.fixture.id]: { home: scores[a.fixture.id]?.home ?? String(a.fixture.homeScore ?? ''), away: e.target.value } })}
                              />
                            </div>
                          </div>
                          <div className="field" style={{ marginTop: 'var(--space-2)' }}>
                            <label>Match comments (incidents, weather, injuries, delays)</label>
                            <textarea
                              className="input"
                              value={notes[a.fixture.id] ?? a.fixture.reportNotes ?? ''}
                              onChange={(e) => setNotes({ ...notes, [a.fixture.id]: e.target.value })}
                            />
                          </div>
                          <button className="btn btn-primary" style={{ marginTop: 'var(--space-2)' }} onClick={() => handleSubmitResult(a.fixture.id)}>
                            {reportStatus === 'RETURNED' ? 'Resubmit Match Report' : 'Submit Match Report'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <AnnouncementsPanel />
          </div>
        </>
      )}
    </div>
  );
}
