import Link from 'next/link';
import { getPublicFixtures, getPublicClubs, getVenues, getFixtureRounds } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, FixtureCard, PageHeader } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Fixtures | Kilifi North Sub County League',
  description: 'Upcoming Kilifi North Sub County League fixtures — kickoff times, venues and match officials.',
  path: '/fixtures',
});

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: { page?: string; club?: string; venue?: string; round?: string; from?: string; to?: string; q?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const filters = {
    clubId: searchParams.club || undefined,
    venueId: searchParams.venue || undefined,
    round: searchParams.round || undefined,
    from: searchParams.from || undefined,
    to: searchParams.to || undefined,
    q: searchParams.q || undefined,
  };

  const [{ items, total, pages }, clubs, venues, rounds] = await Promise.all([
    getPublicFixtures(page, 12, filters),
    getPublicClubs(),
    getVenues(),
    getFixtureRounds(),
  ]);

  const buildHref = (next: number) => {
    const params = new URLSearchParams();
    Object.entries({ ...searchParams, page: String(next) }).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    return `/fixtures?${params.toString()}`;
  };

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Fixtures', href: '/fixtures' }]} />
      <PageHeader
        eyebrow="Match Centre"
        title="Fixtures"
        lead={`${total} upcoming ${total === 1 ? 'match' : 'matches'} across the competition.`}
      />

      <form method="get" className="filter-bar" role="search" aria-label="Filter fixtures">
        <div className="field">
          <label htmlFor="f-q">Search</label>
          <input id="f-q" name="q" type="search" className="input" defaultValue={searchParams.q || ''} placeholder="Club or venue" />
        </div>
        <div className="field">
          <label htmlFor="f-club">Club</label>
          <select id="f-club" name="club" className="input" defaultValue={searchParams.club || ''}>
            <option value="">All clubs</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-venue">Venue</label>
          <select id="f-venue" name="venue" className="input" defaultValue={searchParams.venue || ''}>
            <option value="">All venues</option>
            {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        {rounds.length > 0 && (
          <div className="field">
            <label htmlFor="f-round">Round</label>
            <select id="f-round" name="round" className="input" defaultValue={searchParams.round || ''}>
              <option value="">All rounds</option>
              {rounds.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor="f-from">From</label>
          <input id="f-from" name="from" type="date" className="input" defaultValue={searchParams.from || ''} />
        </div>
        <div className="field">
          <label htmlFor="f-to">To</label>
          <input id="f-to" name="to" type="date" className="input" defaultValue={searchParams.to || ''} />
        </div>
        <button type="submit" className="btn btn-primary">Apply</button>
        <Link href="/fixtures" className="btn btn-ghost">Reset</Link>
      </form>

      {items.length === 0 ? (
        <EmptyState title="No fixtures match those filters" hint="Try widening the date range or clearing the club filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          {items.map((fixture) => <FixtureCard key={fixture.id} fixture={fixture as any} />)}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
          {page > 1 && <Link className="btn btn-secondary" href={buildHref(page - 1)}>&larr; Previous</Link>}
          <span className="text-muted" style={{ alignSelf: 'center' }}>Page {page} of {pages}</span>
          {page < pages && <Link className="btn btn-secondary" href={buildHref(page + 1)}>Next &rarr;</Link>}
        </nav>
      )}
    </div>
  );
}
