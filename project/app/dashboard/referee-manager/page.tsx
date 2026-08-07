'use client';

import { useEffect, useState } from 'react';
import { getDashboardSummary, getReferees, assignReferee } from '@/lib/admin-api';
import { getFixtures } from '@/lib/public-api';
import StatCard from '@/components/StatCard';

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function RefereeManagerDashboard() {
  const [data, setData] = useState<any>(null);
  const [referees, setReferees] = useState<any[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

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
      const fixtures = fixturesRes.data?.data || [];
      setUnassigned(fixtures.filter((f: any) => !f.refereeAssignment));
      setPicks((p) => {
        const next = { ...p };
        for (const f of fixtures) {
          if (!next[f.id] && refList[0]) next[f.id] = refList[0].id;
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

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
            <div className="card elev-sm">
              <h3 className="card-title">Referee Roster</h3>
              {referees.length === 0 ? (
                <p className="card-meta">No referees registered yet &mdash; ask the Platform Owner to create an account.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {referees.map((r, i) => (
                    <div key={r.id} style={{ padding: 'var(--space-2) 0', borderBottom: i < referees.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                      <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{r.firstName} {r.lastName}</p>
                      <p className="card-meta">{r.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                          {referees.map((r) => (
                            <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>
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
        </>
      )}
    </div>
  );
}
