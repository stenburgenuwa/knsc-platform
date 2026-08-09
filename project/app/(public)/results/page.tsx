import Link from 'next/link';
import { getPublicResults, getPublicClubs } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, MatchdayList, PageHeader } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Results | Kilifi North Sub County League',
  description: 'Final scores, goalscorers and match reports from the Kilifi North Sub County League.',
  path: '/results',
});

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { page?: string; club?: string; from?: string; to?: string; q?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const filters = {
    clubId: searchParams.club || undefined,
    from: searchParams.from || undefined,
    to: searchParams.to || undefined,
    q: searchParams.q || undefined,
  };

  const [{ items, total, pages }, clubs] = await Promise.all([getPublicResults(page, 12, filters), getPublicClubs()]);

  const buildHref = (next: number) => {
    const params = new URLSearchParams();
    Object.entries({ ...searchParams, page: String(next) }).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    return `/results?${params.toString()}`;
  };

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Results', href: '/results' }]} />
      <PageHeader eyebrow="Match Centre" title="Results" lead={`${total} completed ${total === 1 ? 'match' : 'matches'}.`} />

      <form method="get" className="filter-bar" role="search" aria-label="Filter results">
        <div className="field">
          <label htmlFor="r-q">Search</label>
          <input id="r-q" name="q" type="search" className="input" defaultValue={searchParams.q || ''} placeholder="Club or venue" />
        </div>
        <div className="field">
          <label htmlFor="r-club">Club</label>
          <select id="r-club" name="club" className="input" defaultValue={searchParams.club || ''}>
            <option value="">All clubs</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="r-from">From</label>
          <input id="r-from" name="from" type="date" className="input" defaultValue={searchParams.from || ''} />
        </div>
        <div className="field">
          <label htmlFor="r-to">To</label>
          <input id="r-to" name="to" type="date" className="input" defaultValue={searchParams.to || ''} />
        </div>
        <button type="submit" className="btn btn-primary">Apply</button>
        <Link href="/results" className="btn btn-ghost">Reset</Link>
      </form>

      {items.length === 0 ? (
        <EmptyState title="No results yet" hint="Results appear here once referees submit their match reports." />
      ) : (
        <MatchdayList fixtures={items as any} played />
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
