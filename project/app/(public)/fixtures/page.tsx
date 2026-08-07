'use client';

import { useEffect, useState } from 'react';
import { getFixtures } from '@/lib/public-api';
import Pagination from '@/components/Pagination';
import Avatar from '@/components/Avatar';
import { SkeletonCards } from '@/components/Skeleton';

function clubName(club: any) {
  return club?.clubName || club?.name || 'TBC';
}

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchFixtures = async () => {
      setLoading(true);
      try {
        const response = await getFixtures(page, 12);
        setFixtures(response.data?.data || []);
        setTotal(response.data?.pagination?.total || 0);
      } catch (error) {
        console.error('Error loading fixtures:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, [page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>Fixtures</h1>

      {!loading && fixtures.length === 0 && <p className="text-muted">No upcoming fixtures scheduled.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {loading && <SkeletonCards count={6} />}
        {fixtures.map((fixture: any) => (
          <div key={fixture.id} className="card elev-sm">
            <p className="card-meta">{formatDate(fixture.fixtureDate || fixture.date)}</p>
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                <Avatar src={fixture.homeClub?.logoUrl} name={clubName(fixture.homeClub)} size={22} rounded="soft" />
                {clubName(fixture.homeClub)}
              </span>
              <span className="text-muted" style={{ fontSize: 12, flex: 'none' }}>vs</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                <Avatar src={fixture.awayClub?.logoUrl} name={clubName(fixture.awayClub)} size={22} rounded="soft" />
                {clubName(fixture.awayClub)}
              </span>
            </div>
            <p className="card-meta">{fixture.venue?.name || 'Venue TBC'}</p>
            <p className="card-meta">{fixture.kickoffTime || ''}</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}
