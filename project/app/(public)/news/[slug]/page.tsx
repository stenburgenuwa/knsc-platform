import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsArticle } from '@/lib/public-data';
import { buildMetadata, jsonLd, breadcrumbSchema, absoluteUrl, SITE_NAME } from '@/lib/seo';
import { Breadcrumbs, NewsCard, SectionHead, formatDate } from '@/components/public';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getNewsArticle(params.slug);
  if (!article) return buildMetadata({ title: 'Article not found', description: 'This article is unavailable.', path: `/news/${params.slug}` });

  return buildMetadata({
    title: `${article.title} | ${SITE_NAME}`,
    description: String(article.message).slice(0, 155),
    path: `/news/${article.slug || article.id}`,
    image: article.featuredImageUrl,
    type: 'article',
    publishedTime: new Date(article.startDate).toISOString(),
  });
}

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = await getNewsArticle(params.slug);
  if (!article) notFound();

  const url = absoluteUrl(`/news/${article.slug || article.id}`);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    datePublished: new Date(article.startDate).toISOString(),
    author: { '@type': article.author ? 'Person' : 'Organization', name: article.author || SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: url,
    ...(article.featuredImageUrl?.startsWith('http') ? { image: [article.featuredImageUrl] } : {}),
  };

  return (
    <article className="page-shell-narrow">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([{ name: 'Home', href: '/' }, { name: 'News', href: '/news' }, { name: article.title, href: `/news/${article.slug || article.id}` }])
        )}
      />

      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'News', href: '/news' }, { name: article.title, href: `/news/${article.slug || article.id}` }]} />

      <p className="eyebrow">{article.category || 'News'}</p>
      <h1 style={{ margin: 0 }}>{article.title}</h1>
      <p className="story-meta" style={{ margin: 'var(--space-3) 0 var(--space-6)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-divider)' }}>
        <time dateTime={new Date(article.startDate).toISOString()}>{formatDate(article.startDate)}</time>
        {article.author && <span>· {article.author}</span>}
      </p>

      {article.featuredImageUrl && (
        <img src={article.featuredImageUrl} alt="" className="media-16x9" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-md)' }} />
      )}

      {/* Body copy gets a measure and a lead paragraph — this is the one page
          on the site that is meant to be read rather than scanned. */}
      <div className="article-body">{article.message}</div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-8)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-divider)' }}>
        <span className="stat-label" style={{ display: 'inline', marginRight: 'var(--space-2)' }}>Share</span>
        <a
          className="btn btn-secondary"
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          X (Twitter)
        </a>
        <a
          className="btn btn-secondary"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <a
          className="btn btn-secondary"
          href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>

      {article.related.length > 0 && (
        <section>
          <SectionHead title="Related Stories" href="/news" linkLabel="Newsroom" />
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
            {article.related.map((r) => <NewsCard key={r.id} article={r} />)}
          </div>
        </section>
      )}

      <Link href="/news" className="btn btn-ghost" style={{ marginTop: 'var(--space-6)' }}>&larr; All news</Link>
    </article>
  );
}
