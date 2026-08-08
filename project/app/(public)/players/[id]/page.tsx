'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPlayer } from '@/lib/public-api';
import Avatar from '@/components/Avatar';
import StatCard from '@/components/StatCard';

const EVENT_LABELS: Record<string, string> = { GOAL: 'Goal', YELLOW_CARD: 'Yellow card', RED_CARD: 'Red card' };

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Recomputed from dateOfBirth on every render, so it's always correct as of
// today rather than a value that goes stale after the player's next birthday.
function calculateAge(dob?: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPlayer(params.id);
        setPlayer(res.data?.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <p className="text-muted">Loading&hellip;</p>
      </div>
    );
  }

  if (notFound || !player) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <h1 style={{ fontWeight: 400 }}>Player not found</h1>
        <Link href="/players" className="btn btn-ghost">&larr; Back to players directory</Link>
      </div>
    );
  }

  const age = calculateAge(player.dateOfBirth);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <Link href="/players" className="btn btn-ghost" style={{ marginBottom: 'var(--space-3)' }}>&larr; Players directory</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Avatar src={player.photoUrl} name={`${player.firstName} ${player.lastName}`} size={88} />
        <div>
          <h1 style={{ fontWeight: 400, margin: 0 }}>
            {player.playerNumber ? `#${player.playerNumber} ` : ''}{player.firstName} {player.lastName}
          </h1>
          <p className="text-muted" style={{ margin: 0 }}>
            <Link href={`/clubs/${player.club?.id}`} className="text-muted">{player.club?.name}</Link>
            {player.position ? ` · ${player.position}` : ''}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {player.registrationNumber ? (
          <span className="tag tag-accent">{player.registrationNumber}</span>
        ) : (
          <span className="tag tag-neutral">Registration pending</span>
        )}
        {!player.approved && <span className="tag tag-neutral">Pending approval</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <StatCard label="Goals" value={player.stats?.goals ?? 0} tone="accent" />
        <StatCard label="Yellow Cards" value={player.stats?.yellowCards ?? 0} />
        <StatCard label="Red Cards" value={player.stats?.redCards ?? 0} />
      </div>

      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Personal Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 'var(--space-3)' }}>
          <div>
            <p className="card-meta" style={{ marginBottom: 2 }}>Date of Birth</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{formatDate(player.dateOfBirth) || '—'}</p>
          </div>
          <div>
            <p className="card-meta" style={{ marginBottom: 2 }}>Age</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{age ?? '—'}</p>
          </div>
          <div>
            <p className="card-meta" style={{ marginBottom: 2 }}>ID / Passport Number</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.idNumber || '—'}</p>
          </div>
          <div>
            <p className="card-meta" style={{ marginBottom: 2 }}>Height</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.height ? `${player.height} cm` : '—'}</p>
          </div>
          <div>
            <p className="card-meta" style={{ marginBottom: 2 }}>Weight</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.weight ? `${player.weight} kg` : '—'}</p>
          </div>
          <div>
            <p className="card-meta" style={{ marginBottom: 2 }}>County</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.county || '—'}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Match History</h3>
        {(!player.matchHistory || player.matchHistory.length === 0) ? (
          <p className="text-muted">No match history yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {player.matchHistory.map((m: any, i: number) => (
              <div
                key={m.fixtureId}
                style={{ padding: 'var(--space-2) 0', borderBottom: i < player.matchHistory.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
              >
                <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
                  {m.home ? 'vs' : '@'} {m.opponent} &nbsp; {m.forScore ?? '-'}&ndash;{m.againstScore ?? '-'}
                </p>
                <p className="card-meta">
                  {formatDate(m.fixtureDate)}
                  {m.events?.length > 0 && ` · ${m.events.map((e: any) => `${EVENT_LABELS[e.type] || e.type}${e.minute ? ` ${e.minute}'` : ''}`).join(', ')}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
