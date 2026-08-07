'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClubs } from '@/lib/public-api';

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

      {loading && <p className="text-muted">Loading clubs&hellip;</p>}
      {!loading && clubs.length === 0 && <p className="text-muted">No clubs registered yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
        {clubs.map((club: any) => (
          <div key={club.id} className="card elev-sm">
            <h3 className="card-title">{club.clubName || club.name}</h3>
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
