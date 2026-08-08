import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { getLeagueStatistics } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Statistics | Kilifi North Sub County League',
  description: 'Top scorers, best attack and defence, and disciplinary records across the Kilifi North Sub County League.',
  path: '/statistics',
});

export default async function StatisticsPage() {
  const stats = await getLeagueStatistics();

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Statistics', href: '/statistics' }]} />
      <PageHeader eyebrow="Season Data" title="Statistics" lead="Every number is calculated live from published match results." />

      <div className="stat-strip" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-cell"><span className="stat-value">{stats.totals.clubs}</span><span className="stat-label">Clubs</span></div>
        <div className="stat-cell"><span className="stat-value">{stats.totals.players}</span><span className="stat-label">Players</span></div>
        <div className="stat-cell"><span className="stat-value">{stats.totals.matches}</span><span className="stat-label">Matches</span></div>
        <div className="stat-cell"><span className="stat-value">{stats.totals.goals}</span><span className="stat-label">Goals</span></div>
      </div>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <div className="section-head">
          <h2 style={{ fontSize: 24 }}>Top Scorers</h2>
          <span className="text-muted" style={{ fontSize: 13 }}>Avg {stats.averageGoals} goals per match</span>
        </div>
        {stats.topScorers.length === 0 ? (
          <EmptyState title="No goals recorded yet" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Top goalscorers</caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Player</th>
                  <th scope="col">Club</th>
                  <th scope="col">Goals</th>
                </tr>
              </thead>
              <tbody>
                {stats.topScorers.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>
                      <Link href={`/players/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}>
                        <Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={26} />
                        <span style={{ fontFamily: 'var(--font-heading)' }}>{p.firstName} {p.lastName}</span>
                      </Link>
                    </td>
                    <td>{p.club?.name}</td>
                    <td style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}>{p.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <section>
          <div className="section-head"><h2 style={{ fontSize: 22 }}>Best Attack</h2></div>
          {stats.bestAttack.length === 0 ? <EmptyState title="No data yet" /> : (
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {stats.bestAttack.map((row) => (
                <li key={row.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
                  <Link href={`/clubs/${row.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}>
                    <Avatar src={row.logoUrl} name={row.clubName} size={24} rounded="soft" />
                    <span style={{ fontFamily: 'var(--font-heading)' }}>{row.clubName}</span>
                  </Link>
                  <strong>{row.goalsFor}</strong>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <div className="section-head"><h2 style={{ fontSize: 22 }}>Best Defence</h2></div>
          {stats.bestDefence.length === 0 ? <EmptyState title="No data yet" /> : (
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {stats.bestDefence.map((row) => (
                <li key={row.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
                  <Link href={`/clubs/${row.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}>
                    <Avatar src={row.logoUrl} name={row.clubName} size={24} rounded="soft" />
                    <span style={{ fontFamily: 'var(--font-heading)' }}>{row.clubName}</span>
                  </Link>
                  <strong>{row.goalsAgainst}</strong>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section>
        <div className="section-head"><h2 style={{ fontSize: 22 }}>Disciplinary Record</h2></div>
        {stats.discipline.length === 0 ? (
          <EmptyState title="No cards issued yet" hint="A clean league so far." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Cards by player</caption>
              <thead>
                <tr>
                  <th scope="col">Player</th>
                  <th scope="col">Club</th>
                  <th scope="col">Yellow</th>
                  <th scope="col">Red</th>
                </tr>
              </thead>
              <tbody>
                {stats.discipline.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/players/${p.id}`} style={{ color: 'inherit', fontFamily: 'var(--font-heading)' }}>
                        {p.firstName} {p.lastName}
                      </Link>
                    </td>
                    <td>{p.club?.name}</td>
                    <td>{p.yellow}</td>
                    <td>{p.red}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
