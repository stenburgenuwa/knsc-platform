import Link from 'next/link';
import { getPublicNews, NEWS_CATEGORIES } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, NewsCard, PageHeader, formatDate } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'News | Kilifi North Sub County League',
  description: 'Latest news, announcements and stories from the Kilifi North Sub County League.',
  path: '/news',
});

export default async function NewsPage({ searchParams }: { searchParams: { page?: string; category?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const category = searchParams.category || undefined;
  const { items, pages } = await getPublicNews(page, 9, category);

  const catHref = (c?: string) => (c ? `/news?category=${encodeURIComponent(c)}` : '/news');
  const [leadStory, ...rest] = items;

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'News', href: '/news' }]} />
      <PageHeader eyebrow="Newsroom" title="News" lead="Match reports, league announcements and club stories." />

      <nav className="chip-row" aria-label="News categories" style={{ marginBottom: 'var(--space-6)' }}>
        <Link href={catHref()} className="chip" aria-current={!category ? 'true' : undefined}>All</Link>
        {NEWS_CATEGORIES.map((c) => (
          <Link key={c} href={catHref(c)} className="chip" aria-current={category === c ? 'true' : undefined}>{c}</Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState title="No stories published yet" hint="Check back soon for league news and announcements." />
      ) : (
        <>
          {/* The newest story leads; the rest follow in a denser grid, so the
              page has a front page rather than nine equal tiles. */}
          <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            <div className="lg:col-span-7">
              <NewsCard article={leadStory} lead />
            </div>
            {rest.slice(0, 4).length > 0 && (
              <div className="lg:col-span-5 list-rule">
                {rest.slice(0, 4).map((article) => (
                  <Link key={article.id} href={`/news/${article.slug || article.id}`} className="story">
                    <p className="eyebrow" style={{ margin: 0 }}>{article.category || 'League News'}</p>
                    <h3 className="story-title" style={{ fontSize: 17, margin: '4px 0' }}>{article.title}</h3>
                    <p className="story-meta">{formatDate(article.startDate)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {rest.length > 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-6)' }}>
              {rest.slice(4).map((article) => <NewsCard key={article.id} article={article} />)}
            </div>
          )}
        </>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
          {page > 1 && (
            <Link className="btn btn-secondary" href={`/news?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}>
              &larr; Previous
            </Link>
          )}
          <span className="text-muted" style={{ alignSelf: 'center' }}>Page {page} of {pages}</span>
          {page < pages && (
            <Link className="btn btn-secondary" href={`/news?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}>
              Next &rarr;
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
