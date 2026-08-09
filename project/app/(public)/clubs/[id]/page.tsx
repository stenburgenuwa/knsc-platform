import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { getPublicClub } from '@/lib/public-data';
import { buildMetadata, jsonLd, breadcrumbSchema, absoluteUrl } from '@/lib/seo';
import { Breadcrumbs, EmptyState, MatchdayList, FormStrip, SectionHead } from '@/components/public';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const club = await getPublicClub(params.id);
  if (!club) return buildMetadata({ title: 'Club not found', description: 'This club is unavailable.', path: `/clubs/${params.id}` });

  return buildMetadata({
    title: `${club.name} | Kilifi North Sub County League`,
    description:
      club.history?.slice(0, 155) ||
      `${club.name} — squad, fixtures, results and league position in the Kilifi North Sub County League.`,
    path: `/clubs/${club.id}`,
    image: club.logoUrl,
  });
}

export default async function ClubProfilePage({ params }: { params: { id: string } }) {
  const club = await getPublicClub(params.id);
  if (!club) notFound();

  const manager = club.managers?.[0];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: club.name,
    sport: 'Football',
    url: absoluteUrl(`/clubs/${club.id}`),
    ...(club.yearFounded ? { foundingDate: String(club.yearFounded) } : {}),
    ...(club.homeVenue?.name ? { location: { '@type': 'Place', name: club.homeVenue.name } } : {}),
  };

  // Squad reads better grouped by line than as one alphabetical run — it is
  // how a team sheet is written and how a fan pictures the side.
  const LINES = ['Goalkeeper', 'Defender', 'Midfielder', 'Winger', 'Forward'];
  const byLine = LINES.map((line) => ({ line, players: club.players.filter((p) => p.position === line) }))
    .filter((g) => g.players.length > 0);
  const unlisted = club.players.filter((p) => !p.position || !LINES.includes(p.position));
  if (unlisted.length) byLine.push({ line: 'Other', players: unlisted });

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([{ name: 'Home', href: '/' }, { name: 'Clubs', href: '/clubs' }, { name: club.name, href: `/clubs/${club.id}` }])
        )}
      />

      {/* Club identity on the dark ground, with the banner as a ground rather
          than a decorative strip floating above the page. */}
      <section
        className="bleed on-dark"
        style={
          club.bannerUrl
            ? { backgroundImage: `linear-gradient(rgb(12 22 19 / 0.86), rgb(12 22 19 / 0.94)), url(${club.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        <div className="bleed-inner" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Avatar src={club.logoUrl} name={club.name} size={84} rounded="soft" />
            <div style={{ minWidth: 0 }}>
              <p className="eyebrow" style={{ marginBottom: 4 }}>Kilifi North Sub County League</p>
              <h1 style={{ margin: 0 }}>{club.name}</h1>
              <p className="text-muted" style={{ margin: '6px 0 0' }}>
                {[club.homeVenue?.name, club.yearFounded ? `Founded ${club.yearFounded}` : null, club.colours].filter(Boolean).join(' · ')}
              </p>
            </div>
            {club.standing && (
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <span className="stat-value">{club.standing.position}</span>
                <span className="stat-label">League position</span>
              </div>
            )}
          </div>
        </div>

        {club.standing && (
          <div style={{ borderTop: '1px solid rgb(255 255 255 / 0.14)' }}>
            <div className="bleed-inner">
              <div className="stat-band">
                <div className="stat-cell"><span className="stat-value">{club.standing.played}</span><span className="stat-label">Played</span></div>
                <div className="stat-cell"><span className="stat-value">{club.standing.points}</span><span className="stat-label">Points</span></div>
                <div className="stat-cell"><span className="stat-value">{club.standing.goalsFor}</span><span className="stat-label">Goals for</span></div>
                <div className="stat-cell">
                  <span style={{ display: 'block', paddingTop: 6 }}><FormStrip form={club.standing.form} /></span>
                  <span className="stat-label">Recent form</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="page-shell">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Clubs', href: '/clubs' }, { name: club.name, href: `/clubs/${club.id}` }]} />

        <dl className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-divider)' }}>
          <div>
            <dt className="stat-label">Home ground</dt>
            <dd style={{ margin: '4px 0 0', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{club.homeVenue?.name || 'TBC'}</dd>
          </div>
          <div>
            <dt className="stat-label">Manager</dt>
            <dd style={{ margin: '4px 0 0', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
              {manager ? `${manager.firstName} ${manager.lastName}` : '—'}
            </dd>
          </div>
          <div>
            <dt className="stat-label">Contact</dt>
            <dd style={{ margin: '4px 0 0', fontFamily: 'var(--font-heading)', fontWeight: 600, wordBreak: 'break-word' }}>
              {manager?.email ? <a href={`mailto:${manager.email}`}>{manager.email}</a> : '—'}
            </dd>
          </div>
          <div>
            <dt className="stat-label">Squad size</dt>
            <dd style={{ margin: '4px 0 0' }}><span className="num" style={{ fontSize: 18 }}>{club.players.length}</span></dd>
          </div>
        </dl>

        {club.history && (
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <SectionHead title="Club History" />
            <p style={{ whiteSpace: 'pre-wrap', maxWidth: 660, fontSize: 16 }}>{club.history}</p>
          </section>
        )}

        <section style={{ marginBottom: 'var(--space-8)' }}>
          <SectionHead title="Squad" />
          {club.topScorer && (
            <p className="text-muted" style={{ fontSize: 13, marginTop: 'calc(-1 * var(--space-2))', marginBottom: 'var(--space-4)' }}>
              Leading scorer: <Link href={`/players/${club.topScorer.id}`}>{club.topScorer.firstName} {club.topScorer.lastName}</Link>{' '}
              <span className="num">{club.topScorer.goals}</span> {club.topScorer.goals === 1 ? 'goal' : 'goals'}
            </p>
          )}
          {club.players.length === 0 ? (
            <EmptyState title="No approved players yet" hint="Players appear once the league approves their registration." />
          ) : (
            byLine.map((group) => (
              <div key={group.line} style={{ marginBottom: 'var(--space-6)' }}>
                <p className="eyebrow">{group.line}</p>
                <div className="table-wrap">
                  <table className="table">
                    <caption className="sr-only">{club.name} — {group.line}</caption>
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: 48, textAlign: 'right' }}>#</th>
                        <th scope="col">Player</th>
                        <th scope="col" style={{ width: 90, textAlign: 'right' }}>Goals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.players.map((p) => (
                        <tr key={p.id}>
                          <td className="num" style={{ textAlign: 'right', color: 'var(--color-neutral-500)' }}>{p.playerNumber ?? '–'}</td>
                          <td>
                            <Link href={`/players/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}>
                              <Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={26} />
                              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{p.firstName} {p.lastName}</span>
                            </Link>
                          </td>
                          <td className="num" style={{ textAlign: 'right' }}>{p.goals}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-8)' }}>
          <section>
            <SectionHead title="Next Fixtures" href="/fixtures" linkLabel="All" />
            {club.fixtures.length === 0 ? (
              <EmptyState title="No upcoming fixtures" />
            ) : (
              <MatchdayList fixtures={club.fixtures as any} compact />
            )}
          </section>

          <section>
            <SectionHead title="Recent Results" href="/results" linkLabel="All" />
            {club.results.length === 0 ? (
              <EmptyState title="No results yet" />
            ) : (
              <MatchdayList fixtures={club.results as any} played compact />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
