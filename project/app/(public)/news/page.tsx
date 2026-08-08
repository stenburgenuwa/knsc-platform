import Link from 'next/link';
import { getPublicNews, NEWS_CATEGORIES } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, NewsCard, PageHeader } from '@/components/public';

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

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'News', href: '/news' }]} />
      <PageHeader eyebrow="Newsroom" title="News" lead="Match reports, league announcements and club stories." />

      <nav aria-label="News categories" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <Link href={catHref()} className={`btn ${!category ? 'btn-primary' : 'btn-secondary'}`}>All</Link>
        {NEWS_CATEGORIES.map((c) => (
          <Link key={c} href={catHref(c)} className={`btn ${category === c ? 'btn-primary' : 'btn-secondary'}`}>{c}</Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState title="No stories published yet" hint="Check back soon for league news and announcements." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          {items.map((article) => <NewsCard key={article.id} article={article} />)}
        </div>
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
