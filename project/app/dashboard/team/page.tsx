'use client';

import { useEffect, useState } from 'react';
import { getDashboardSummary, registerPlayer, updatePlayer } from '@/lib/admin-api';
import { getPlayers } from '@/lib/public-api';
import { useAuthStore } from '@/store/auth';
import StatCard from '@/components/StatCard';
import Avatar from '@/components/Avatar';
import ImageUpload from '@/components/ImageUpload';
import PhotoButton from '@/components/PhotoButton';

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TeamManagerDashboard() {
  const clubId = useAuthStore((s) => s.user?.clubId as string | undefined);
  const clubName = useAuthStore((s) => s.user?.clubName as string | undefined);
  const [data, setData] = useState<any>(null);
  const [squad, setSquad] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [playerForm, setPlayerForm] = useState<{
    firstName: string;
    lastName: string;
    playerNumber: string;
    position: string;
    dateOfBirth: string;
    photoUrl: string | null;
  }>({ firstName: '', lastName: '', playerNumber: '', position: '', dateOfBirth: '', photoUrl: null });
  const [playerStatus, setPlayerStatus] = useState<string | null>(null);

  const load = async () => {
    try {
      const [summary, squadRes] = await Promise.all([
        getDashboardSummary(),
        getPlayers(1, 100, { includePending: true }),
      ]);
      setData(summary.data?.data);
      setSquad(squadRes.data?.data || []);
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
    try {
      await registerPlayer({
        clubId,
        firstName: playerForm.firstName,
        lastName: playerForm.lastName,
        playerNumber: playerForm.playerNumber ? Number(playerForm.playerNumber) : undefined,
        position: playerForm.position || undefined,
        dateOfBirth: playerForm.dateOfBirth || undefined,
        photoUrl: playerForm.photoUrl,
      });
      setPlayerStatus('Player submitted for League Manager approval.');
      setPlayerForm({ firstName: '', lastName: '', playerNumber: '', position: '', dateOfBirth: '', photoUrl: null });
      load();
    } catch (err: any) {
      setPlayerStatus(err?.response?.data?.error || 'Failed to register player.');
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
                  <label htmlFor="p-last">Last name</label>
                  <input id="p-last" className="input" required value={playerForm.lastName} onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                <div className="field">
                  <label htmlFor="p-number">Shirt number</label>
                  <input id="p-number" type="number" className="input" value={playerForm.playerNumber} onChange={(e) => setPlayerForm({ ...playerForm, playerNumber: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="p-position">Position</label>
                  <select id="p-position" className="input" value={playerForm.position} onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}>
                    <option value="">Select&hellip;</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="p-dob">Date of birth</label>
                <input id="p-dob" type="date" className="input" value={playerForm.dateOfBirth} onChange={(e) => setPlayerForm({ ...playerForm, dateOfBirth: e.target.value })} />
              </div>
              <ImageUpload
                label="Player photo"
                kind="player"
                name={`${playerForm.firstName} ${playerForm.lastName}`.trim()}
                value={playerForm.photoUrl}
                onChange={(url) => setPlayerForm({ ...playerForm, photoUrl: url })}
              />
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
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: i < squad.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                        <Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={40} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
                            {p.playerNumber ? `#${p.playerNumber} ` : ''}{p.firstName} {p.lastName}
                          </p>
                          <p className="card-meta">
                            {[p.position, p.dateOfBirth ? `Born ${formatDate(p.dateOfBirth)}` : null].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <PhotoButton id={p.id} currentUrl={p.photoUrl} kind="player" onChange={handleSquadPhoto} />
                        {p.approved ? <span className="tag tag-accent">Approved</span> : <span className="tag tag-neutral">Pending</span>}
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
