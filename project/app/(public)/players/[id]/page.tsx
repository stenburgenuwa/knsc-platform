import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { getPublicPlayer } from '@/lib/public-data';
import { buildMetadata, jsonLd, breadcrumbSchema, absoluteUrl } from '@/lib/seo';
import { Breadcrumbs, EmptyState, formatDate } from '@/components/public';

export const dynamic = 'force-dynamic';

const EVENT_LABEL: Record<string, string> = { GOAL: 'Goal', YELLOW_CARD: 'Yellow card', RED_CARD: 'Red card' };

export async function generateMetadata({ params }: { params: { id: string } }) {
  const player = await getPublicPlayer(params.id);
  if (!player) return buildMetadata({ title: 'Player not found', description: 'This player profile is unavailable.', path: `/players/${params.id}` });

  const name = `${player.firstName} ${player.lastName}`;
  return buildMetadata({
    title: `${name} | ${player.club.name}`,
    description: `${name} — ${player.position || 'player'} for ${player.club.name} in the Kilifi North Sub County League. Goals, cards and match history.`,
    path: `/players/${player.id}`,
    image: player.photoUrl,
    type: 'profile',
  });
}

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const player = await getPublicPlayer(params.id);
  if (!player) notFound();

  const name = `${player.firstName} ${player.lastName}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: absoluteUrl(`/players/${player.id}`),
    affiliation: { '@type': 'SportsTeam', name: player.club.name },
    ...(player.height ? { height: `${player.height} cm` } : {}),
  };

  return (
    <div className="page-shell-narrow">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([{ name: 'Home', href: '/' }, { name: 'Players', href: '/players' }, { name, href: `/players/${player.id}` }])
        )}
      />

      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Players', href: '/players' }, { name, href: `/players/${player.id}` }]} />

      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <Avatar src={player.photoUrl} name={name} size={96} />
        <div>
          <h1 style={{ fontWeight: 400, margin: 0 }}>
            {player.playerNumber != null && <span className="text-muted">{player.playerNumber} </span>}
            {name}
          </h1>
          <p className="text-muted" style={{ margin: 0 }}>
            <Link href={`/clubs/${player.club.id}`}>{player.club.name}</Link>
            {player.position ? ` · ${player.position}` : ''}
          </p>
          {player.registrationNumber && (
            <span className="tag tag-accent" style={{ marginTop: 6, display: 'inline-flex' }}>{player.registrationNumber}</span>
          )}
        </div>
      </header>

      <div className="stat-strip" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-cell"><span className="stat-value">{player.stats.matchesPlayed}</span><span className="stat-label">Matches</span></div>
        <div className="stat-cell"><span className="stat-value">{player.stats.goals}</span><span className="stat-label">Goals</span></div>
        <div className="stat-cell"><span className="stat-value">{player.stats.yellowCards}</span><span className="stat-label">Yellow cards</span></div>
        <div className="stat-cell"><span className="stat-value">{player.stats.redCards}</span><span className="stat-label">Red cards</span></div>
      </div>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <div className="section-head"><h2 style={{ fontSize: 22 }}>Profile</h2></div>
        <dl className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 'var(--space-3)' }}>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Date of birth</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{formatDate(player.dateOfBirth) || '—'}</dd>
          </div>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Age</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.age ?? '—'}</dd>
          </div>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Position</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.position || '—'}</dd>
          </div>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Height</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.height ? `${player.height} cm` : '—'}</dd>
          </div>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Weight</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.weight ? `${player.weight} kg` : '—'}</dd>
          </div>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>Preferred foot</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.preferredFoot || '—'}</dd>
          </div>
          <div>
            <dt className="card-meta" style={{ marginBottom: 2 }}>County</dt>
            <dd style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{player.county || '—'}</dd>
          </div>
        </dl>
      </section>

      <section>
        <div className="section-head"><h2 style={{ fontSize: 22 }}>Match History</h2></div>
        {player.matchHistory.length === 0 ? (
          <EmptyState title="No recorded appearances yet" hint="Match involvement appears once results are published." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {player.matchHistory.map((m: any, i: number) => (
              <Link
                key={m.fixtureId}
                href={`/matches/${m.fixtureId}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-2) 0',
                  borderBottom: i < player.matchHistory.length - 1 ? '1px solid var(--color-divider)' : 'none',
                  color: 'inherit', textDecoration: 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                  <Avatar src={m.opponentLogo} name={m.opponent} size={24} rounded="soft" />
                  <span>
                    <span style={{ fontFamily: 'var(--font-heading)' }}>
                      {m.home ? 'vs' : '@'} {m.opponent}
                    </span>
                    <span className="card-meta" style={{ margin: 0 }}>
                      {formatDate(m.fixtureDate, 'short')}
                      {m.events.length > 0 &&
                        ` · ${m.events.map((e: any) => `${EVENT_LABEL[e.type]}${e.minute ? ` ${e.minute}'` : ''}`).join(', ')}`}
                    </span>
                  </span>
                </span>
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {m.forScore ?? '-'}–{m.againstScore ?? '-'}
                </strong>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
