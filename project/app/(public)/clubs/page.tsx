'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClubs } from '@/lib/public-api';
import Avatar from '@/components/Avatar';
import { SkeletonCards } from '@/components/Skeleton';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await getClubs(1, 12);
        setClubs(response.data?.data || []);
      } catch (error) {
        console.error('Error loading clubs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>Clubs Directory</h1>

      {!loading && clubs.length === 0 && <p className="text-muted">No clubs registered yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
        {loading && <SkeletonCards count={6} />}
        {clubs.map((club: any) => (
          <div key={club.id} className="card elev-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Avatar src={club.logoUrl} name={club.name} size={48} rounded="soft" />
              <h3 className="card-title" style={{ margin: 0 }}>{club.name}</h3>
            </div>
            {club.yearFounded && (
              <p className="card-meta">
                <strong>Founded:</strong> {club.yearFounded}
              </p>
            )}
            {club.homeVenue?.name && (
              <p className="card-meta">
                <strong>Home:</strong> {club.homeVenue.name}
              </p>
            )}
            <Link href={`/clubs/${club.id}`} className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
              View Profile &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
