'use client';

import { useEffect, useState } from 'react';
import { getDashboardSummary, getMyAssignments, respondToAssignment, submitResult } from '@/lib/admin-api';
import StatCard from '@/components/StatCard';

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function RefereeDashboard() {
  const [data, setData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    try {
      const [summary, assignmentsRes] = await Promise.all([getDashboardSummary(), getMyAssignments()]);
      setData(summary.data?.data);
      setAssignments(assignmentsRes.data?.data || []);
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
      await submitResult(fixtureId, Number(s.home), Number(s.away));
      setStatus('Result submitted.');
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to submit result.');
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

          <div className="card elev-sm">
            <h3 className="card-title">My Assignments</h3>
            {status && <p className="card-meta">{status}</p>}
            {assignments.length === 0 ? (
              <p className="card-meta">No assignments yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {assignments.map((a) => (
                  <div key={a.id} style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                          {a.fixture.homeClub.name} vs {a.fixture.awayClub.name}
                        </p>
                        <p className="card-meta">
                          {a.fixture.venue?.name || 'Venue TBC'} &bull; {formatDate(a.fixture.fixtureDate)}
                        </p>
                      </div>
                      <span className="tag tag-neutral">{a.status}</span>
                    </div>

                    {a.status === 'ASSIGNED' && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                        <button className="btn btn-primary" onClick={() => respond(a.id, 'ACCEPTED')}>Accept</button>
                        <button className="btn btn-secondary" onClick={() => respond(a.id, 'DECLINED')}>Decline</button>
                      </div>
                    )}

                    {a.status === 'ACCEPTED' && a.fixture.status === 'UPCOMING' && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', marginTop: 'var(--space-2)' }}>
                        <div className="field" style={{ marginBottom: 0 }}>
                          <label>Home score</label>
                          <input
                            type="number"
                            className="input"
                            style={{ width: 90 }}
                            value={scores[a.fixture.id]?.home ?? ''}
                            onChange={(e) => setScores({ ...scores, [a.fixture.id]: { home: e.target.value, away: scores[a.fixture.id]?.away ?? '' } })}
                          />
                        </div>
                        <div className="field" style={{ marginBottom: 0 }}>
                          <label>Away score</label>
                          <input
                            type="number"
                            className="input"
                            style={{ width: 90 }}
                            value={scores[a.fixture.id]?.away ?? ''}
                            onChange={(e) => setScores({ ...scores, [a.fixture.id]: { home: scores[a.fixture.id]?.home ?? '', away: e.target.value } })}
                          />
                        </div>
                        <button className="btn btn-primary" onClick={() => handleSubmitResult(a.fixture.id)}>Submit Result</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
