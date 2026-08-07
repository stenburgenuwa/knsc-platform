'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClub } from '@/lib/public-api';

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ClubProfilePage({ params }: { params: { id: string } }) {
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClub(params.id);
        setClub(res.data?.data);
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
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <p className="text-muted">Loading&hellip;</p>
      </div>
    );
  }

  if (notFound || !club) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <h1 style={{ fontWeight: 400 }}>Club not found</h1>
        <Link href="/clubs" className="btn btn-ghost">&larr; Back to clubs directory</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <Link href="/clubs" className="btn btn-ghost" style={{ marginBottom: 'var(--space-3)' }}>&larr; Clubs directory</Link>
      <h1 style={{ fontWeight: 400 }}>{club.name}</h1>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {club.yearFounded && <span className="tag tag-neutral">Founded {club.yearFounded}</span>}
        {club.homeVenue?.name && <span className="tag tag-neutral">{club.homeVenue.name}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
        <section>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Squad</h3>
          {(!club.players || club.players.length === 0) ? (
            <p className="text-muted">No approved players yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {club.players.map((p: any, i: number) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) 0',
                    borderBottom: i < club.players.length - 1 ? '1px solid var(--color-divider)' : 'none',
                  }}
                >
                  <span>{p.firstName} {p.lastName}</span>
                  {p.playerNumber && <span className="text-muted">#{p.playerNumber}</span>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Recent Results</h3>
          {(!club.recentResults || club.recentResults.length === 0) ? (
            <p className="text-muted">No completed fixtures yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {club.recentResults.map((r: any, i: number) => (
                <div key={r.id} style={{ padding: 'var(--space-2) 0', borderBottom: i < club.recentResults.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
                    {r.home ? 'vs' : '@'} {r.opponent} &nbsp; {r.forScore}&ndash;{r.againstScore}
                  </p>
                  <p className="card-meta">{formatDate(r.fixtureDate)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
