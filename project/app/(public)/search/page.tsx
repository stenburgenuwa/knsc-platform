import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { globalSearch } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, PageHeader, SectionHead } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = {
  ...buildMetadata({
    title: 'Search | Kilifi North Sub County League',
    description: 'Search players, clubs, fixtures, results, news and sponsors.',
    path: '/search',
  }),
  // Search result pages carry no unique content worth indexing.
  robots: { index: false, follow: true },
};

function ResultGroup({
  title,
  items,
  hrefFor,
}: {
  title: string;
  items: { id: string; name: string; subtitle: string; photoUrl?: string | null; logoUrl?: string | null }[];
  hrefFor: (item: any) => string;
}) {
  if (items.length === 0) return null;
  return (
    <section style={{ marginBottom: 'var(--space-6)' }}>
      <SectionHead title={`${title} (${items.length})`} />
      <ul className="list-rule" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={hrefFor(item)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'inherit', textDecoration: 'none' }}
            >
              {(item.photoUrl !== undefined || item.logoUrl !== undefined) && (
                <Avatar
                  src={item.photoUrl ?? item.logoUrl}
                  name={item.name}
                  size={34}
                  rounded={item.logoUrl !== undefined ? 'soft' : 'circle'}
                />
              )}
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{item.name}</span>
                <span className="story-meta">{item.subtitle}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || '').trim();
  const results = await globalSearch(q);

  return (
    <div className="page-shell-narrow">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Search', href: '/search' }]} />
      <PageHeader
        eyebrow="Search"
        title={q ? `Results for “${q}”` : 'Search'}
        lead={q ? `${results.total} ${results.total === 1 ? 'match' : 'matches'} across the site.` : 'Find players, clubs, fixtures, results, news and sponsors.'}
      />

      <form method="get" role="search" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <label htmlFor="search-q" className="sr-only">Search term</label>
        <input id="search-q" name="q" type="search" className="input" defaultValue={q} placeholder="Search players, clubs, news…" autoFocus />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {q.length > 0 && q.length < 2 && <EmptyState title="Enter at least two characters" />}

      {q.length >= 2 && results.total === 0 && (
        <EmptyState title={`Nothing found for “${q}”`} hint="Try a club name, a player's surname, or a registration number." />
      )}

      <ResultGroup title="Players" items={results.players} hrefFor={(i) => `/players/${i.id}`} />
      <ResultGroup title="Clubs" items={results.clubs} hrefFor={(i) => `/clubs/${i.id}`} />
      <ResultGroup
        title="Matches"
        items={results.fixtures}
        hrefFor={(i: any) => (i.upcoming ? '/fixtures' : `/matches/${i.id}`)}
      />
      <ResultGroup title="News" items={results.news} hrefFor={(i: any) => `/news/${i.slug || i.id}`} />
      <ResultGroup title="Sponsors" items={results.sponsors} hrefFor={() => '/sponsors'} />
    </div>
  );
}
