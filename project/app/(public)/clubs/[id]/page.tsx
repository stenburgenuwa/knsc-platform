import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { getPublicClub } from '@/lib/public-data';
import { buildMetadata, jsonLd, breadcrumbSchema, absoluteUrl } from '@/lib/seo';
import { Breadcrumbs, EmptyState, FixtureCard, ResultCard, FormStrip, formatDate } from '@/components/public';

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
    numberOfEmployees: undefined,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([{ name: 'Home', href: '/' }, { name: 'Clubs', href: '/clubs' }, { name: club.name, href: `/clubs/${club.id}` }])
        )}
      />

      {club.bannerUrl && (
        <div className="hero-figure" style={{ borderRadius: 0, maxHeight: 240 }}>
          <img src={club.bannerUrl} alt="" style={{ maxHeight: 240 }} />
        </div>
      )}

      <div className="page-shell">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Clubs', href: '/clubs' }, { name: club.name, href: `/clubs/${club.id}` }]} />

        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Avatar src={club.logoUrl} name={club.name} size={80} rounded="soft" />
          <div>
            <h1 style={{ fontWeight: 400, margin: 0 }}>{club.name}</h1>
            <p className="text-muted" style={{ margin: 0 }}>
              {[club.homeVenue?.name, club.yearFounded ? `Founded ${club.yearFounded}` : null, club.colours]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          {club.standing && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <span className="stat-value" style={{ fontSize: 34 }}>{club.standing.position}</span>
              <span className="stat-label" style={{ display: 'block' }}>League position</span>
            </div>
          )}
        </header>

        {club.standing && (
          <div className="stat-strip" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-cell"><span className="stat-value">{club.standing.played}</span><span className="stat-label">Played</span></div>
            <div className="stat-cell"><span className="stat-value">{club.standing.points}</span><span className="stat-label">Points</span></div>
            <div className="stat-cell"><span className="stat-value">{club.standing.goalsFor}</span><span className="stat-label">Goals for</span></div>
            <div className="stat-cell">
              <span className="stat-value" style={{ fontSize: 20, paddingTop: 6, display: 'block' }}>
                <FormStrip form={club.standing.form} />
              </span>
              <span className="stat-label">Form</span>
            </div>
          </div>
        )}

        <dl className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Home ground</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{club.homeVenue?.name || 'TBC'}</dd>
          </div>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Manager</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
              {manager ? `${manager.firstName} ${manager.lastName}` : '—'}
            </dd>
          </div>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Contact</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
              {manager?.email ? <a href={`mailto:${manager.email}`}>{manager.email}</a> : '—'}
            </dd>
          </div>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Squad size</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{club.players.length}</dd>
          </div>
        </dl>

        {club.history && (
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div className="section-head"><h2 style={{ fontSize: 24 }}>Club History</h2></div>
            <p style={{ whiteSpace: 'pre-wrap', maxWidth: 720 }}>{club.history}</p>
          </section>
        )}

        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: 24 }}>Squad</h2>
            {club.topScorer && (
              <span className="text-muted" style={{ fontSize: 13 }}>
                Top scorer: {club.topScorer.firstName} {club.topScorer.lastName} ({club.topScorer.goals})
              </span>
            )}
          </div>
          {club.players.length === 0 ? (
            <EmptyState title="No approved players yet" hint="Players appear once the league approves their registration." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">{club.name} squad</caption>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Player</th>
                    <th scope="col">Position</th>
                    <th scope="col">Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {club.players.map((p) => (
                    <tr key={p.id}>
                      <td>{p.playerNumber ?? '—'}</td>
                      <td>
                        <Link href={`/players/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}>
                          <Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={26} />
                          <span style={{ fontFamily: 'var(--font-heading)' }}>{p.firstName} {p.lastName}</span>
                        </Link>
                      </td>
                      <td>{p.position || '—'}</td>
                      <td>{p.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
          <section>
            <div className="section-head"><h2 style={{ fontSize: 22 }}>Next Fixtures</h2></div>
            {club.fixtures.length === 0 ? (
              <EmptyState title="No upcoming fixtures" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {club.fixtures.map((f) => <FixtureCard key={f.id} fixture={f as any} />)}
              </div>
            )}
          </section>

          <section>
            <div className="section-head"><h2 style={{ fontSize: 22 }}>Recent Results</h2></div>
            {club.results.length === 0 ? (
              <EmptyState title="No results yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {club.results.map((f) => <ResultCard key={f.id} fixture={f as any} />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
