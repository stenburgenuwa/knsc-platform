'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPlayers } from '@/lib/public-api';
import Pagination from '@/components/Pagination';
import Avatar from '@/components/Avatar';
import { SkeletonCards } from '@/components/Skeleton';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const response = await getPlayers(page, 16);
        setPlayers(response.data?.data || []);
        setTotal(response.data?.pagination?.total || 0);
      } catch (error) {
        console.error('Error loading players:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [page]);

  const totalPages = Math.ceil(total / 16);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>Players Directory</h1>

      {!loading && players.length === 0 && <p className="text-muted">No approved players yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {loading && <SkeletonCards count={8} />}
        {players.map((player: any) => (
          <Link
            key={player.id}
            href={`/players/${player.id}`}
            className="card elev-sm"
            style={{ textAlign: 'center', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
          >
            <Avatar
              src={player.photoUrl}
              name={`${player.firstName || ''} ${player.lastName || ''}`.trim()}
              size={88}
            />
            <h4 className="card-title">
              {`${player.firstName || ''} ${player.lastName || ''}`.trim()}
            </h4>
            <p className="card-meta" style={{ justifyContent: 'center' }}>
              {[player.club?.name, player.position].filter(Boolean).join(' · ')}
            </p>
            {player.playerNumber && (
              <span className="tag tag-accent" style={{ alignSelf: 'center' }}>#{player.playerNumber}</span>
            )}
          </Link>
        ))}
      </div>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}
