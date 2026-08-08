'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, Download } from 'lucide-react';
import { getDashboardSummary, getReferees, assignReferee, createUser, updateUser, deleteUser } from '@/lib/admin-api';
import { getFixtures } from '@/lib/public-api';
import StatCard from '@/components/StatCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import AnnouncementsPanel from '@/components/AnnouncementsPanel';
import { downloadCsv } from '@/lib/csv';

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const EMPTY_FORM = { email: '', firstName: '', lastName: '' };

const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
  ON_LEAVE: 'On leave',
  INJURED: 'Injured',
};

function availabilityTagClass(value?: string | null) {
  if (!value || value === 'AVAILABLE') return 'tag-accent';
  return 'tag-neutral';
}

// Referees who haven't marked themselves unavailable sort first, so the
// assignment dropdown surfaces the people most likely to say yes.
function sortByAvailability(list: any[]) {
  return [...list].sort((a, b) => {
    const aAvailable = !a.availability || a.availability === 'AVAILABLE' ? 0 : 1;
    const bAvailable = !b.availability || b.availability === 'AVAILABLE' ? 0 : 1;
    return aAvailable - bAvailable;
  });
}

export default function RefereeManagerDashboard() {
  const [data, setData] = useState<any>(null);
  const [referees, setReferees] = useState<any[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formStatus, setFormStatus] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});
  const [confirming, setConfirming] = useState<{ id: string; label: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [summary, refereesRes, fixturesRes] = await Promise.all([
        getDashboardSummary(),
        getReferees(),
        getFixtures(1, 50),
      ]);
      setData(summary.data?.data);
      const refList = refereesRes.data?.data || [];
      setReferees(refList);
      const sortedRefs = sortByAvailability(refList);
      const fixtures = fixturesRes.data?.data || [];
      setUnassigned(fixtures.filter((f: any) => !f.refereeAssignment));
      setPicks((p) => {
        const next = { ...p };
        for (const f of fixtures) {
          if (!next[f.id] && sortedRefs[0]) next[f.id] = sortedRefs[0].id;
        }
        return next;
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssign = async (fixtureId: string) => {
    const refereeId = picks[fixtureId];
    if (!refereeId) return;
    try {
      await assignReferee(fixtureId, refereeId);
      setStatus('Referee assigned.');
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to assign referee.');
    }
  };

  const exportReferees = () =>
    downloadCsv('referees.csv', referees, [
      { header: 'First Name', value: (r) => r.firstName },
      { header: 'Last Name', value: (r) => r.lastName },
      { header: 'Email', value: (r) => r.email },
      { header: 'Availability', value: (r) => AVAILABILITY_LABELS[r.availability] || 'Available' },
    ]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);
    try {
      const res = await createUser({ ...form, role: 'REFEREE' });
      setFormStatus(`Referee registered. Temporary password: ${res.data?.data?.temporaryPassword}`);
      setForm(EMPTY_FORM);
      load();
    } catch (err: any) {
      setFormStatus(err?.response?.data?.error || 'Failed to register referee.');
    }
  };

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setDraft({ firstName: r.firstName, lastName: r.lastName, email: r.email });
    setStatus(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setBusy(true);
    try {
      await updateUser(editingId, draft);
      setEditingId(null);
      await load();
      setStatus('Referee updated.');
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to update referee.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirming) return;
    setBusy(true);
    try {
      await deleteUser(confirming.id);
      setConfirming(null);
      await load();
      setStatus('Referee removed.');
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to remove referee.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>Referee Manager Dashboard</h1>

      {loading ? (
        <p className="text-muted">Loading&hellip;</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <StatCard label="Active Referees" value={data?.activeReferees || 0} />
            <StatCard label="Unassigned Fixtures" value={data?.unassignedFixtures || 0} tone="warning" />
            <StatCard label="Availability Submitted" value={data?.availabilitySubmitted || 0} />
            <StatCard label="Avg. Performance Rating" value={data?.avgRating || '4.5'} tone="accent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <form onSubmit={handleRegister} className="card elev-sm">
              <h3 className="card-title">Register a Referee</h3>
              <div className="field">
                <label htmlFor="ref-email">Email</label>
                <input id="ref-email" type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                <div className="field">
                  <label htmlFor="ref-first">First name</label>
                  <input id="ref-first" className="input" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="ref-last">Last name</label>
                  <input id="ref-last" className="input" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Register Referee</button>
              {formStatus && <p className="card-meta">{formStatus}</p>}
            </form>

            <div className="card elev-sm">
              <h3 className="card-title">Fixtures Needing a Referee</h3>
              {status && <p className="card-meta">{status}</p>}
              {unassigned.length === 0 ? (
                <p className="card-meta">Every upcoming fixture has a referee assigned.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {unassigned.map((f) => (
                    <div key={f.id} style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-2)' }}>
                      <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{f.homeClub.name} vs {f.awayClub.name}</p>
                      <p className="card-meta">{formatDate(f.fixtureDate)}</p>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                        <select
                          className="input"
                          value={picks[f.id] || ''}
                          onChange={(e) => setPicks({ ...picks, [f.id]: e.target.value })}
                        >
                          {sortByAvailability(referees).map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.firstName} {r.lastName}
                              {r.availability && r.availability !== 'AVAILABLE' ? ` (${AVAILABILITY_LABELS[r.availability]})` : ''}
                            </option>
                          ))}
                        </select>
                        <button className="btn btn-primary" disabled={!referees.length} onClick={() => handleAssign(f.id)}>Assign</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card elev-sm">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Referee Roster ({referees.length})</h3>
              <button className="btn btn-ghost" onClick={exportReferees}><Download size={14} /> Export CSV</button>
            </div>
            {referees.length === 0 ? (
              <p className="card-meta">No referees registered yet &mdash; use the form above to add one.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {referees.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-2) 0',
                      borderBottom: i < referees.length - 1 ? '1px solid var(--color-divider)' : 'none',
                    }}
                  >
                    {editingId === r.id ? (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 1, flexWrap: 'wrap' }}>
                        <input className="input" value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} placeholder="First name" />
                        <input className="input" value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} placeholder="Last name" />
                        <input className="input" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" />
                        <button className="btn btn-primary" disabled={busy} onClick={saveEdit}>Save</button>
                        <button className="btn btn-secondary" disabled={busy} onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p style={{ fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            {r.firstName} {r.lastName}
                            <span className={`tag ${availabilityTagClass(r.availability)}`}>
                              {AVAILABILITY_LABELS[r.availability] || 'Available'}
                            </span>
                          </p>
                          <p className="card-meta">{r.email}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button className="btn btn-icon" aria-label="Edit referee" onClick={() => startEdit(r)}>
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn btn-icon"
                            aria-label="Remove referee"
                            onClick={() => setConfirming({ id: r.id, label: `${r.firstName} ${r.lastName}` })}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <AnnouncementsPanel canCompose audienceOptions={[{ value: 'REFEREE', label: 'Referees only' }]} />
          </div>

          {confirming && (
            <ConfirmDialog
              title="Remove referee?"
              body={<p>This removes <strong>{confirming.label}</strong>&rsquo;s account and their upcoming referee assignments. This cannot be undone.</p>}
              confirmLabel="Remove"
              busy={busy}
              onConfirm={handleDelete}
              onCancel={() => setConfirming(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
