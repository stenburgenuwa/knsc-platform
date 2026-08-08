import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { getMatchReport } from '@/lib/public-data';
import { buildMetadata, jsonLd, breadcrumbSchema, absoluteUrl } from '@/lib/seo';
import { Breadcrumbs, EmptyState, formatDate } from '@/components/public';

export const dynamic = 'force-dynamic';

const EVENT_LABEL: Record<string, string> = {
  GOAL: 'Goal',
  YELLOW_CARD: 'Yellow card',
  RED_CARD: 'Red card',
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const fixture = await getMatchReport(params.id);
  if (!fixture) return buildMetadata({ title: 'Match not found', description: 'This match report is unavailable.', path: `/matches/${params.id}` });

  const title = `${fixture.homeClub.name} ${fixture.homeScore}–${fixture.awayScore} ${fixture.awayClub.name}`;
  return buildMetadata({
    title: `${title} | Match Report`,
    description: `Match report: ${title} at ${fixture.venue?.name || 'venue TBC'} on ${formatDate(fixture.fixtureDate)}.`,
    path: `/matches/${params.id}`,
    type: 'article',
  });
}

export default async function MatchReportPage({ params }: { params: { id: string } }) {
  const fixture = await getMatchReport(params.id);
  if (!fixture) notFound();

  const title = `${fixture.homeClub.name} vs ${fixture.awayClub.name}`;
  const events = fixture.matchEvents;
  const homeSheet = fixture.teamSheets.find((s) => s.clubId === fixture.homeClub.id);
  const awaySheet = fixture.teamSheets.find((s) => s.clubId === fixture.awayClub.id);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: title,
    startDate: new Date(fixture.fixtureDate).toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    location: fixture.venue?.name ? { '@type': 'Place', name: fixture.venue.name } : undefined,
    homeTeam: { '@type': 'SportsTeam', name: fixture.homeClub.name },
    awayTeam: { '@type': 'SportsTeam', name: fixture.awayClub.name },
    url: absoluteUrl(`/matches/${fixture.id}`),
  };

  return (
    <div className="page-shell-narrow">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: 'Home', href: '/' },
            { name: 'Results', href: '/results' },
            { name: title, href: `/matches/${fixture.id}` },
          ])
        )}
      />

      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Results', href: '/results' }, { name: title, href: `/matches/${fixture.id}` }]} />

      <p className="eyebrow">{fixture.round || 'League'} · Full time</p>

      <div
        style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-divider)', marginBottom: 'var(--space-4)',
        }}
      >
        <Link href={`/clubs/${fixture.homeClub.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}>
          <Avatar src={fixture.homeClub.logoUrl} name={fixture.homeClub.name} size={56} rounded="soft" />
          <span style={{ fontFamily: 'var(--font-heading)', textAlign: 'center' }}>{fixture.homeClub.name}</span>
        </Link>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 40, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
            {fixture.homeScore}<span className="text-muted" style={{ fontSize: 24 }}> – </span>{fixture.awayScore}
          </p>
          <p className="card-meta" style={{ justifyContent: 'center', margin: 0 }}>{formatDate(fixture.fixtureDate)}</p>
        </div>
        <Link href={`/clubs/${fixture.awayClub.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}>
          <Avatar src={fixture.awayClub.logoUrl} name={fixture.awayClub.name} size={56} rounded="soft" />
          <span style={{ fontFamily: 'var(--font-heading)', textAlign: 'center' }}>{fixture.awayClub.name}</span>
        </Link>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div>
          <dt className="card-meta" style={{ marginBottom: 2 }}>Venue</dt>
          <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{fixture.venue?.name || 'TBC'}</dd>
        </div>
        <div>
          <dt className="card-meta" style={{ marginBottom: 2 }}>Kickoff</dt>
          <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{fixture.kickoffTime || '—'}</dd>
        </div>
        <div>
          <dt className="card-meta" style={{ marginBottom: 2 }}>Referee</dt>
          <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
            {fixture.refereeAssignment?.referee
              ? `${fixture.refereeAssignment.referee.firstName} ${fixture.refereeAssignment.referee.lastName}`
              : '—'}
          </dd>
        </div>
      </dl>

      <section style={{ marginBottom: 'var(--space-6)' }}>
        <div className="section-head"><h2 style={{ fontSize: 22 }}>Match Events</h2></div>
        {events.length === 0 ? (
          <EmptyState title="No events recorded" hint="Goals and cards appear here when the referee logs them." />
        ) : (
          <ul className="timeline">
            {events.map((e) => (
              <li key={e.id}>
                <span className="minute">{e.minute ? `${e.minute}'` : '—'}</span>
                <span>
                  <strong>{EVENT_LABEL[e.type] || e.type}</strong>{' '}
                  <Link href={`/players/${e.player.id}`}>{e.player.firstName} {e.player.lastName}</Link>{' '}
                  <span className="text-muted">
                    ({e.player.clubId === fixture.homeClub.id ? fixture.homeClub.name : fixture.awayClub.name})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(homeSheet || awaySheet) && (
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <div className="section-head"><h2 style={{ fontSize: 22 }}>Line-ups</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
            {[
              { club: fixture.homeClub, sheet: homeSheet },
              { club: fixture.awayClub, sheet: awaySheet },
            ].map(({ club, sheet }) => (
              <div key={club.id} className="card">
                <h3 className="card-title">{club.name}</h3>
                {!sheet ? (
                  <p className="card-meta">Line-up not published.</p>
                ) : (
                  <>
                    <p className="eyebrow" style={{ marginBottom: 4 }}>Starting XI</p>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13 }}>
                      {sheet.entries.filter((e) => e.role === 'STARTER').map((e) => (
                        <li key={e.player.id} style={{ padding: '2px 0' }}>
                          {e.player.playerNumber ? `${e.player.playerNumber}. ` : ''}
                          <Link href={`/players/${e.player.id}`}>{e.player.firstName} {e.player.lastName}</Link>
                          {e.isCaptain && <span className="tag tag-accent-2" style={{ marginLeft: 6 }}>C</span>}
                        </li>
                      ))}
                    </ul>
                    <p className="eyebrow" style={{ margin: 'var(--space-2) 0 4px' }}>Substitutes</p>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13 }}>
                      {sheet.entries.filter((e) => e.role === 'SUBSTITUTE').map((e) => (
                        <li key={e.player.id} style={{ padding: '2px 0' }}>
                          {e.player.playerNumber ? `${e.player.playerNumber}. ` : ''}
                          <Link href={`/players/${e.player.id}`}>{e.player.firstName} {e.player.lastName}</Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {fixture.reportNotes && (
        <section>
          <div className="section-head"><h2 style={{ fontSize: 22 }}>Match Summary</h2></div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{fixture.reportNotes}</p>
        </section>
      )}

      <Link href="/results" className="btn btn-ghost" style={{ marginTop: 'var(--space-4)' }}>&larr; All results</Link>
    </div>
  );
}
