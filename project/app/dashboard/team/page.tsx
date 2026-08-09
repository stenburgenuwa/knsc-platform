'use client';

import { useEffect, useState } from 'react';
import { getDashboardSummary, registerPlayer, updatePlayer } from '@/lib/admin-api';
import { getPlayers, getFixtures } from '@/lib/public-api';
import { useAuthStore } from '@/store/auth';
import StatCard from '@/components/StatCard';
import Avatar from '@/components/Avatar';
import ImageUpload from '@/components/ImageUpload';
import PhotoButton from '@/components/PhotoButton';
import AnnouncementsPanel from '@/components/AnnouncementsPanel';
import TeamSheetBuilder from '@/components/TeamSheetBuilder';

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// `<input type="date">` wants YYYY-MM-DD; the API returns an ISO timestamp.
function dateInputValue(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Winger', 'Forward'];

type PlayerForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  playerNumber: string;
  position: string;
  dateOfBirth: string;
  photoUrl: string | null;
  idNumber: string;
  height: string;
  weight: string;
};

const EMPTY_PLAYER: PlayerForm = {
  firstName: '', middleName: '', lastName: '', playerNumber: '', position: '',
  dateOfBirth: '', photoUrl: null, idNumber: '', height: '', weight: '',
};

export default function TeamManagerDashboard() {
  const clubId = useAuthStore((s) => s.user?.clubId as string | undefined);
  const clubName = useAuthStore((s) => s.user?.clubName as string | undefined);
  const [data, setData] = useState<any>(null);
  const [squad, setSquad] = useState<any[]>([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [playerForm, setPlayerForm] = useState<PlayerForm>(EMPTY_PLAYER);
  const [playerStatus, setPlayerStatus] = useState<string | null>(null);

  // Correcting a rejected registration happens in place on the squad row, so
  // the Team Manager can see the League Manager's reason while they fix it.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PlayerForm>(EMPTY_PLAYER);
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    try {
      const [summary, squadRes, fixturesRes] = await Promise.all([
        getDashboardSummary(),
        getPlayers(1, 100, { includePending: true }),
        clubId ? getFixtures(1, 20, { clubId }) : Promise.resolve(null),
      ]);
      setData(summary.data?.data);
      setSquad(squadRes.data?.data || []);
      setUpcomingFixtures(fixturesRes?.data?.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRegisterPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerStatus(null);
    if (!clubId) {
      setPlayerStatus('Your account is not linked to a club yet.');
      return;
    }
    // Mandatory: first name, last name, ID/passport, date of birth and a
    // cropped photo. Middle name and position are optional and must never
    // block a registration.
    if (!playerForm.firstName.trim() || !playerForm.lastName.trim() || !playerForm.idNumber.trim() || !playerForm.dateOfBirth) {
      setPlayerStatus('First name, last name, ID / passport number and date of birth are required.');
      return;
    }
    if (!playerForm.photoUrl) {
      setPlayerStatus('A player photo is required — upload one and crop it before submitting.');
      return;
    }
    try {
      await registerPlayer({
        clubId,
        firstName: playerForm.firstName.trim(),
        middleName: playerForm.middleName.trim() || undefined,
        lastName: playerForm.lastName.trim(),
        playerNumber: playerForm.playerNumber ? Number(playerForm.playerNumber) : undefined,
        position: playerForm.position || undefined,
        dateOfBirth: playerForm.dateOfBirth,
        photoUrl: playerForm.photoUrl,
        idNumber: playerForm.idNumber.trim(),
        height: playerForm.height ? Number(playerForm.height) : undefined,
        weight: playerForm.weight ? Number(playerForm.weight) : undefined,
      });
      setPlayerStatus('Player submitted for approval.');
      setPlayerForm(EMPTY_PLAYER);
      load();
    } catch (err: any) {
      setPlayerStatus(err?.response?.data?.error || 'Failed to register player.');
    }
  };

  const startEdit = (p: any) => {
    setEditStatus(null);
    setEditingId(p.id);
    setEditForm({
      firstName: p.firstName || '',
      middleName: p.middleName || '',
      lastName: p.lastName || '',
      playerNumber: p.playerNumber != null ? String(p.playerNumber) : '',
      position: p.position || '',
      dateOfBirth: dateInputValue(p.dateOfBirth),
      photoUrl: p.photoUrl ?? null,
      idNumber: p.idNumber || '',
      height: p.height != null ? String(p.height) : '',
      weight: p.weight != null ? String(p.weight) : '',
    });
  };

  // `resubmit` puts a corrected registration back in the League Manager's
  // queue and clears the rejection reason; a plain save just corrects details.
  const saveEdit = async (playerId: string, resubmit: boolean) => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.idNumber.trim() || !editForm.dateOfBirth) {
      setEditStatus('First name, last name, ID / passport number and date of birth are required.');
      return;
    }
    if (resubmit && !editForm.photoUrl) {
      setEditStatus('A player photo is required before resubmitting — use Upload on this row to add one.');
      return;
    }
    setSavingEdit(true);
    setEditStatus(null);
    try {
      await updatePlayer(playerId, {
        firstName: editForm.firstName.trim(),
        middleName: editForm.middleName.trim(),
        lastName: editForm.lastName.trim(),
        playerNumber: editForm.playerNumber ? Number(editForm.playerNumber) : undefined,
        position: editForm.position,
        dateOfBirth: editForm.dateOfBirth,
        photoUrl: editForm.photoUrl,
        idNumber: editForm.idNumber.trim(),
        height: editForm.height ? Number(editForm.height) : undefined,
        weight: editForm.weight ? Number(editForm.weight) : undefined,
        ...(resubmit ? { resubmit: true } : {}),
      });
      setEditingId(null);
      setEditStatus(null);
      load();
    } catch (err: any) {
      setEditStatus(err?.response?.data?.error || 'Failed to save changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSquadPhoto = async (playerId: string, photoUrl: string | null) => {
    setSquad((prev) => prev.map((p) => (p.id === playerId ? { ...p, photoUrl } : p)));
    try {
      await updatePlayer(playerId, { photoUrl });
    } catch {
      load();
    }
  };

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-1)' }}>Team Manager Dashboard</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>{clubName || 'No club linked to your account yet'}</p>

      {loading ? (
        <p className="text-muted">Loading&hellip;</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <StatCard label="Squad Size" value={data?.squadSize || 0} />
            <StatCard label="Next Fixture" value={data?.nextFixture || 'TBD'} />
            <StatCard label="Wins" value={data?.wins || 0} tone="accent" />
            <StatCard label="Points" value={data?.points || 0} tone="accent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
            <form onSubmit={handleRegisterPlayer} className="card elev-sm">
              <h3 className="card-title">Register a Player</h3>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                <div className="field">
                  <label htmlFor="p-first">First name</label>
                  <input id="p-first" className="input" required value={playerForm.firstName} onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="p-middle">Middle name <span className="text-muted">(optional)</span></label>
                  <input id="p-middle" className="input" value={playerForm.middleName} onChange={(e) => setPlayerForm({ ...playerForm, middleName: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="p-last">Last name</label>
                <input id="p-last" className="input" required value={playerForm.lastName} onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="p-id">ID / passport number</label>
                <input id="p-id" className="input" required value={playerForm.idNumber} onChange={(e) => setPlayerForm({ ...playerForm, idNumber: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="p-dob">Date of birth</label>
                <input id="p-dob" type="date" className="input" required value={playerForm.dateOfBirth} onChange={(e) => setPlayerForm({ ...playerForm, dateOfBirth: e.target.value })} />
              </div>
              {/* Mandatory: the League Manager approves against this photo. */}
              <ImageUpload
                label="Player photo"
                kind="player"
                rounded="square"
                name={`${playerForm.firstName} ${playerForm.lastName}`.trim()}
                value={playerForm.photoUrl}
                onChange={(url) => setPlayerForm({ ...playerForm, photoUrl: url })}
              />
              {!playerForm.photoUrl && (
                <p className="card-meta" style={{ marginTop: -8 }}>
                  Upload a photo and crop it to a square before submitting.
                </p>
              )}

              <p className="card-kicker" style={{ marginTop: 'var(--space-3)' }}>Optional details</p>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                <div className="field">
                  <label htmlFor="p-position">Position</label>
                  <select id="p-position" className="input" value={playerForm.position} onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}>
                    <option value="">Not recorded</option>
                    {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="p-number">Shirt number</label>
                  <input id="p-number" type="number" className="input" value={playerForm.playerNumber} onChange={(e) => setPlayerForm({ ...playerForm, playerNumber: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                <div className="field">
                  <label htmlFor="p-height">Height (cm)</label>
                  <input id="p-height" type="number" className="input" value={playerForm.height} onChange={(e) => setPlayerForm({ ...playerForm, height: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="p-weight">Weight (kg)</label>
                  <input id="p-weight" type="number" className="input" value={playerForm.weight} onChange={(e) => setPlayerForm({ ...playerForm, weight: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Submit for Approval</button>
              {playerStatus && <p className="card-meta">{playerStatus}</p>}
            </form>

            <div className="card elev-sm">
              <h3 className="card-title">Squad</h3>
              {squad.length === 0 ? (
                <p className="card-meta">No players registered yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {squad.map((p, i) => (
                    <div key={p.id} style={{ padding: 'var(--space-2) 0', borderBottom: i < squad.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                          <Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={40} rounded="square" />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                              {p.playerNumber ? `#${p.playerNumber} ` : ''}
                              {[p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')}
                            </p>
                            <p className="card-meta">
                              {[p.position, p.dateOfBirth ? `Born ${formatDate(p.dateOfBirth)}` : null].filter(Boolean).join(' · ')}
                            </p>
                            {/* The registration number is issued by the approval
                                process and is the player's permanent identifier. */}
                            {p.registrationNumber && (
                              <p className="card-meta" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}>
                                {p.registrationNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 'none' }}>
                          <PhotoButton id={p.id} currentUrl={p.photoUrl} kind="player" onChange={handleSquadPhoto} />
                          {p.rejectedAt ? (
                            <span className="tag tag-accent-2">Rejected</span>
                          ) : p.approved ? (
                            <span className="tag tag-accent">Approved</span>
                          ) : (
                            <span className="tag tag-neutral">Pending</span>
                          )}
                          <button
                            className="btn btn-ghost"
                            style={{ fontSize: 12 }}
                            onClick={() => (editingId === p.id ? setEditingId(null) : startEdit(p))}
                          >
                            {editingId === p.id ? 'Cancel' : 'Edit'}
                          </button>
                        </div>
                      </div>

                      {p.rejectedAt && p.rejectionReason && editingId !== p.id && (
                        <p
                          className="card-meta"
                          style={{ marginTop: 'var(--space-1)', paddingLeft: 52, color: 'var(--color-accent-800)' }}
                        >
                          Rejected by the League Manager: {p.rejectionReason} &mdash; correct the details and resubmit.
                        </p>
                      )}

                      {editingId === p.id && (
                        <div style={{ marginTop: 'var(--space-2)', paddingLeft: 52 }}>
                          {p.rejectionReason && (
                            <p className="card-meta" style={{ color: 'var(--color-accent-800)' }}>
                              Reason for rejection: {p.rejectionReason}
                            </p>
                          )}
                          <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                            <div className="field">
                              <label htmlFor={`e-first-${p.id}`}>First name</label>
                              <input id={`e-first-${p.id}`} className="input" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
                            </div>
                            <div className="field">
                              <label htmlFor={`e-middle-${p.id}`}>Middle name <span className="text-muted">(optional)</span></label>
                              <input id={`e-middle-${p.id}`} className="input" value={editForm.middleName} onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })} />
                            </div>
                          </div>
                          <div className="field">
                            <label htmlFor={`e-last-${p.id}`}>Last name</label>
                            <input id={`e-last-${p.id}`} className="input" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
                          </div>
                          <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                            <div className="field">
                              <label htmlFor={`e-id-${p.id}`}>ID / passport number</label>
                              <input id={`e-id-${p.id}`} className="input" value={editForm.idNumber} onChange={(e) => setEditForm({ ...editForm, idNumber: e.target.value })} />
                            </div>
                            <div className="field">
                              <label htmlFor={`e-dob-${p.id}`}>Date of birth</label>
                              <input id={`e-dob-${p.id}`} type="date" className="input" value={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                            <div className="field">
                              <label htmlFor={`e-pos-${p.id}`}>Position <span className="text-muted">(optional)</span></label>
                              <select id={`e-pos-${p.id}`} className="input" value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}>
                                <option value="">Not recorded</option>
                                {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                              </select>
                            </div>
                            <div className="field">
                              <label htmlFor={`e-num-${p.id}`}>Shirt number</label>
                              <input id={`e-num-${p.id}`} type="number" className="input" value={editForm.playerNumber} onChange={(e) => setEditForm({ ...editForm, playerNumber: e.target.value })} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary" disabled={savingEdit} onClick={() => saveEdit(p.id, false)}>
                              {savingEdit ? 'Saving…' : 'Save changes'}
                            </button>
                            {p.rejectedAt && (
                              <button className="btn btn-primary" disabled={savingEdit} onClick={() => saveEdit(p.id, true)}>
                                Resubmit for Approval
                              </button>
                            )}
                          </div>
                          {editStatus && <p className="card-meta">{editStatus}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card elev-sm" style={{ marginTop: 'var(--space-4)' }}>
            <h3 className="card-title">Team Sheets</h3>
            {upcomingFixtures.length === 0 ? (
              <p className="card-meta">No upcoming fixtures yet.</p>
            ) : (
              <div>
                {upcomingFixtures.map((f) => (
                  <TeamSheetBuilder key={f.id} fixture={f} clubId={clubId!} squad={squad.filter((p) => p.approved)} />
                ))}
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
