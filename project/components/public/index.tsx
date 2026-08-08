import Link from 'next/link';
import Avatar from '@/components/Avatar';

// Shared presentational building blocks for the public website. Server
// components by default — none of them hold state, so nothing here forces a
// client bundle.

export function formatDate(value?: Date | string | null, style: 'long' | 'short' = 'long') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  });
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="state-block">
      <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 17 }}>{title}</p>
      {hint && <p style={{ margin: 'var(--space-1) 0 0', fontSize: 13 }}>{hint}</p>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-3)' }}>
      <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', margin: 0, padding: 0, fontSize: 12 }}>
        {items.map((item, i) => (
          <li key={item.href} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {i < items.length - 1 ? (
              <>
                <Link href={item.href}>{item.name}</Link>
                <span aria-hidden="true" className="text-muted">/</span>
              </>
            ) : (
              <span className="text-muted" aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header style={{ marginBottom: 'var(--space-6)' }}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 style={{ fontWeight: 400, margin: 0 }}>{title}</h1>
      {lead && <p className="text-muted" style={{ maxWidth: 640, marginTop: 'var(--space-2)' }}>{lead}</p>}
      {children}
    </header>
  );
}

/* ── Match cards ─────────────────────────────────────────────────── */

interface FixtureLike {
  id: string;
  fixtureDate: Date | string;
  kickoffTime?: string | null;
  round?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeClub: { id: string; name: string; logoUrl?: string | null };
  awayClub: { id: string; name: string; logoUrl?: string | null };
  venue?: { name: string } | null;
  refereeAssignment?: { referee: { firstName: string; lastName: string } } | null;
}

export function FixtureCard({ fixture }: { fixture: FixtureLike }) {
  return (
    <article className="match-card">
      <div className="match-card-meta">
        <span>{fixture.round || 'League'}</span>
        <span>{formatDate(fixture.fixtureDate, 'short')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="match-team" style={{ marginBottom: 4 }}>
            <Avatar src={fixture.homeClub.logoUrl} name={fixture.homeClub.name} size={24} rounded="soft" />
            <span>{fixture.homeClub.name}</span>
          </div>
          <div className="match-team">
            <Avatar src={fixture.awayClub.logoUrl} name={fixture.awayClub.name} size={24} rounded="soft" />
            <span>{fixture.awayClub.name}</span>
          </div>
        </div>
        <div className="match-kickoff">{fixture.kickoffTime || 'TBC'}</div>
      </div>
      <p className="card-meta" style={{ marginTop: 'var(--space-2)', marginBottom: 0 }}>
        {fixture.venue?.name || 'Venue TBC'}
        {fixture.refereeAssignment?.referee &&
          ` · Referee: ${fixture.refereeAssignment.referee.firstName} ${fixture.refereeAssignment.referee.lastName}`}
      </p>
    </article>
  );
}

export function ResultCard({ fixture }: { fixture: FixtureLike }) {
  const homeWin = (fixture.homeScore ?? 0) > (fixture.awayScore ?? 0);
  const awayWin = (fixture.awayScore ?? 0) > (fixture.homeScore ?? 0);

  return (
    <Link href={`/matches/${fixture.id}`} className="match-card">
      <div className="match-card-meta">
        <span>Full time</span>
        <span>{formatDate(fixture.fixtureDate, 'short')}</span>
      </div>
      <div className="match-row">
        <span className="match-team" style={{ opacity: awayWin ? 0.65 : 1 }}>
          <Avatar src={fixture.homeClub.logoUrl} name={fixture.homeClub.name} size={24} rounded="soft" />
          <span>{fixture.homeClub.name}</span>
        </span>
        <span className="match-score">{fixture.homeScore ?? '-'}</span>
      </div>
      <div className="match-row">
        <span className="match-team" style={{ opacity: homeWin ? 0.65 : 1 }}>
          <Avatar src={fixture.awayClub.logoUrl} name={fixture.awayClub.name} size={24} rounded="soft" />
          <span>{fixture.awayClub.name}</span>
        </span>
        <span className="match-score">{fixture.awayScore ?? '-'}</span>
      </div>
      <p className="card-meta" style={{ marginTop: 'var(--space-2)', marginBottom: 0 }}>
        {fixture.venue?.name || 'Venue TBC'} · Match report &rarr;
      </p>
    </Link>
  );
}

/* ── Directory cards ─────────────────────────────────────────────── */

export function ClubCard({ club }: { club: any }) {
  return (
    <Link href={`/clubs/${club.id}`} className="card elev-sm" style={{ color: 'inherit', textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Avatar src={club.logoUrl} name={club.name} size={48} rounded="soft" />
        <div style={{ minWidth: 0 }}>
          <h3 className="card-title" style={{ margin: 0 }}>{club.name}</h3>
          {club.colours && <p className="card-meta" style={{ margin: 0 }}>{club.colours}</p>}
        </div>
      </div>
      <dl style={{ margin: 0, fontSize: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <dt className="text-muted">Home ground:</dt>
          <dd style={{ margin: 0 }}>{club.homeVenue?.name || 'TBC'}</dd>
        </div>
        {club.managers?.[0] && (
          <div style={{ display: 'flex', gap: 6 }}>
            <dt className="text-muted">Manager:</dt>
            <dd style={{ margin: 0 }}>{club.managers[0].firstName} {club.managers[0].lastName}</dd>
          </div>
        )}
        {club.yearFounded && (
          <div style={{ display: 'flex', gap: 6 }}>
            <dt className="text-muted">Founded:</dt>
            <dd style={{ margin: 0 }}>{club.yearFounded}</dd>
          </div>
        )}
        {typeof club._count?.players === 'number' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <dt className="text-muted">Squad:</dt>
            <dd style={{ margin: 0 }}>{club._count.players} players</dd>
          </div>
        )}
      </dl>
      <span className="btn btn-ghost" style={{ alignSelf: 'flex-start', padding: 0 }}>View club &rarr;</span>
    </Link>
  );
}

export function PlayerCard({ player }: { player: any }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="card elev-sm"
      style={{ color: 'inherit', textDecoration: 'none', textAlign: 'center', alignItems: 'center' }}
    >
      <Avatar src={player.photoUrl} name={`${player.firstName} ${player.lastName}`} size={80} />
      <h3 className="card-title" style={{ margin: 0 }}>{player.firstName} {player.lastName}</h3>
      <p className="card-meta" style={{ justifyContent: 'center', margin: 0 }}>
        {[player.club?.name, player.position].filter(Boolean).join(' · ')}
      </p>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {player.playerNumber != null && <span className="tag tag-neutral">#{player.playerNumber}</span>}
        {player.goals > 0 && <span className="tag tag-accent">{player.goals} {player.goals === 1 ? 'goal' : 'goals'}</span>}
      </div>
    </Link>
  );
}

export function NewsCard({ article }: { article: any }) {
  const href = `/news/${article.slug || article.id}`;
  return (
    <Link href={href} className="card elev-sm" style={{ color: 'inherit', textDecoration: 'none', padding: 0, overflow: 'hidden' }}>
      {article.featuredImageUrl ? (
        <img src={article.featuredImageUrl} alt="" className="media-16x9" loading="lazy" />
      ) : (
        <div className="media-16x9" aria-hidden="true" />
      )}
      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <p className="eyebrow" style={{ margin: 0 }}>{article.category || 'News'}</p>
        <h3 className="card-title" style={{ margin: 0 }}>{article.title}</h3>
        <p className="card-body" style={{ margin: 0 }}>
          {String(article.message || '').slice(0, 140)}
          {String(article.message || '').length > 140 ? '…' : ''}
        </p>
        <p className="card-meta" style={{ margin: 0 }}>{formatDate(article.startDate)}</p>
      </div>
    </Link>
  );
}

export function SponsorCard({ sponsor }: { sponsor: any }) {
  const inner = (
    <>
      {sponsor.logoUrl ? (
        <img
          src={sponsor.logoUrl}
          alt={sponsor.name}
          loading="lazy"
          style={{ maxHeight: 64, maxWidth: '100%', objectFit: 'contain', margin: '0 auto' }}
        />
      ) : (
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>{sponsor.name}</span>
      )}
      <p className="card-meta" style={{ justifyContent: 'center', margin: 0 }}>{sponsor.category || 'Partner'}</p>
    </>
  );

  const style: React.CSSProperties = {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'inherit',
    textDecoration: 'none',
    minHeight: 120,
  };

  return sponsor.websiteUrl ? (
    <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer sponsored" className="card elev-sm" style={style}>
      {inner}
    </a>
  ) : (
    <div className="card elev-sm" style={style}>{inner}</div>
  );
}

/* ── Standings ───────────────────────────────────────────────────── */

export function FormStrip({ form }: { form: ('W' | 'D' | 'L')[] }) {
  if (!form?.length) return <span className="text-muted">—</span>;
  const label = form.map((f) => (f === 'W' ? 'win' : f === 'D' ? 'draw' : 'loss')).join(', ');
  return (
    <span className="form-strip" aria-label={`Recent form: ${label}`}>
      {form.map((f, i) => (
        <span key={i} className={`form-badge form-${f.toLowerCase()}`} aria-hidden="true">{f}</span>
      ))}
    </span>
  );
}

export function LeagueTable({ rows, compact = false }: { rows: any[]; compact?: boolean }) {
  if (!rows.length) {
    return <EmptyState title="The table opens once results are in" hint="Standings are calculated from completed matches." />;
  }

  return (
    <div className="table-wrap">
      <table className="table table-standings">
        <caption className="sr-only">League standings</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col" className="col-club">Club</th>
            <th scope="col">P</th>
            <th scope="col" className="col-optional">W</th>
            <th scope="col" className="col-optional">D</th>
            <th scope="col" className="col-optional">L</th>
            <th scope="col" className="col-optional">GF</th>
            <th scope="col" className="col-optional">GA</th>
            <th scope="col">GD</th>
            <th scope="col">Pts</th>
            {!compact && <th scope="col" className="col-optional">Form</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={row.position === 1 ? 'is-leader' : undefined}>
              <td>{row.position}</td>
              <td className="col-club">
                <Link
                  href={`/clubs/${row.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}
                >
                  <Avatar src={row.logoUrl} name={row.clubName} size={22} rounded="soft" />
                  <span style={{ fontFamily: 'var(--font-heading)' }}>{row.clubName}</span>
                </Link>
              </td>
              <td>{row.played}</td>
              <td className="col-optional">{row.won}</td>
              <td className="col-optional">{row.drawn}</td>
              <td className="col-optional">{row.lost}</td>
              <td className="col-optional">{row.goalsFor}</td>
              <td className="col-optional">{row.goalsAgainst}</td>
              <td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              <td style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}>{row.points}</td>
              {!compact && <td className="col-optional"><FormStrip form={row.form} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
