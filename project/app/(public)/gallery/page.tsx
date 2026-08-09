import Link from 'next/link';
import { getGallery, GALLERY_CATEGORIES } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Gallery | Kilifi North Sub County League',
  description: 'Photographs from matchdays, clubs, training and community events across the Kilifi North Sub County League.',
  path: '/gallery',
});

export default async function GalleryPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category || undefined;
  const images = await getGallery(category);

  const catHref = (c?: string) => (c ? `/gallery?category=${encodeURIComponent(c)}` : '/gallery');

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Gallery', href: '/gallery' }]} />
      <PageHeader eyebrow="Media" title="Gallery" lead="Moments from around the league." />

      <nav className="chip-row" aria-label="Gallery categories" style={{ marginBottom: 'var(--space-6)' }}>
        <Link href={catHref()} className="chip" aria-current={!category ? 'true' : undefined}>All</Link>
        {GALLERY_CATEGORIES.map((c) => (
          <Link key={c} href={catHref(c)} className="chip" aria-current={category === c ? 'true' : undefined}>{c}</Link>
        ))}
      </nav>

      {images.length === 0 ? (
        <EmptyState title="No photos in this category yet" hint="The league office publishes matchday photography here." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 'var(--space-3)' }}>
          {images.map((image) => (
            <figure key={image.id} style={{ margin: 0 }}>
              <img
                src={image.imageUrl}
                alt={image.title || image.caption || 'League photograph'}
                loading="lazy"
                className="media-4x3 plate"
              />
              {(image.title || image.caption) && (
                <figcaption>{image.title || image.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
