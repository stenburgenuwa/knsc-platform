'use client';

import { useEffect, useState } from 'react';
import { getDashboardSummary, createClub, createUser, getPendingPlayers, approvePlayer } from '@/lib/admin-api';
import StatCard from '@/components/StatCard';

const ROLE_OPTIONS = ['LEAGUE_MANAGER', 'TEAM_MANAGER', 'REFEREE', 'REFEREE_MANAGER'];

export default function PlatformOwnerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<any[]>([]);

  const [clubForm, setClubForm] = useState({ name: '', shortName: '', yearFounded: '' });
  const [clubStatus, setClubStatus] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({ email: '', firstName: '', lastName: '', role: ROLE_OPTIONS[0] });
  const [userStatus, setUserStatus] = useState<string | null>(null);

  const load = async () => {
    try {
      const [summary, pendingRes] = await Promise.all([getDashboardSummary(), getPendingPlayers()]);
      setData(summary.data?.data);
      setPending((pendingRes.data?.data || []).filter((p: any) => !p.approved));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setClubStatus(null);
    try {
      await createClub({
        name: clubForm.name,
        shortName: clubForm.shortName || undefined,
        yearFounded: clubForm.yearFounded ? Number(clubForm.yearFounded) : undefined,
      });
      setClubStatus(`"${clubForm.name}" created.`);
      setClubForm({ name: '', shortName: '', yearFounded: '' });
      load();
    } catch (err: any) {
      setClubStatus(err?.response?.data?.error || 'Failed to create club.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserStatus(null);
    try {
      const res = await createUser(userForm);
      setUserStatus(`Account created. Temporary password: ${res.data?.data?.temporaryPassword}`);
      setUserForm({ email: '', firstName: '', lastName: '', role: ROLE_OPTIONS[0] });
    } catch (err: any) {
      setUserStatus(err?.response?.data?.error || 'Failed to create account.');
    }
  };

  const handleApprove = async (id: string) => {
    await approvePlayer(id);
    load();
  };

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>Dashboard</h1>

      {loading ? (
        <p className="text-muted">Loading&hellip;</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <StatCard label="Total Clubs" value={data?.totalClubs || 0} />
            <StatCard label="Total Players" value={data?.totalPlayers || 0} />
            <StatCard label="Total Fixtures" value={data?.totalFixtures || 0} />
            <StatCard label="Pending Approvals" value={data?.pendingApprovals || 0} tone="warning" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <form onSubmit={handleCreateClub} className="card elev-sm">
              <h3 className="card-title">Register a Club</h3>
              <div className="field">
                <label htmlFor="club-name">Club name</label>
                <input id="club-name" className="input" required value={clubForm.name} onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="club-short">Short name</label>
                <input id="club-short" className="input" value={clubForm.shortName} onChange={(e) => setClubForm({ ...clubForm, shortName: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="club-year">Year founded</label>
                <input id="club-year" type="number" className="input" value={clubForm.yearFounded} onChange={(e) => setClubForm({ ...clubForm, yearFounded: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Create Club</button>
              {clubStatus && <p className="card-meta">{clubStatus}</p>}
            </form>

            <form onSubmit={handleCreateUser} className="card elev-sm">
              <h3 className="card-title">Create a Staff Account</h3>
              <div className="field">
                <label htmlFor="user-email">Email</label>
                <input id="user-email" type="email" className="input" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                <div className="field">
                  <label htmlFor="user-first">First name</label>
                  <input id="user-first" className="input" required value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="user-last">Last name</label>
                  <input id="user-last" className="input" required value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="user-role">Role</label>
                <select id="user-role" className="input" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Create Account</button>
              {userStatus && <p className="card-meta">{userStatus}</p>}
            </form>
          </div>

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
        </>
      )}
    </div>
  );
}
