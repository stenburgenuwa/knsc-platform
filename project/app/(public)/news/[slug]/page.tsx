import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsArticle } from '@/lib/public-data';
import { buildMetadata, jsonLd, breadcrumbSchema, absoluteUrl, SITE_NAME } from '@/lib/seo';
import { Breadcrumbs, NewsCard, formatDate } from '@/components/public';

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
      <h1 style={{ fontWeight: 400 }}>{article.title}</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
        <time dateTime={new Date(article.startDate).toISOString()}>{formatDate(article.startDate)}</time>
        {article.author && ` · ${article.author}`}
      </p>

      {article.featuredImageUrl && (
        <img src={article.featuredImageUrl} alt="" className="media-16x9 plate" style={{ marginBottom: 'var(--space-6)' }} />
      )}

      <div style={{ whiteSpace: 'pre-wrap', fontSize: 16, lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>
        {article.message}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
        <span className="text-muted" style={{ alignSelf: 'center', fontSize: 13 }}>Share:</span>
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
          <div className="section-head"><h2 style={{ fontSize: 22 }}>Related Stories</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
            {article.related.map((r) => <NewsCard key={r.id} article={r} />)}
          </div>
        </section>
      )}

      <Link href="/news" className="btn btn-ghost" style={{ marginTop: 'var(--space-6)' }}>&larr; All news</Link>
    </article>
  );
}
