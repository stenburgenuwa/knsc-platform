import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { getMatchReport } from '@/lib/public-data';
import { buildMetadata, jsonLd, breadcrumbSchema, absoluteUrl } from '@/lib/seo';
import { Breadcrumbs, EmptyState, SectionHead, formatDate } from '@/components/public';

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
  const home = fixture.homeScore ?? 0;
  const away = fixture.awayScore ?? 0;

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
    <div>
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

      {/* The scoreboard is the page. It carries the result at a size that can
          be read at a glance, on the same dark ground as the masthead. */}
      <section className="bleed on-dark">
        <div className="bleed-inner" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
          <p className="eyebrow" style={{ textAlign: 'center' }}>
            {fixture.round || 'League'} · Full time · {formatDate(fixture.fixtureDate)}
          </p>

          <div className="match-hero" style={{ padding: 'var(--space-4) 0' }}>
            <Link href={`/clubs/${fixture.homeClub.id}`} className="match-hero-club" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Avatar src={fixture.homeClub.logoUrl} name={fixture.homeClub.name} size={64} rounded="soft" />
              <span>{fixture.homeClub.name}</span>
            </Link>

            <p className="match-hero-score" style={{ margin: 0 }}>
              {home}<span style={{ opacity: 0.4 }}>–</span>{away}
            </p>

            <Link href={`/clubs/${fixture.awayClub.id}`} className="match-hero-club" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Avatar src={fixture.awayClub.logoUrl} name={fixture.awayClub.name} size={64} rounded="soft" />
              <span>{fixture.awayClub.name}</span>
            </Link>
          </div>
        </div>

        {/* Match facts read as a band attached to the score, not as three cards. */}
        <div style={{ borderTop: '1px solid rgb(255 255 255 / 0.14)' }}>
          <div className="bleed-inner">
            <div className="stat-band" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="stat-cell">
                <span className="stat-label" style={{ margin: '0 0 6px' }}>Venue</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{fixture.venue?.name || 'TBC'}</span>
              </div>
              <div className="stat-cell">
                <span className="stat-label" style={{ margin: '0 0 6px' }}>Kickoff</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{fixture.kickoffTime || '—'}</span>
              </div>
              <div className="stat-cell">
                <span className="stat-label" style={{ margin: '0 0 6px' }}>Referee</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>
                  {fixture.refereeAssignment?.referee
                    ? `${fixture.refereeAssignment.referee.firstName} ${fixture.refereeAssignment.referee.lastName}`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell-narrow">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Results', href: '/results' }, { name: title, href: `/matches/${fixture.id}` }]} />

        <section style={{ marginBottom: 'var(--space-8)' }}>
          <SectionHead title="Match Events" />
          {events.length === 0 ? (
            <EmptyState title="No events recorded" hint="Goals and cards appear here when the referee logs them." />
          ) : (
            <ul className="timeline">
              {events.map((e) => {
                const isHome = e.player.clubId === fixture.homeClub.id;
                return (
                  <li key={e.id}>
                    <span className="minute">{e.minute ? `${e.minute}'` : '—'}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className={`tag ${e.type === 'GOAL' ? 'tag-accent' : e.type === 'RED_CARD' ? 'tag-danger' : 'tag-warning'}`} style={{ marginRight: 8 }}>
                        {EVENT_LABEL[e.type] || e.type}
                      </span>
                      <Link href={`/players/${e.player.id}`}>{e.player.firstName} {e.player.lastName}</Link>
                    </span>
                    <span className="text-muted" style={{ fontSize: 12, textAlign: 'right', flex: 'none' }}>
                      {isHome ? fixture.homeClub.name : fixture.awayClub.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {(homeSheet || awaySheet) && (
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <SectionHead title="Line-ups" />
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
              {[
                { club: fixture.homeClub, sheet: homeSheet },
                { club: fixture.awayClub, sheet: awaySheet },
              ].map(({ club, sheet }) => (
                <div key={club.id}>
                  <h3 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <Avatar src={club.logoUrl} name={club.name} size={26} rounded="soft" />
                    {club.name}
                  </h3>
                  {!sheet ? (
                    <p className="text-muted" style={{ fontSize: 13 }}>Line-up not published.</p>
                  ) : (
                    <>
                      <p className="eyebrow" style={{ marginBottom: 4 }}>Starting XI</p>
                      <ul style={{ listStyle: 'none', margin: '0 0 var(--space-4)', padding: 0, fontSize: 14 }}>
                        {sheet.entries.filter((e) => e.role === 'STARTER').map((e) => (
                          <li key={e.player.id} style={{ display: 'flex', gap: 'var(--space-3)', padding: '4px 0', borderBottom: '1px solid var(--color-divider)' }}>
                            <span className="num" style={{ minWidth: '2ch', color: 'var(--color-neutral-500)' }}>{e.player.playerNumber ?? '–'}</span>
                            <Link href={`/players/${e.player.id}`}>{e.player.firstName} {e.player.lastName}</Link>
                            {e.isCaptain && <span className="tag tag-accent-2">C</span>}
                          </li>
                        ))}
                      </ul>
                      <p className="eyebrow" style={{ marginBottom: 4 }}>Substitutes</p>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                        {sheet.entries.filter((e) => e.role === 'SUBSTITUTE').map((e) => (
                          <li key={e.player.id} style={{ display: 'flex', gap: 'var(--space-3)', padding: '4px 0', borderBottom: '1px solid var(--color-divider)' }}>
                            <span className="num" style={{ minWidth: '2ch', color: 'var(--color-neutral-500)' }}>{e.player.playerNumber ?? '–'}</span>
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
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <SectionHead title="Match Summary" />
            <p style={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>{fixture.reportNotes}</p>
          </section>
        )}

        {/* Every match ends by pointing back into the competition. */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-divider)' }}>
          <Link href="/results" className="btn btn-secondary">All results</Link>
          <Link href="/table" className="btn btn-secondary">League table</Link>
          <Link href={`/clubs/${fixture.homeClub.id}`} className="btn btn-ghost">{fixture.homeClub.name}</Link>
          <Link href={`/clubs/${fixture.awayClub.id}`} className="btn btn-ghost">{fixture.awayClub.name}</Link>
        </div>
      </div>
    </div>
  );
}
