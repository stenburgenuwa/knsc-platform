import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { getPublicPlayer } from '@/lib/public-data';
import { buildMetadata, jsonLd, breadcrumbSchema, absoluteUrl } from '@/lib/seo';
import { Breadcrumbs, EmptyState, SectionHead, formatDate } from '@/components/public';

export const dynamic = 'force-dynamic';

const EVENT_LABEL: Record<string, string> = {
  GOAL: 'Goal',
  OWN_GOAL: 'Own goal',
  YELLOW_CARD: 'Yellow card',
  RED_CARD: 'Red card',
};

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

  // Age is derived on read, never stored — see calculateAge in lib/public-data.
  const facts = [
    { label: 'Date of birth', value: formatDate(player.dateOfBirth) },
    { label: 'Age', value: player.age != null ? String(player.age) : '' },
    { label: 'Position', value: player.position },
    { label: 'Height', value: player.height ? `${player.height} cm` : '' },
    { label: 'Weight', value: player.weight ? `${player.weight} kg` : '' },
    { label: 'Preferred foot', value: player.preferredFoot },
    { label: 'County', value: player.county },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([{ name: 'Home', href: '/' }, { name: 'Players', href: '/players' }, { name, href: `/players/${player.id}` }])
        )}
      />

      <section className="bleed on-dark">
        <div className="bleed-inner" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Avatar src={player.photoUrl} name={name} size={100} rounded="square" />
            <div style={{ minWidth: 0 }}>
              <p className="eyebrow" style={{ marginBottom: 4 }}>
                {[player.position, player.registrationNumber].filter(Boolean).join(' · ') || 'Registered player'}
              </p>
              {/* Availability is derived from cards, not stored by hand — a
                  suspended player is a fact of the match record. */}
              <p style={{ margin: '0 0 6px' }}>
                <span className={`tag ${player.suspension.suspended ? 'tag-accent-2' : 'tag-accent'}`}>
                  {player.suspension.label}
                </span>
              </p>
              <h1 style={{ margin: 0, display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {player.playerNumber != null && (
                  <span className="num" style={{ fontSize: '0.7em', color: 'var(--color-accent-2)' }}>{player.playerNumber}</span>
                )}
                {name}
              </h1>
              <p style={{ margin: '6px 0 0' }}>
                <Link href={`/clubs/${player.club.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Avatar src={player.club.logoUrl} name={player.club.name} size={22} rounded="soft" />
                  {player.club.name}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgb(255 255 255 / 0.14)' }}>
          <div className="bleed-inner">
            <div className="stat-band">
              <div className="stat-cell"><span className="stat-value">{player.stats.matchesPlayed}</span><span className="stat-label">Matches</span></div>
              <div className="stat-cell"><span className="stat-value">{player.stats.goals}</span><span className="stat-label">Goals</span></div>
              <div className="stat-cell"><span className="stat-value">{player.stats.yellowCards}</span><span className="stat-label">Yellow cards</span></div>
              <div className="stat-cell"><span className="stat-value">{player.stats.redCards}</span><span className="stat-label">Red cards</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell-narrow">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Players', href: '/players' }, { name, href: `/players/${player.id}` }]} />

        {player.suspension.suspended && player.suspension.active && (
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <SectionHead title="Suspension" />
            <p style={{ margin: 0, fontSize: 15 }}>
              <strong>{player.suspension.active.reason}</strong> — {player.suspension.active.matchesServed} of{' '}
              {player.suspension.active.matchesBanned}{' '}
              {player.suspension.active.matchesBanned === 1 ? 'match' : 'matches'} served.
            </p>
            <p className="text-muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
              The ban is served in {player.club.name} matches, not in days. {player.firstName} returns once the
              remaining {player.suspension.matchesRemaining === 1 ? 'match has' : 'matches have'} been played.
            </p>
          </section>
        )}

        <section style={{ marginBottom: 'var(--space-8)' }}>
          <SectionHead title="Profile" />
          <dl className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="stat-label">{f.label}</dt>
                <dd style={{ margin: '4px 0 0', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>{f.value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <SectionHead title="Match History" href="/results" linkLabel="All results" />
          {player.matchHistory.length === 0 ? (
            <EmptyState title="No recorded appearances yet" hint="Match involvement appears once results are published." />
          ) : (
            <div className="list-rule">
              {player.matchHistory.map((m: any) => (
                <Link
                  key={m.fixtureId}
                  href={`/matches/${m.fixtureId}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', color: 'inherit', textDecoration: 'none' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                    <Avatar src={m.opponentLogo} name={m.opponent} size={28} rounded="soft" />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                        <span className="text-muted" style={{ fontWeight: 500 }}>{m.home ? 'vs' : 'away to'}</span> {m.opponent}
                      </span>
                      <span className="story-meta">
                        {formatDate(m.fixtureDate, 'short')}
                        {m.events.length > 0 &&
                          ` · ${m.events.map((e: any) => `${EVENT_LABEL[e.type]}${e.minute ? ` ${e.minute}'` : ''}`).join(', ')}`}
                      </span>
                    </span>
                  </span>
                  <span className="match-row-score">
                    {m.forScore ?? '-'}<span aria-hidden="true"> – </span>{m.againstScore ?? '-'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
