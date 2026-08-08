import { getPublicClubs } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, ClubCard, EmptyState, PageHeader } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Clubs | Kilifi North Sub County League',
  description: 'Every club competing in the Kilifi North Sub County League — home grounds, managers and squads.',
  path: '/clubs',
});

export default async function ClubsPage() {
  const clubs = await getPublicClubs();

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Clubs', href: '/clubs' }]} />
      <PageHeader eyebrow="Directory" title="Clubs" lead={`${clubs.length} clubs compete in the league this season.`} />

      {clubs.length === 0 ? (
        <EmptyState title="No clubs registered yet" hint="Clubs appear here once the league office registers them." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          {clubs.map((club) => <ClubCard key={club.id} club={club} />)}
        </div>
      )}
    </div>
  );
}
