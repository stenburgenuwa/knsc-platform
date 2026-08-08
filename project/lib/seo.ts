import type { Metadata } from 'next';

export const SITE_NAME = 'Kilifi North Sub County League';
export const SITE_SHORT = 'KNSCL';

// Absolute URLs are required for Open Graph / canonical tags. Vercel exposes
// the deployment host as VERCEL_URL; NEXT_PUBLIC_SITE_URL overrides it once a
// custom domain is attached.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildMetadata(options: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
}): Metadata {
  const { title, description, path, image, type = 'website', publishedTime } = options;
  const url = absoluteUrl(path);
  // Data-URL images are valid in-page but meaningless to crawlers, so only
  // hosted URLs are offered as social preview images.
  const ogImage = image && image.startsWith('http') ? image : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: type === 'profile' ? 'profile' : type,
      ...(ogImage ? { images: [{ url: ogImage, alt: title }] } : {}),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

// JSON-LD helper — rendered via a <script type="application/ld+json"> tag.
export function jsonLd(data: Record<string, any>) {
  return { __html: JSON.stringify(data) };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: SITE_NAME,
    alternateName: SITE_SHORT,
    sport: 'Football',
    url: siteUrl(),
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}
