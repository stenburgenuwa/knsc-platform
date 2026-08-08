import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { siteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const STATIC_PATHS = [
  { path: '/', priority: 1, changeFrequency: 'daily' as const },
  { path: '/fixtures', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/results', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/table', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/clubs', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/players', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/statistics', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/news', priority: 0.8, changeFrequency: 'daily' as const },
  { path: '/gallery', priority: 0.5, changeFrequency: 'weekly' as const },
  { path: '/sponsors', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/downloads', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.4, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.4, changeFrequency: 'monthly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${base}${p.path === '/' ? '' : p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  try {
    const [clubs, players, matches, news] = await Promise.all([
      prisma.club.findMany({ select: { id: true } }),
      prisma.player.findMany({ where: { approved: true }, select: { id: true } }),
      prisma.fixture.findMany({ where: { status: 'COMPLETED' }, select: { id: true, updatedAt: true } }),
      prisma.announcement.findMany({ where: { audience: null }, select: { id: true, slug: true, startDate: true } }),
    ]);

    for (const c of clubs) entries.push({ url: `${base}/clubs/${c.id}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
    for (const p of players) entries.push({ url: `${base}/players/${p.id}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 });
    for (const m of matches) entries.push({ url: `${base}/matches/${m.id}`, lastModified: m.updatedAt, changeFrequency: 'monthly', priority: 0.6 });
    for (const n of news) entries.push({ url: `${base}/news/${n.slug || n.id}`, lastModified: n.startDate, changeFrequency: 'monthly', priority: 0.7 });
  } catch {
    // A database hiccup shouldn't take the whole sitemap down — serve the
    // static routes rather than a 500.
  }

  return entries;
}
