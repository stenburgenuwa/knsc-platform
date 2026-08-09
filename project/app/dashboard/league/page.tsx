'use client';

import { useEffect, useState } from 'react';
import { Pencil, Download } from 'lucide-react';
import { downloadCsv } from '@/lib/csv';
import {
  getDashboardSummary,
  createFixture,
  getPendingPlayers,
  approvePlayer,
  rejectPlayer,
  updateFixture,
  updateClub,
  createUser,
  reviewMatchReport,
  getDisciplinaryCases,
  createDisciplinaryCase,
  updateDisciplinaryCase,
} from '@/lib/admin-api';
import { getClubs, getFixtures, getPlayers } from '@/lib/public-api';
import StatCard from '@/components/StatCard';
import Avatar from '@/components/Avatar';
import AnnouncementsPanel from '@/components/AnnouncementsPanel';
import MatchReportViewer from '@/components/MatchReportViewer';

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const FIXTURE_STATUSES = ['UPCOMING', 'COMPLETED', 'POSTPONED'];

export default function LeagueManagerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [reportQueue, setReportQueue] = useState<any[]>([]);
  // Every report ever filed, not just the ones awaiting review — the archive
  // is the league's evidence for disputes long after approval.
  const [reportArchive, setReportArchive] = useState<any[]>([]);
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [caseForm, setCaseForm] = useState({ clubId: '', playerId: '', reason: '', decision: '' });
  const [caseStatus, setCaseStatus] = useState<string | null>(null);

  const [fixtureForm, setFixtureForm] = useState({ homeClubId: '', awayClubId: '', fixtureDate: '', kickoffTime: '15:00' });
  const [fixtureStatus, setFixtureStatus] = useState<string | null>(null);

  const [venueDrafts, setVenueDrafts] = useState<Record<string, string>>({});
  const [venueStatus, setVenueStatus] = useState<string | null>(null);
  const [savingVenueId, setSavingVenueId] = useState<string | null>(null);

  const [staffForm, setStaffForm] = useState({ email: '', firstName: '', lastName: '', clubId: '' });
  const [staffStatus, setStaffStatus] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});
  const [tableStatus, setTableStatus] = useState<string | null>(null);
  const [returnNotes, setReturnNotes] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const [summary, clubsRes, pendingRes, fixturesRes, queueRes, playersRes, casesRes, archiveRes] = await Promise.all([
        getDashboardSummary(),
        getClubs(1, 100),
        getPendingPlayers(),
        getFixtures(1, 100, { status: 'all' }),
        getFixtures(1, 50, { reportStatus: 'SUBMITTED' }),
        getPlayers(1, 500),
        getDisciplinaryCases(),
        getFixtures(1, 100, { status: 'all', reportStatus: 'SUBMITTED,APPROVED,RETURNED' }),
      ]);
      setData(summary.data?.data);
      const clubList = clubsRes.data?.data || [];
      setClubs(clubList);
      setPending((pendingRes.data?.data || []).filter((p: any) => !p.leagueManagerApproved));
      setFixtures(fixturesRes.data?.data || []);
      setReportQueue(queueRes.data?.data || []);
      setPlayers(playersRes.data?.data || []);
      setCases(casesRes.data?.data || []);
      setReportArchive(archiveRes.data?.data || []);
      setFixtureForm((f) => ({
        ...f,
        homeClubId: f.homeClubId || clubList[0]?.id || '',
        awayClubId: f.awayClubId || clubList[1]?.id || '',
      }));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    setFixtureStatus(null);
    if (fixtureForm.homeClubId === fixtureForm.awayClubId) {
      setFixtureStatus('Home and away clubs must be different.');
      return;
    }
    try {
      await createFixture({
        homeClubId: fixtureForm.homeClubId,
        awayClubId: fixtureForm.awayClubId,
        fixtureDate: fixtureForm.fixtureDate,
        kickoffTime: fixtureForm.kickoffTime,
      });
      setFixtureStatus('Fixture scheduled.');
      load();
    } catch (err: any) {
      setFixtureStatus(err?.response?.data?.error || 'Failed to schedule fixture.');
    }
  };

  const handleApprove = async (id: string) => {
    setApprovalStatus(null);
    try {
      await approvePlayer(id);
      setRejectingId(null);
      load();
    } catch (err: any) {
      setApprovalStatus(err?.response?.data?.error || 'Failed to approve player.');
    }
  };

  // A rejection without a reason gives the Team Manager nothing to act on, so
  // the button stays disabled until one is written and the API rejects it too.
  const handleReject = async (id: string) => {
    if (rejectReason.trim().length === 0) return;
    setRejecting(true);
    setApprovalStatus(null);
    try {
      await rejectPlayer(id, rejectReason.trim());
      setRejectingId(null);
      setRejectReason('');
      setApprovalStatus('Player rejected — the reason is now on their Team Manager’s dashboard.');
      load();
    } catch (err: any) {
      setApprovalStatus(err?.response?.data?.error || 'Failed to reject player.');
    } finally {
      setRejecting(false);
    }
  };

  const startEditFixture = (f: any) => {
    setEditingId(f.id);
    setDraft({
      fixtureDate: f.fixtureDate ? f.fixtureDate.slice(0, 10) : '',
      kickoffTime: f.kickoffTime || '',
      status: f.status,
    });
    setTableStatus(null);
  };

  const saveFixtureEdit = async () => {
    if (!editingId) return;
    try {
      await updateFixture(editingId, {
        fixtureDate: draft.fixtureDate,
        kickoffTime: draft.kickoffTime,
        status: draft.status,
      });
      setEditingId(null);
      await load();
      setTableStatus('Fixture updated.');
    } catch (err: any) {
      setTableStatus(err?.response?.data?.error || 'Failed to update fixture.');
    }
  };

  const saveVenue = async (clubId: string) => {
    const name = venueDrafts[clubId];
    if (name === undefined) return;
    setSavingVenueId(clubId);
    setVenueStatus(null);
    try {
      await updateClub(clubId, { homeVenueName: name });
      await load();
      setVenueStatus('Venue saved.');
    } catch (err: any) {
      setVenueStatus(err?.response?.data?.error || 'Failed to save venue.');
    } finally {
      setSavingVenueId(null);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffStatus(null);
    if (!staffForm.clubId) {
      setStaffStatus('Select the team this Team Manager will run.');
      return;
    }
    try {
      const res = await createUser({ ...staffForm, role: 'TEAM_MANAGER' });
      setStaffStatus(`Account created. Temporary password: ${res.data?.data?.temporaryPassword}`);
      setStaffForm({ email: '', firstName: '', lastName: '', clubId: '' });
      load();
    } catch (err: any) {
      setStaffStatus(err?.response?.data?.error || 'Failed to create account.');
    }
  };

  const quickSetStatus = async (fixtureId: string, status: string) => {
    try {
      await updateFixture(fixtureId, { status });
      await load();
      setTableStatus(status === 'POSTPONED' ? 'Fixture postponed.' : 'Fixture republished.');
    } catch (err: any) {
      setTableStatus(err?.response?.data?.error || 'Failed to update fixture.');
    }
  };

  const handleOpenCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaseStatus(null);
    if (!caseForm.playerId || !caseForm.reason) {
      setCaseStatus('Pick a player and enter a reason.');
      return;
    }
    try {
      await createDisciplinaryCase({ playerId: caseForm.playerId, reason: caseForm.reason, decision: caseForm.decision || undefined });
      setCaseForm({ clubId: '', playerId: '', reason: '', decision: '' });
      setCaseStatus('Case opened.');
      load();
    } catch (err: any) {
      setCaseStatus(err?.response?.data?.error || 'Failed to open case.');
    }
  };

  const handleCaseStatus = async (id: string, status: string) => {
    try {
      await updateDisciplinaryCase(id, { status });
      load();
    } catch (err: any) {
      setCaseStatus(err?.response?.data?.error || 'Failed to update case.');
    }
  };

  const exportFixtures = () =>
    downloadCsv('fixtures.csv', fixtures, [
      { header: 'Date', value: (f) => formatDate(f.fixtureDate) },
      { header: 'Kickoff', value: (f) => f.kickoffTime },
      { header: 'Home Club', value: (f) => f.homeClub.name },
      { header: 'Away Club', value: (f) => f.awayClub.name },
      { header: 'Home Score', value: (f) => f.homeScore },
      { header: 'Away Score', value: (f) => f.awayScore },
      { header: 'Venue', value: (f) => f.venue?.name },
      { header: 'Status', value: (f) => f.status },
      { header: 'Referee', value: (f) => (f.refereeAssignment?.referee ? `${f.refereeAssignment.referee.firstName} ${f.refereeAssignment.referee.lastName}` : '') },
    ]);

  const exportClubs = () =>
    downloadCsv('clubs.csv', clubs, [
      { header: 'Name', value: (c) => c.name },
      { header: 'Players', value: (c) => c._count?.players },
      { header: 'Home Venue', value: (c) => c.homeVenue?.name },
    ]);

  const exportCases = () =>
    downloadCsv('disciplinary-cases.csv', cases, [
      { header: 'Player', value: (c) => `${c.player.firstName} ${c.player.lastName}` },
      { header: 'Club', value: (c) => c.club.name },
      { header: 'Reason', value: (c) => c.reason },
      { header: 'Decision', value: (c) => c.decision },
      { header: 'Status', value: (c) => c.status },
    ]);

  const handleReviewReport = async (fixtureId: string, action: 'APPROVE' | 'RETURN') => {
    try {
      await reviewMatchReport(fixtureId, action, action === 'RETURN' ? returnNotes[fixtureId] : undefined);
      await load();
      setTableStatus(action === 'APPROVE' ? 'Match report approved — standings updated.' : 'Match report returned to the referee for correction.');
    } catch (err: any) {
      setTableStatus(err?.response?.data?.error || 'Failed to review match report.');
    }
  };

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>League Manager Dashboard</h1>

      {loading ? (
        <p className="text-muted">Loading&hellip;</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <StatCard label="Upcoming Fixtures" value={data?.upcomingFixtures || 0} />
            <StatCard label="Pending Player Approvals" value={pending.length} tone="warning" />
            <StatCard label="Match Reports Awaiting Review" value={reportQueue.length} tone="warning" />
            <StatCard label="Registered Players" value={data?.registeredPlayers || 0} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <form onSubmit={handleCreateFixture} className="card elev-sm">
              <h3 className="card-title">Schedule a Fixture</h3>
              <div className="field">
                <label htmlFor="home-club">Home club</label>
                <select id="home-club" className="input" value={fixtureForm.homeClubId} onChange={(e) => setFixtureForm({ ...fixtureForm, homeClubId: e.target.value })}>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="away-club">Away club</label>
                <select id="away-club" className="input" value={fixtureForm.awayClubId} onChange={(e) => setFixtureForm({ ...fixtureForm, awayClubId: e.target.value })}>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Venue</label>
                <input
                  className="input"
                  disabled
                  value={clubs.find((c) => c.id === fixtureForm.homeClubId)?.homeVenue?.name || 'TBC'}
                />
                <p className="card-meta" style={{ marginTop: 4 }}>Follows the home club&rsquo;s registered venue.</p>
              </div>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                <div className="field">
                  <label htmlFor="fixture-date">Date</label>
                  <input id="fixture-date" type="date" className="input" required value={fixtureForm.fixtureDate} onChange={(e) => setFixtureForm({ ...fixtureForm, fixtureDate: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="fixture-time">Kickoff</label>
                  <input id="fixture-time" type="time" className="input" value={fixtureForm.kickoffTime} onChange={(e) => setFixtureForm({ ...fixtureForm, kickoffTime: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Schedule Fixture</button>
              {fixtureStatus && <p className="card-meta">{fixtureStatus}</p>}
            </form>

            <div className="card elev-sm">
              <h3 className="card-title">Pending Player Approvals</h3>
              <p className="card-meta" style={{ marginBottom: 'var(--space-2)' }}>
                Check the photo against the name, ID number and date of birth before approving.
              </p>
              {pending.length === 0 ? (
                <p className="card-meta">No players awaiting approval.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {pending.map((p, i) => (
                    <div key={p.id} style={{ padding: 'var(--space-3) 0', borderBottom: i < pending.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Large and square: this is an identity check, and a
                            thumbnail in a disc is not enough to make one. */}
                        <Avatar
                          src={p.photoUrl}
                          name={`${p.firstName} ${p.lastName}`}
                          size={112}
                          rounded="square"
                        />
                        <div style={{ minWidth: 200, flex: 1 }}>
                          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, margin: 0 }}>
                            {[p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')}
                          </p>
                          <p className="card-meta" style={{ margin: '2px 0' }}>{p.club?.name}</p>
                          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px var(--space-3)', margin: 'var(--space-2) 0 0', fontSize: 13 }}>
                            <dt className="text-muted">ID / passport</dt>
                            <dd style={{ margin: 0 }}>{p.idNumber || <span className="text-muted">Not provided</span>}</dd>
                            <dt className="text-muted">Date of birth</dt>
                            <dd style={{ margin: 0 }}>{p.dateOfBirth ? formatDate(p.dateOfBirth) : <span className="text-muted">Not provided</span>}</dd>
                            <dt className="text-muted">Position</dt>
                            <dd style={{ margin: 0 }}>{p.position || <span className="text-muted">Not recorded</span>}</dd>
                          </dl>
                          <p className="card-meta" style={{ marginTop: 'var(--space-1)' }}>
                            {p.platformOwnerApproved ? 'Platform Owner approved' : 'Awaiting Platform Owner'}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={() => handleApprove(p.id)}>Approve</button>
                        {rejectingId === p.id ? (
                          <button className="btn btn-ghost" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
                        ) : (
                          <button className="btn btn-secondary" onClick={() => { setRejectingId(p.id); setRejectReason(''); setApprovalStatus(null); }}>Reject</button>
                        )}
                      </div>

                      {rejectingId === p.id && (
                        <div style={{ marginTop: 'var(--space-2)' }}>
                          <div className="field">
                            <label htmlFor={`reject-${p.id}`}>Reason for rejection</label>
                            <textarea
                              id={`reject-${p.id}`}
                              className="input"
                              placeholder="Tell the Team Manager what to correct — the photo is unclear, the ID number does not match, and so on."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                            />
                          </div>
                          <button
                            className="btn btn-primary"
                            disabled={rejectReason.trim().length === 0 || rejecting}
                            onClick={() => handleReject(p.id)}
                          >
                            {rejecting ? 'Sending…' : 'Confirm Rejection'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {approvalStatus && <p className="card-meta">{approvalStatus}</p>}
            </div>
          </div>

          <div className="card elev-sm" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 className="card-title">Match Reports Awaiting Review</h3>
            {reportQueue.length === 0 ? (
              <p className="card-meta">Nothing waiting on you right now.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {reportQueue.map((f) => (
                  <div key={f.id} style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-2)' }}>
                    <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                      {f.homeClub.name} {f.homeScore} &ndash; {f.awayScore} {f.awayClub.name}
                    </p>
                    <p className="card-meta">{formatDate(f.fixtureDate)} &bull; {f.venue?.name || 'Venue TBC'}</p>
                    {f.reportNotes && <p className="card-meta">Referee's notes: {f.reportNotes}</p>}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button className="btn btn-primary" onClick={() => handleReviewReport(f.id, 'APPROVE')}>Approve</button>
                      <input
                        className="input"
                        placeholder="Reason for returning (optional)"
                        style={{ maxWidth: 240 }}
                        value={returnNotes[f.id] || ''}
                        onChange={(e) => setReturnNotes({ ...returnNotes, [f.id]: e.target.value })}
                      />
                      <button className="btn btn-secondary" onClick={() => handleReviewReport(f.id, 'RETURN')}>Return for Correction</button>
                      <button className="btn btn-ghost" onClick={() => setViewingReportId(f.id)}>View Full Report</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* The permanent record. Reports stay here after approval so the
              league can verify them and settle disputes later. */}
          <div className="card elev-sm" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 className="card-title">Match Report Archive ({reportArchive.length})</h3>
            {reportArchive.length === 0 ? (
              <p className="card-meta">No match reports have been filed yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Played</th>
                      <th>Referee</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportArchive.map((f) => (
                      <tr key={f.id}>
                        <td style={{ fontFamily: 'var(--font-heading)' }}>
                          {f.homeClub.name} {f.homeScore ?? '–'}&ndash;{f.awayScore ?? '–'} {f.awayClub.name}
                        </td>
                        <td>{formatDate(f.fixtureDate)}</td>
                        <td>
                          {f.refereeAssignment?.referee
                            ? `${f.refereeAssignment.referee.firstName} ${f.refereeAssignment.referee.lastName}`
                            : '—'}
                        </td>
                        <td>{f.reportSubmittedAt ? formatDate(f.reportSubmittedAt) : '—'}</td>
                        <td>
                          <span className={`tag ${f.reportStatus === 'APPROVED' ? 'tag-accent' : 'tag-neutral'}`}>{f.reportStatus}</span>
                        </td>
                        <td>
                          <button className="btn btn-ghost" onClick={() => setViewingReportId(f.id)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {viewingReportId && (
            <MatchReportViewer fixtureId={viewingReportId} onClose={() => setViewingReportId(null)} />
          )}

          <div className="card elev-sm" style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Fixtures ({fixtures.length})</h3>
              <button className="btn btn-ghost" onClick={exportFixtures}><Download size={14} /> Export CSV</button>
            </div>
            {tableStatus && <p className="card-meta">{tableStatus}</p>}
            {fixtures.length === 0 ? (
              <p className="card-meta">No fixtures yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fixture</th>
                      <th>Date</th>
                      <th>Venue</th>
                      <th>Status</th>
                      <th>Referee</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixtures.map((f) => (
                      <tr key={f.id}>
                        <td style={{ fontFamily: 'var(--font-heading)' }}>{f.homeClub.name} vs {f.awayClub.name}</td>
                        {editingId === f.id ? (
                          <>
                            <td>
                              <input type="date" className="input" value={draft.fixtureDate} onChange={(e) => setDraft({ ...draft, fixtureDate: e.target.value })} />
                              <input type="time" className="input" style={{ marginTop: 4 }} value={draft.kickoffTime} onChange={(e) => setDraft({ ...draft, kickoffTime: e.target.value })} />
                            </td>
                            <td>{f.venue?.name || 'TBC'}</td>
                            <td>
                              <select className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                                {FIXTURE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td>{f.refereeAssignment?.referee ? `${f.refereeAssignment.referee.firstName} ${f.refereeAssignment.referee.lastName}` : '—'}</td>
                            <td>
                              <button className="btn btn-primary" onClick={saveFixtureEdit}>Save</button>
                              <button className="btn btn-secondary" style={{ marginLeft: 4 }} onClick={() => setEditingId(null)}>Cancel</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{formatDate(f.fixtureDate)} {f.kickoffTime || ''}</td>
                            <td>{f.venue?.name || 'TBC'}</td>
                            <td><span className="tag tag-neutral">{f.status}</span></td>
                            <td>{f.refereeAssignment?.referee ? `${f.refereeAssignment.referee.firstName} ${f.refereeAssignment.referee.lastName}` : '—'}</td>
                            <td style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-icon" aria-label="Edit fixture" onClick={() => startEditFixture(f)}>
                                <Pencil size={14} />
                              </button>
                              {f.status === 'UPCOMING' && (
                                <button className="btn btn-secondary" onClick={() => quickSetStatus(f.id, 'POSTPONED')}>Postpone</button>
                              )}
                              {f.status === 'POSTPONED' && (
                                <button className="btn btn-secondary" onClick={() => quickSetStatus(f.id, 'UPCOMING')}>Republish</button>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <form onSubmit={handleOpenCase} className="card elev-sm">
              <h3 className="card-title">Open a Disciplinary Case</h3>
              <div className="field">
                <label htmlFor="case-club">Club</label>
                <select
                  id="case-club"
                  className="input"
                  value={caseForm.clubId}
                  onChange={(e) => setCaseForm({ ...caseForm, clubId: e.target.value, playerId: '' })}
                >
                  <option value="">Select club&hellip;</option>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="case-player">Player</label>
                <select
                  id="case-player"
                  className="input"
                  value={caseForm.playerId}
                  onChange={(e) => setCaseForm({ ...caseForm, playerId: e.target.value })}
                  disabled={!caseForm.clubId}
                >
                  <option value="">Select player&hellip;</option>
                  {players.filter((p) => p.clubId === caseForm.clubId).map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="case-reason">Reason</label>
                <input id="case-reason" className="input" required value={caseForm.reason} onChange={(e) => setCaseForm({ ...caseForm, reason: e.target.value })} placeholder="e.g. Red card — violent conduct" />
              </div>
              <div className="field">
                <label htmlFor="case-decision">Decision (optional)</label>
                <input id="case-decision" className="input" value={caseForm.decision} onChange={(e) => setCaseForm({ ...caseForm, decision: e.target.value })} placeholder="e.g. Two-match suspension" />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Open Case</button>
              {caseStatus && <p className="card-meta">{caseStatus}</p>}
            </form>

            <div className="card elev-sm">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Disciplinary Cases ({cases.length})</h3>
                <button className="btn btn-ghost" onClick={exportCases}><Download size={14} /> Export CSV</button>
              </div>
              {cases.length === 0 ? (
                <p className="card-meta">No disciplinary cases on record.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 420, overflowY: 'auto' }}>
                  {cases.map((c, i) => (
                    <div key={c.id} style={{ padding: 'var(--space-2) 0', borderBottom: i < cases.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                        <div>
                          <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{c.player.firstName} {c.player.lastName} <span className="card-meta" style={{ display: 'inline' }}>({c.club.name})</span></p>
                          <p className="card-meta">{c.reason}</p>
                          {c.decision && <p className="card-meta">Decision: {c.decision}</p>}
                        </div>
                        <span className={`tag ${c.status === 'OPEN' ? 'tag-accent-2' : c.status === 'RESOLVED' ? 'tag-accent' : 'tag-neutral'}`}>{c.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        {c.status !== 'RESOLVED' && (
                          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => handleCaseStatus(c.id, 'RESOLVED')}>Mark Resolved</button>
                        )}
                        {c.status !== 'APPEALED' && (
                          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => handleCaseStatus(c.id, 'APPEALED')}>Mark Appealed</button>
                        )}
                        {c.status !== 'OPEN' && (
                          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => handleCaseStatus(c.id, 'OPEN')}>Reopen</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card elev-sm" style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Clubs ({clubs.length})</h3>
              <button className="btn btn-ghost" onClick={exportClubs}><Download size={14} /> Export CSV</button>
            </div>
            <p className="card-meta">You can update each club&rsquo;s home venue here; other club details are managed by the Platform Owner.</p>
            {venueStatus && <p className="card-meta">{venueStatus}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-2)' }}>
              {clubs.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0, flex: 1 }}>
                    <Avatar src={c.logoUrl} name={c.name} size={36} rounded="soft" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{c.name}</p>
                      <p className="card-meta">{c._count?.players ?? 0} players</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flex: 'none' }}>
                    <input
                      className="input"
                      style={{ maxWidth: 160 }}
                      placeholder="Home venue"
                      value={venueDrafts[c.id] ?? c.homeVenue?.name ?? ''}
                      onChange={(e) => setVenueDrafts({ ...venueDrafts, [c.id]: e.target.value })}
                    />
                    <button
                      className="btn btn-secondary"
                      disabled={savingVenueId === c.id}
                      onClick={() => saveVenue(c.id)}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card elev-sm" style={{ marginBottom: 'var(--space-4)', maxWidth: 480 }}>
            <h3 className="card-title">Create Staff Account</h3>
            <p className="card-meta">League Managers may register Team Manager accounts for existing teams.</p>
            <form onSubmit={handleCreateStaff}>
              <div className="field">
                <label htmlFor="staff-email">Email</label>
                <input id="staff-email" type="email" className="input" required value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                <div className="field">
                  <label htmlFor="staff-first">First name</label>
                  <input id="staff-first" className="input" required value={staffForm.firstName} onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="staff-last">Last name</label>
                  <input id="staff-last" className="input" required value={staffForm.lastName} onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="staff-role">Role</label>
                <select id="staff-role" className="input" value="TEAM_MANAGER" disabled>
                  <option value="TEAM_MANAGER">Team Manager</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="staff-club">Select Team</label>
                <select id="staff-club" className="input" required value={staffForm.clubId} onChange={(e) => setStaffForm({ ...staffForm, clubId: e.target.value })}>
                  <option value="">Select a team&hellip;</option>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Create Account</button>
              {staffStatus && <p className="card-meta">{staffStatus}</p>}
            </form>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <AnnouncementsPanel
              canCompose
              audienceOptions={[
                { value: 'TEAM_MANAGER', label: 'Team Managers only' },
                { value: 'REFEREE', label: 'Referees only' },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
