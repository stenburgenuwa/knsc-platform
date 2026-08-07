'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateClub,
  deleteClub,
  deletePlayer,
  updateFixture,
  deleteFixture,
  resetAllData,
} from '@/lib/admin-api';
import { getClubs, getPlayers, getFixtures } from '@/lib/public-api';
import { useAuthStore } from '@/store/auth';
import { RESET_CONFIRMATION } from '@/lib/cascade';
import Avatar from '@/components/Avatar';
import ConfirmDialog from '@/components/ConfirmDialog';

const TABS = ['Clubs', 'People', 'Players', 'Fixtures', 'Danger Zone'] as const;
type Tab = (typeof TABS)[number];

const ROLES = ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'TEAM_MANAGER', 'REFEREE', 'REFEREE_MANAGER'];
const RESET_PHRASE = RESET_CONFIRMATION;

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  padding: 'var(--space-3) 0',
  borderBottom: '1px solid var(--color-divider)',
};

export default function ManagePage() {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [tab, setTab] = useState<Tab>('Clubs');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const [clubs, setClubs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);

  const [editing, setEditing] = useState<{ kind: string; id: string } | null>(null);
  const [draft, setDraft] = useState<any>({});
  const [confirming, setConfirming] = useState<{ kind: string; id?: string; label: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [clubsRes, usersRes, playersRes, fixturesRes] = await Promise.all([
        getClubs(1, 200),
        getAllUsers(),
        getPlayers(1, 300, { includePending: true }),
        getFixtures(1, 200, { status: 'all' }),
      ]);
      setClubs(clubsRes.data?.data || []);
      setUsers(usersRes.data?.data || []);
      setPlayers(playersRes.data?.data || []);
      setFixtures(fixturesRes.data?.data || []);
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Could not load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (kind: string, row: any, fields: Record<string, any>) => {
    setEditing({ kind, id: row.id });
    setDraft(fields);
    setStatus(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusy(true);
    setStatus(null);
    try {
      if (editing.kind === 'club') await updateClub(editing.id, draft);
      if (editing.kind === 'user') await updateUser(editing.id, draft);
      if (editing.kind === 'fixture') await updateFixture(editing.id, draft);
      setEditing(null);
      await load();
      setStatus('Saved.');
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  const runDelete = async () => {
    if (!confirming) return;
    setBusy(true);
    setStatus(null);
    try {
      if (confirming.kind === 'club') await deleteClub(confirming.id!);
      if (confirming.kind === 'user') await deleteUser(confirming.id!);
      if (confirming.kind === 'player') await deletePlayer(confirming.id!);
      if (confirming.kind === 'fixture') await deleteFixture(confirming.id!);
      if (confirming.kind === 'reset') await resetAllData(RESET_PHRASE);
      setConfirming(null);
      await load();
      setStatus(confirming.kind === 'reset' ? 'All league data cleared.' : 'Deleted.');
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Delete failed.');
      setConfirming(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-1)' }}>Manage League Data</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
        Full control over every record. Edits and deletions apply immediately.
      </p>

      <div className="tab-row" style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={t === tab ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => { setTab(t); setEditing(null); setStatus(null); }}
          >
            {t}
          </button>
        ))}
      </div>

      {status && <p className="card-meta" style={{ marginBottom: 'var(--space-3)' }}>{status}</p>}
      {loading && <p className="text-muted">Loading&hellip;</p>}

      {/* ── Clubs ───────────────────────────────────────────── */}
      {!loading && tab === 'Clubs' && (
        <div className="card elev-sm">
          <h3 className="card-title">Clubs ({clubs.length})</h3>
          <p className="card-meta">Deleting a club also removes its players, fixtures and results.</p>
          {clubs.map((c) => (
            <div key={c.id} style={rowStyle}>
              {editing?.kind === 'club' && editing.id === c.id ? (
                <>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 1, flexWrap: 'wrap' }}>
                    <input className="input" style={{ maxWidth: 220 }} value={draft.name ?? ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Club name" />
                    <input className="input" style={{ maxWidth: 110 }} value={draft.shortName ?? ''} onChange={(e) => setDraft({ ...draft, shortName: e.target.value })} placeholder="Short" />
                    <input className="input" style={{ maxWidth: 110 }} type="number" value={draft.yearFounded ?? ''} onChange={(e) => setDraft({ ...draft, yearFounded: e.target.value ? Number(e.target.value) : null })} placeholder="Founded" />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary" onClick={saveEdit} disabled={busy}>Save</button>
                    <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                    <Avatar src={c.logoUrl} name={c.name} size={36} rounded="soft" />
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{c.name}</p>
                      <p className="card-meta">{[c.shortName, c.yearFounded, c.homeVenue?.name].filter(Boolean).join(' · ')}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flex: 'none' }}>
                    <button className="btn btn-ghost" onClick={() => startEdit('club', c, { name: c.name, shortName: c.shortName ?? '', yearFounded: c.yearFounded })}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="btn btn-ghost" onClick={() => setConfirming({ kind: 'club', id: c.id, label: c.name })}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── People ──────────────────────────────────────────── */}
      {!loading && tab === 'People' && (
        <div className="card elev-sm">
          <h3 className="card-title">Staff Accounts ({users.length})</h3>
          <p className="card-meta">Change anyone&rsquo;s role, reassign a Team Manager&rsquo;s club, reset a password, or remove the account.</p>
          {users.map((u) => (
            <div key={u.id} style={rowStyle}>
              {editing?.kind === 'user' && editing.id === u.id ? (
                <>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 1, flexWrap: 'wrap' }}>
                    <input className="input" style={{ maxWidth: 130 }} value={draft.firstName ?? ''} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} placeholder="First name" />
                    <input className="input" style={{ maxWidth: 130 }} value={draft.lastName ?? ''} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} placeholder="Last name" />
                    <input className="input" style={{ maxWidth: 210 }} value={draft.email ?? ''} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" />
                    <select className="input" style={{ maxWidth: 175 }} value={draft.role ?? ''} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                    </select>
                    {draft.role === 'TEAM_MANAGER' && (
                      <select className="input" style={{ maxWidth: 190 }} value={draft.clubId ?? ''} onChange={(e) => setDraft({ ...draft, clubId: e.target.value || null })}>
                        <option value="">No club</option>
                        {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                    <input className="input" style={{ maxWidth: 190 }} type="text" value={draft.password ?? ''} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder="New password (optional)" />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary" onClick={saveEdit} disabled={busy}>Save</button>
                    <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                      {u.firstName} {u.lastName}
                      {u.id === currentUserId && <span className="tag tag-accent" style={{ marginLeft: 'var(--space-2)' }}>You</span>}
                    </p>
                    <p className="card-meta">{u.email} · {u.roleLabel || u.role}{u.club?.name ? ` · ${u.club.name}` : ''}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flex: 'none' }}>
                    <button className="btn btn-ghost" onClick={() => startEdit('user', u, { firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, clubId: u.clubId ?? '', password: '' })}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      disabled={u.id === currentUserId}
                      title={u.id === currentUserId ? 'You cannot delete your own account' : undefined}
                      onClick={() => setConfirming({ kind: 'user', id: u.id, label: `${u.firstName} ${u.lastName}` })}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Players ─────────────────────────────────────────── */}
      {!loading && tab === 'Players' && (
        <div className="card elev-sm">
          <h3 className="card-title">Players ({players.length})</h3>
          {players.length === 0 && <p className="card-meta">No players registered.</p>}
          {players.map((p) => (
            <div key={p.id} style={rowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                <Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={36} />
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                    {p.playerNumber ? `#${p.playerNumber} ` : ''}{p.firstName} {p.lastName}
                  </p>
                  <p className="card-meta">{[p.club?.name, p.position, `${p.goals} goals`].filter(Boolean).join(' · ')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 'none' }}>
                {!p.approved && <span className="tag tag-neutral">Pending</span>}
                <button className="btn btn-ghost" onClick={() => setConfirming({ kind: 'player', id: p.id, label: `${p.firstName} ${p.lastName}` })}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Fixtures ────────────────────────────────────────── */}
      {!loading && tab === 'Fixtures' && (
        <div className="card elev-sm">
          <h3 className="card-title">Fixtures ({fixtures.length})</h3>
          <p className="card-meta">Reschedule, correct a score, or remove a fixture entirely.</p>
          {fixtures.length === 0 && <p className="card-meta">No fixtures scheduled.</p>}
          {fixtures.map((f) => (
            <div key={f.id} style={rowStyle}>
              {editing?.kind === 'fixture' && editing.id === f.id ? (
                <>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 1, flexWrap: 'wrap' }}>
                    <input className="input" style={{ maxWidth: 160 }} type="date" value={draft.fixtureDate ?? ''} onChange={(e) => setDraft({ ...draft, fixtureDate: e.target.value })} />
                    <input className="input" style={{ maxWidth: 110 }} type="time" value={draft.kickoffTime ?? ''} onChange={(e) => setDraft({ ...draft, kickoffTime: e.target.value })} />
                    <select className="input" style={{ maxWidth: 150 }} value={draft.status ?? ''} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="POSTPONED">Postponed</option>
                    </select>
                    <input className="input" style={{ maxWidth: 80 }} type="number" value={draft.homeScore ?? ''} onChange={(e) => setDraft({ ...draft, homeScore: e.target.value === '' ? null : Number(e.target.value) })} placeholder="Home" />
                    <input className="input" style={{ maxWidth: 80 }} type="number" value={draft.awayScore ?? ''} onChange={(e) => setDraft({ ...draft, awayScore: e.target.value === '' ? null : Number(e.target.value) })} placeholder="Away" />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary" onClick={saveEdit} disabled={busy}>Save</button>
                    <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                      {f.homeClub?.name} {f.homeScore ?? '–'} : {f.awayScore ?? '–'} {f.awayClub?.name}
                    </p>
                    <p className="card-meta">
                      {formatDate(f.fixtureDate)} · {f.status}{f.venue?.name ? ` · ${f.venue.name}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flex: 'none' }}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => startEdit('fixture', f, {
                        fixtureDate: f.fixtureDate ? new Date(f.fixtureDate).toISOString().slice(0, 10) : '',
                        kickoffTime: f.kickoffTime ?? '',
                        status: f.status,
                        homeScore: f.homeScore,
                        awayScore: f.awayScore,
                      })}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="btn btn-ghost" onClick={() => setConfirming({ kind: 'fixture', id: f.id, label: `${f.homeClub?.name} vs ${f.awayClub?.name}` })}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Danger Zone ─────────────────────────────────────── */}
      {!loading && tab === 'Danger Zone' && (
        <div className="card elev-sm" style={{ borderColor: 'var(--color-accent-800)' }}>
          <h3 className="card-title" style={{ color: 'var(--color-accent-800)' }}>Start the League Afresh</h3>
          <p className="card-body">
            Permanently deletes every club, player, fixture, result, venue and news item, along with all
            staff accounts except your own. Use this to clear the sample data before entering a real season.
            This cannot be undone.
          </p>
          <ul className="card-body" style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li>{clubs.length} clubs</li>
            <li>{players.length} players</li>
            <li>{fixtures.length} fixtures</li>
            <li>{Math.max(0, users.length - 1)} other staff accounts</li>
          </ul>
          <button
            className="btn btn-primary"
            style={{ color: 'var(--color-accent-800)', borderColor: 'var(--color-accent-800)', alignSelf: 'flex-start' }}
            onClick={() => setConfirming({ kind: 'reset', label: 'all league data' })}
          >
            <Trash2 size={14} /> Delete all data
          </button>
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          title={confirming.kind === 'reset' ? 'Delete all league data?' : `Delete ${confirming.label}?`}
          confirmLabel={confirming.kind === 'reset' ? 'Delete everything' : 'Delete'}
          requirePhrase={confirming.kind === 'reset' ? RESET_PHRASE : undefined}
          busy={busy}
          onCancel={() => setConfirming(null)}
          onConfirm={runDelete}
          body={
            confirming.kind === 'reset' ? (
              <p style={{ margin: 0 }}>
                This wipes the entire league and every other staff account. Your own account is kept so you can sign
                back in. There is no undo.
              </p>
            ) : confirming.kind === 'club' ? (
              <p style={{ margin: 0 }}>
                <strong>{confirming.label}</strong> will be removed along with its players, fixtures and results. Any
                Team Manager assigned to it keeps their account but becomes unassigned.
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                <strong>{confirming.label}</strong> will be permanently removed.
              </p>
            )
          }
        />
      )}
    </div>
  );
}
