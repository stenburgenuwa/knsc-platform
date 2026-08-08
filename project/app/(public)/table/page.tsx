import { getStandings } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, LeagueTable, PageHeader } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'League Table | Kilifi North Sub County League',
  description: 'Live Kilifi North Sub County League standings — points, goal difference and recent form for every club.',
  path: '/table',
});

export default async function TablePage() {
  const rows = await getStandings();
  const played = rows.reduce((sum, r) => sum + r.played, 0) / 2;

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'League Table', href: '/table' }]} />
      <PageHeader
        eyebrow="Standings"
        title="League Table"
        lead="Calculated automatically from completed matches: three points for a win, one for a draw."
      />

      <LeagueTable rows={rows} />

      <p className="text-muted" style={{ marginTop: 'var(--space-4)', fontSize: 13 }}>
        {played > 0
          ? `Based on ${played} completed ${played === 1 ? 'match' : 'matches'}. Clubs level on points are separated by goal difference.`
          : 'The table updates as soon as the first results are published.'}
      </p>
    </div>
  );
}
