import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Administrative areas and search-result permutations carry no public
      // content worth indexing.
      disallow: ['/dashboard', '/login', '/api/', '/search'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
