'use client';

import { useEffect, useState } from 'react';
import { getResults } from '@/lib/public-api';
import Pagination from '@/components/Pagination';
import Avatar from '@/components/Avatar';

function clubName(club: any) {
  return club?.clubName || club?.name || 'TBC';
}

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await getResults(page, 12);
        setResults(response.data?.data || []);
        setTotal(response.data?.pagination?.total || 0);
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>Results</h1>

      {loading && <p className="text-muted">Loading results&hellip;</p>}
      {!loading && results.length === 0 && <p className="text-muted">No results published yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {results.map((result: any) => (
          <div key={result.id} className="card elev-sm" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <p className="card-meta" style={{ marginBottom: 'var(--space-1)' }}>{formatDate(result.fixtureDate || result.date)}</p>
              <p style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                <Avatar src={result.homeClub?.logoUrl} name={clubName(result.homeClub)} size={24} rounded="soft" />
                {clubName(result.homeClub)}
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '0 var(--space-4)', fontFamily: 'var(--font-heading)', fontSize: 24 }}>
              {result.homeScore ?? '-'}
              <span className="text-muted" style={{ fontSize: 14 }}> &ndash; </span>
              {result.awayScore ?? '-'}
            </div>
            <div style={{ flex: 1 }}>
              <p className="card-meta" style={{ marginBottom: 'var(--space-1)' }}>&nbsp;</p>
              <p style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'flex-end', margin: 0 }}>
                {clubName(result.awayClub)}
                <Avatar src={result.awayClub?.logoUrl} name={clubName(result.awayClub)} size={24} rounded="soft" />
              </p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}
