import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { getLeagueStatistics } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, PageHeader, SectionHead } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Statistics | Kilifi North Sub County League',
  description: 'Top scorers, best attack and defence, and disciplinary records across the Kilifi North Sub County League.',
  path: '/statistics',
});

// One ranked-list pattern, used three times, instead of three inventions.
function RankedClubs({ rows, valueKey, caption }: { rows: any[]; valueKey: 'goalsFor' | 'goalsAgainst'; caption: string }) {
  if (rows.length === 0) return <EmptyState title="No data yet" />;
  return (
    <ol className="list-rule" style={{ margin: 0, padding: 0, listStyle: 'none' }} aria-label={caption}>
      {rows.map((row, i) => (
        <li key={row.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link href={`/clubs/${row.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'inherit', textDecoration: 'none', minWidth: 0 }}>
            <span className="num" style={{ color: 'var(--color-neutral-500)', minWidth: '1.5ch' }}>{i + 1}</span>
            <Avatar src={row.logoUrl} name={row.clubName} size={26} rounded="soft" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{row.clubName}</span>
          </Link>
          <span className="num" style={{ fontSize: 18 }}>{row[valueKey]}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function StatisticsPage() {
  const stats = await getLeagueStatistics();

  return (
    <div>
      <section className="bleed on-dark">
        <div className="bleed-inner" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
          <p className="eyebrow">Season Data</p>
          <h1 style={{ margin: 0 }}>Statistics</h1>
          <p className="text-muted" style={{ maxWidth: 560, marginTop: 'var(--space-3)', fontSize: 16 }}>
            Every number on this page is calculated live from published match results — nothing is entered by hand.
          </p>
        </div>
        <div style={{ borderTop: '1px solid rgb(255 255 255 / 0.14)' }}>
          <div className="bleed-inner">
            <div className="stat-band">
              <div className="stat-cell"><span className="stat-value">{stats.totals.clubs}</span><span className="stat-label">Clubs</span></div>
              <div className="stat-cell"><span className="stat-value">{stats.totals.players}</span><span className="stat-label">Players</span></div>
              <div className="stat-cell"><span className="stat-value">{stats.totals.matches}</span><span className="stat-label">Matches</span></div>
              <div className="stat-cell"><span className="stat-value">{stats.totals.goals}</span><span className="stat-label">Goals</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Statistics', href: '/statistics' }]} />

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <SectionHead title="Top Scorers" />
          <p className="text-muted" style={{ fontSize: 13, marginTop: 'calc(-1 * var(--space-2))', marginBottom: 'var(--space-4)' }}>
            <span className="num">{stats.averageGoals}</span> goals per match on average this season.
          </p>
          {stats.topScorers.length === 0 ? (
            <EmptyState title="No goals recorded yet" />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Top goalscorers</caption>
                <thead>
                  <tr>
                    <th scope="col" style={{ width: 48, textAlign: 'right' }}>#</th>
                    <th scope="col">Player</th>
                    <th scope="col">Club</th>
                    <th scope="col" style={{ width: 80, textAlign: 'right' }}>Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topScorers.map((p, i) => (
                    <tr key={p.id}>
                      <td className="num" style={{ textAlign: 'right', color: 'var(--color-neutral-500)' }}>{i + 1}</td>
                      <td>
                        <Link href={`/players/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}>
                          <Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={26} />
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{p.firstName} {p.lastName}</span>
                        </Link>
                      </td>
                      <td className="text-muted">{p.club?.name}</td>
                      <td className="num" style={{ textAlign: 'right', fontSize: 16 }}>{p.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
          <section>
            <SectionHead title="Best Attack" />
            <RankedClubs rows={stats.bestAttack} valueKey="goalsFor" caption="Clubs by goals scored" />
          </section>
          <section>
            <SectionHead title="Best Defence" />
            <RankedClubs rows={stats.bestDefence} valueKey="goalsAgainst" caption="Clubs by goals conceded" />
          </section>
        </div>

        <section>
          <SectionHead title="Disciplinary Record" />
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
                    <th scope="col" style={{ width: 80, textAlign: 'right' }}>Yellow</th>
                    <th scope="col" style={{ width: 70, textAlign: 'right' }}>Red</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.discipline.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/players/${p.id}`} style={{ color: 'inherit', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                          {p.firstName} {p.lastName}
                        </Link>
                      </td>
                      <td className="text-muted">{p.club?.name}</td>
                      <td className="num" style={{ textAlign: 'right' }}>{p.yellow}</td>
                      <td className="num" style={{ textAlign: 'right' }}>{p.red}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
