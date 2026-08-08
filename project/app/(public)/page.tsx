'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFixtures, getResults, getStandings, getNews } from '@/lib/public-api';
import Avatar from '@/components/Avatar';
import { SkeletonCards, SkeletonRows } from '@/components/Skeleton';

function clubName(club: any) {
  return club?.clubName || club?.name || 'TBC';
}

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const FEATURED_FALLBACK = {
  title: 'Malindi United extends unbeaten run to five matches',
  date: '2026-08-05',
  body: 'With a commanding 2–0 victory over Mtwapa FC last Saturday, Malindi United continues to dominate the Kilifi North standings. The victory extends their unbeaten run and cements their position atop the table with 13 points from five matches, setting a strong pace for the season.',
};

function PlaceholderPlate() {
  return (
    <div className="plate" style={{ aspectRatio: '16 / 9', background: 'var(--color-neutral-200)' }}>
      <svg viewBox="0 0 400 225" width="100%" height="100%" role="img" aria-label="Match photo placeholder">
        <rect width="400" height="225" fill="var(--color-neutral-200)" />
        <rect x="20" y="20" width="360" height="185" fill="none" stroke="var(--color-neutral-400)" strokeWidth="1.5" />
        <circle cx="200" cy="112.5" r="34" fill="none" stroke="var(--color-neutral-400)" strokeWidth="1.5" />
        <line x1="200" y1="20" x2="200" y2="205" stroke="var(--color-neutral-400)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fixturesRes, resultsRes, standingsRes, newsRes] = await Promise.all([
          getFixtures(1, 3),
          getResults(1, 3),
          getStandings(),
          getNews(1, 5),
        ]);
        setFixtures(fixturesRes.data?.data || []);
        setResults(resultsRes.data?.data || []);
        setStandings(standingsRes.data?.data?.standings || []);
        setTopScorers(standingsRes.data?.data?.topScorers || []);
        setNews(newsRes.data?.data || []);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featured = news[0];
  const moreNews = news.slice(1);

  return (
    <div>
      {/* Hero */}
      <div className="hero-band">
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-4)', textAlign: 'center' }}>
          <p className="card-kicker" style={{ marginBottom: 'var(--space-2)' }}>Official League Platform</p>
          <h1 style={{ fontWeight: 400 }}>Kilifi North Sub County League</h1>
          <p className="text-muted" style={{ maxWidth: 560, margin: '0 auto var(--space-4)' }}>
            Fixtures, results, standings and club news for Kilifi North&rsquo;s football clubs.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/fixtures" className="btn btn-primary">
              View Fixtures &rarr;
            </Link>
            <Link href="/standings" className="btn btn-secondary">
              League Table
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        {/* Featured News */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-3)' }}>Latest News</h6>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-6)', alignItems: 'center' }}>
            {featured?.featuredImageUrl ? (
              <img
                src={featured.featuredImageUrl}
                alt={featured.title}
                className="plate"
                style={{ aspectRatio: '16 / 9', width: '100%', objectFit: 'cover' }}
              />
            ) : (
              <PlaceholderPlate />
            )}
            <div>
              <p className="text-muted" style={{ fontSize: 12, marginBottom: 'var(--space-1)' }}>
                {formatDate(featured?.startDate || featured?.createdAt) || formatDate(FEATURED_FALLBACK.date)}
              </p>
              <h2 style={{ fontWeight: 400 }}>{featured?.title || FEATURED_FALLBACK.title}</h2>
              <p>{featured?.message || FEATURED_FALLBACK.body}</p>
              <Link href="/news" className="btn btn-ghost">Read more &rarr;</Link>
            </div>
          </div>
        </section>

        <div className="hr" />

        {/* Recent Results */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontWeight: 400 }}>Recent Results</h2>
            <Link href="/results" className="btn btn-ghost">View all &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
            {loading && <SkeletonCards count={3} />}
            {!loading && results.length === 0 && <p className="text-muted">No results yet.</p>}
            {results.map((result: any) => (
              <div key={result.id} className="card elev-sm">
                <span className="tag tag-neutral" style={{ alignSelf: 'flex-start' }}>Full time</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-heading)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                    <Avatar src={result.homeClub?.logoUrl} name={clubName(result.homeClub)} size={22} rounded="soft" />
                    {clubName(result.homeClub)}
                  </span>
                  <strong>{result.homeScore ?? '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-heading)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                    <Avatar src={result.awayClub?.logoUrl} name={clubName(result.awayClub)} size={22} rounded="soft" />
                    {clubName(result.awayClub)}
                  </span>
                  <strong>{result.awayScore ?? '-'}</strong>
                </div>
                <p className="card-meta">{formatDate(result.fixtureDate || result.date)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Fixtures */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontWeight: 400 }}>Upcoming Fixtures</h2>
            <Link href="/fixtures" className="btn btn-ghost">View all &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
            {loading && <SkeletonCards count={3} />}
            {!loading && fixtures.length === 0 && <p className="text-muted">No fixtures scheduled.</p>}
            {fixtures.map((fixture: any) => (
              <div key={fixture.id} className="card elev-sm">
                <p className="card-meta">{formatDate(fixture.fixtureDate || fixture.date)}</p>
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                    <Avatar src={fixture.homeClub?.logoUrl} name={clubName(fixture.homeClub)} size={22} rounded="soft" />
                    {clubName(fixture.homeClub)}
                  </span>
                  <span className="text-muted" style={{ fontSize: 13, flex: 'none' }}>vs</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                    <Avatar src={fixture.awayClub?.logoUrl} name={clubName(fixture.awayClub)} size={22} rounded="soft" />
                    {clubName(fixture.awayClub)}
                  </span>
                </div>
                <p className="card-meta">{fixture.venue?.name || ''}</p>
              </div>
            ))}
          </div>
        </section>

        {/* League Table */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontWeight: 400 }}>League Table</h2>
            <Link href="/standings" className="btn btn-ghost">Full table &rarr;</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Club</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {loading && <SkeletonRows rows={5} cols={9} />}
                {standings.slice(0, 5).map((row: any, index: number) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontFamily: 'var(--font-heading)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Avatar src={row.logoUrl} name={row.clubName || row.name} size={24} rounded="soft" />
                        {row.clubName || row.name}
                      </span>
                    </td>
                    <td>{row.played}</td>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{row.goalsFor}</td>
                    <td>{row.goalsAgainst}</td>
                    <td style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}>
                      {Number(row.won || 0) * 3 + Number(row.drawn || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Scorers */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontWeight: 400, marginBottom: 'var(--space-4)' }}>Top Scorers</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Club</th>
                  <th>Goals</th>
                </tr>
              </thead>
              <tbody>
                {loading && <SkeletonRows rows={5} cols={3} />}
                {topScorers.map((scorer: any, index: number) => (
                  <tr key={scorer.id || index}>
                    <td style={{ fontFamily: 'var(--font-heading)' }}>
                      {scorer.playerName || `${scorer.firstName || ''} ${scorer.lastName || ''}`.trim()}
                    </td>
                    <td>{scorer.clubName || scorer.club?.clubName}</td>
                    <td style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}>{scorer.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* More News */}
        <section>
          <h2 style={{ fontWeight: 400, marginBottom: 'var(--space-4)' }}>More News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
            {loading && <SkeletonCards count={3} />}
            {!loading && moreNews.length === 0 && <p className="text-muted">More stories will appear here soon.</p>}
            {moreNews.map((item: any) => (
              <div key={item.id} className="card elev-sm">
                <span className="card-kicker">{formatDate(item.startDate || item.createdAt)}</span>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-body">{item.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
