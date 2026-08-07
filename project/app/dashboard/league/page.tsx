'use client';

import { useEffect, useState } from 'react';
import { getDashboardSummary, createFixture, getVenues, getPendingPlayers, approvePlayer } from '@/lib/admin-api';
import { getClubs } from '@/lib/public-api';
import StatCard from '@/components/StatCard';

export default function LeagueManagerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  const [fixtureForm, setFixtureForm] = useState({ homeClubId: '', awayClubId: '', venueId: '', fixtureDate: '', kickoffTime: '15:00' });
  const [fixtureStatus, setFixtureStatus] = useState<string | null>(null);

  const load = async () => {
    try {
      const [summary, clubsRes, venuesRes, pendingRes] = await Promise.all([
        getDashboardSummary(),
        getClubs(1, 100),
        getVenues(),
        getPendingPlayers(),
      ]);
      setData(summary.data?.data);
      const clubList = clubsRes.data?.data || [];
      setClubs(clubList);
      setVenues(venuesRes.data?.data || []);
      setPending((pendingRes.data?.data || []).filter((p: any) => !p.approved));
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
        venueId: fixtureForm.venueId || undefined,
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
    await approvePlayer(id);
    load();
  };

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>League Manager Dashboard</h1>

      {loading ? (
        <p className="text-muted">Loading&hellip;</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <StatCard label="Upcoming Fixtures" value={data?.upcomingFixtures || 0} />
            <StatCard label="Pending Approvals" value={data?.pendingReports || 0} tone="warning" />
            <StatCard label="Registered Players" value={data?.registeredPlayers || 0} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
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
                <label htmlFor="venue">Venue</label>
                <select id="venue" className="input" value={fixtureForm.venueId} onChange={(e) => setFixtureForm({ ...fixtureForm, venueId: e.target.value })}>
                  <option value="">TBC</option>
                  {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
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
              {pending.length === 0 ? (
                <p className="card-meta">No players awaiting approval.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {pending.map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: i < pending.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{p.firstName} {p.lastName}</p>
                        <p className="card-meta">{p.club?.name}</p>
                      </div>
                      <button className="btn btn-primary" onClick={() => handleApprove(p.id)}>Approve</button>
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
