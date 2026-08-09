import Link from 'next/link';
import { getPublicPlayers, getPublicClubs, getPlayerPositions } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, PageHeader, PlayerCard } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Players | Kilifi North Sub County League',
  description: 'Every approved player registered in the Kilifi North Sub County League.',
  path: '/players',
});

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { page?: string; club?: string; position?: string; q?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const filters = {
    clubId: searchParams.club || undefined,
    position: searchParams.position || undefined,
    q: searchParams.q || undefined,
  };

  const [{ items, total, pages }, clubs, positions] = await Promise.all([
    getPublicPlayers(page, 24, filters),
    getPublicClubs(),
    getPlayerPositions(),
  ]);

  const buildHref = (next: number) => {
    const params = new URLSearchParams();
    Object.entries({ ...searchParams, page: String(next) }).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    return `/players?${params.toString()}`;
  };

  // Position chips keep the other active filters and reset paging.
  const positionHref = (position?: string) => {
    const params = new URLSearchParams();
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.club) params.set('club', searchParams.club);
    if (position) params.set('position', position);
    const query = params.toString();
    return query ? `/players?${query}` : '/players';
  };

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Players', href: '/players' }]} />
      <PageHeader eyebrow="Directory" title="Players" lead={`${total} approved ${total === 1 ? 'player' : 'players'} registered.`} />

      <form method="get" className="filter-bar" role="search" aria-label="Filter players">
        <div className="field">
          <label htmlFor="p-q">Search</label>
          <input id="p-q" name="q" type="search" className="input" defaultValue={searchParams.q || ''} placeholder="Player or club" />
        </div>
        <div className="field">
          <label htmlFor="p-club">Club</label>
          <select id="p-club" name="club" className="input" defaultValue={searchParams.club || ''}>
            <option value="">All clubs</option>
            {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {/* Keeps the chip-selected position when the form is submitted. */}
        {searchParams.position && <input type="hidden" name="position" value={searchParams.position} />}
        <button type="submit" className="btn btn-primary">Apply</button>
        <Link href="/players" className="btn btn-ghost">Reset</Link>
      </form>

      {/* Position is the filter people actually reach for, so it gets a row of
          one-click chips rather than being buried in a select. */}
      {positions.length > 0 && (
        <nav className="chip-row" aria-label="Filter by position" style={{ marginBottom: 'var(--space-6)' }}>
          <Link href={positionHref()} className="chip" aria-current={!searchParams.position ? 'true' : undefined}>
            All positions
          </Link>
          {positions.map((p) => (
            <Link key={p} href={positionHref(p)} className="chip" aria-current={searchParams.position === p ? 'true' : undefined}>
              {p}
            </Link>
          ))}
        </nav>
      )}

      {items.length === 0 ? (
        <EmptyState title="No players match those filters" hint="Try a different club or clear the search." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
          {items.map((player) => <PlayerCard key={player.id} player={player} />)}
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
