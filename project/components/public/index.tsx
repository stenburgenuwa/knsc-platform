import Link from 'next/link';
import Avatar from '@/components/Avatar';

// Presentational building blocks for the public site. All server components —
// none hold state, so none force a client bundle.

export function formatDate(value?: Date | string | null, style: 'long' | 'short' | 'day' = 'long') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  if (style === 'day') return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  });
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="state-block">
      <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, color: 'var(--color-text)' }}>{title}</p>
      {hint && <p style={{ margin: '6px 0 0', fontSize: 13 }}>{hint}</p>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-4)' }}>
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

export function PageHeader({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <header style={{ marginBottom: 'var(--space-6)' }}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 style={{ margin: 0 }}>{title}</h1>
      {lead && <p className="text-muted" style={{ maxWidth: 620, marginTop: 'var(--space-3)', fontSize: 16 }}>{lead}</p>}
      {children}
    </header>
  );
}

export function SectionHead({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {href && <Link href={href} className="btn btn-ghost">{linkLabel || 'View all'} &rarr;</Link>}
    </div>
  );
}

/* ── Match components ────────────────────────────────────────────── */

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

function ClubLine({ club, score, beaten, time }: { club: { name: string; logoUrl?: string | null }; score?: number | null; beaten?: boolean; time?: string }) {
  return (
    <div className={`match-side${beaten ? ' is-beaten' : ''}`}>
      <span className="match-club">
        <Avatar src={club.logoUrl} name={club.name} size={26} rounded="soft" />
        <span>{club.name}</span>
      </span>
      {time !== undefined ? <span className="match-time">{time}</span> : <span className="match-score">{score ?? '–'}</span>}
    </div>
  );
}

// Upcoming match. Links through to the club pages' context via the fixtures
// list; the whole card is a target so it behaves like the result card.
export function FixtureCard({ fixture }: { fixture: FixtureLike }) {
  return (
    <article className="match">
      <div className="match-head">
        <span>{fixture.round || 'League'}</span>
        <span>{formatDate(fixture.fixtureDate, 'day')}</span>
      </div>
      <ClubLine club={fixture.homeClub} time={fixture.kickoffTime || 'TBC'} />
      <ClubLine club={fixture.awayClub} time=" " />
      <div className="match-foot">
        <span>{fixture.venue?.name || 'Venue TBC'}</span>
        {fixture.refereeAssignment?.referee && (
          <span>Ref: {fixture.refereeAssignment.referee.firstName} {fixture.refereeAssignment.referee.lastName}</span>
        )}
      </div>
    </article>
  );
}

export function ResultCard({ fixture }: { fixture: FixtureLike }) {
  const home = fixture.homeScore ?? 0;
  const away = fixture.awayScore ?? 0;

  return (
    <Link href={`/matches/${fixture.id}`} className="match">
      <div className="match-head">
        <span>Full time</span>
        <span>{formatDate(fixture.fixtureDate, 'day')}</span>
      </div>
      <ClubLine club={fixture.homeClub} score={fixture.homeScore} beaten={home < away} />
      <ClubLine club={fixture.awayClub} score={fixture.awayScore} beaten={away < home} />
      <div className="match-foot">
        <span>{fixture.venue?.name || 'Venue TBC'}</span>
        <span className="match-cta">Match report &rarr;</span>
      </div>
    </Link>
  );
}

// The single next match, given room to breathe at the top of the homepage.
export function NextMatchBoard({ fixture }: { fixture: FixtureLike }) {
  return (
    <div>
      <div className="match-hero">
        <Link href={`/clubs/${fixture.homeClub.id}`} className="match-hero-club" style={{ color: 'inherit', textDecoration: 'none' }}>
          <Avatar src={fixture.homeClub.logoUrl} name={fixture.homeClub.name} size={56} rounded="soft" />
          <span>{fixture.homeClub.name}</span>
        </Link>
        <div className="match-hero-mid">
          <span className="match-hero-score">{fixture.kickoffTime || 'TBC'}</span>
          <p className="text-muted" style={{ margin: '6px 0 0', fontSize: 13 }}>{formatDate(fixture.fixtureDate)}</p>
        </div>
        <Link href={`/clubs/${fixture.awayClub.id}`} className="match-hero-club" style={{ color: 'inherit', textDecoration: 'none' }}>
          <Avatar src={fixture.awayClub.logoUrl} name={fixture.awayClub.name} size={56} rounded="soft" />
          <span>{fixture.awayClub.name}</span>
        </Link>
      </div>
      <p className="text-muted" style={{ textAlign: 'center', margin: 0, fontSize: 13 }}>
        {fixture.venue?.name || 'Venue to be confirmed'}
        {fixture.round ? ` · ${fixture.round}` : ''}
      </p>
    </div>
  );
}

/* ── Matchday list ───────────────────────────────────────────────────
   Used on /fixtures and /results, where a card grid buries the one thing
   the page exists to show. Rows keep the scores in a single column. */

// Goals are attributed by the scorer's club, which is what the API exposes.
function scorers(goals: any[], homeClubId: string, wantHome: boolean) {
  return goals
    .filter((g) => (g.player?.clubId === homeClubId) === wantHome)
    .map((g) => `${g.player.lastName}${g.minute ? ` ${g.minute}'` : ''}`)
    .join(', ');
}

export function MatchRow({ fixture, played = false }: { fixture: FixtureLike & { matchEvents?: any[] }; played?: boolean }) {
  const home = fixture.homeScore ?? 0;
  const away = fixture.awayScore ?? 0;
  const goals = (fixture.matchEvents || []).filter((e) => e.type === 'GOAL');

  const line = (
    <>
      {/* Column one: the fixture and its scorers. Column two: where and who. */}
      <div>
      <div className="match-row-line">
        <span className={`match-row-side is-home${played && home < away ? ' is-beaten' : ''}`}>
          <span className="match-row-club">{fixture.homeClub.name}</span>
          <Avatar src={fixture.homeClub.logoUrl} name={fixture.homeClub.name} size={24} rounded="soft" />
        </span>

        <span className="match-row-mid">
          {played ? (
            <span className="match-row-score">{home}<span aria-hidden="true"> – </span><span className="sr-only"> versus </span>{away}</span>
          ) : (
            <span className="match-row-kickoff">{fixture.kickoffTime || 'TBC'}</span>
          )}
        </span>

        <span className={`match-row-side${played && away < home ? ' is-beaten' : ''}`}>
          <Avatar src={fixture.awayClub.logoUrl} name={fixture.awayClub.name} size={24} rounded="soft" />
          <span className="match-row-club">{fixture.awayClub.name}</span>
        </span>
      </div>

        {/* Scorers sit under the score they explain, mirrored around it. */}
        {goals.length > 0 && (
          <div className="match-row-scorers">
            <span className="is-home">{scorers(goals, fixture.homeClub.id, true)}</span>
            <span>{scorers(goals, fixture.homeClub.id, false)}</span>
          </div>
        )}
      </div>

      <p className="match-row-meta">
        <span>{fixture.venue?.name || 'Venue TBC'}</span>
        {fixture.round && <span>{fixture.round}</span>}
        {!played && fixture.refereeAssignment?.referee && (
          <span>Ref: {fixture.refereeAssignment.referee.firstName} {fixture.refereeAssignment.referee.lastName}</span>
        )}
        {played && <span className="match-cta">Match report &rarr;</span>}
      </p>
    </>
  );

  return played ? (
    <Link href={`/matches/${fixture.id}`} className="match-row">{line}</Link>
  ) : (
    <div className="match-row">{line}</div>
  );
}

// Groups matches under the day they are played. Keeps the reading order
// chronological instead of forcing the fan to read a date on every card.
// `compact` is for narrow containers (a club page's two-column layout), where
// the desktop venue column would be squeezed regardless of viewport width.
export function MatchdayList({
  fixtures,
  played = false,
  compact = false,
}: {
  fixtures: (FixtureLike & { matchEvents?: any[] })[];
  played?: boolean;
  compact?: boolean;
}) {
  const groups: { key: string; label: string; items: typeof fixtures }[] = [];

  for (const fixture of fixtures) {
    const key = new Date(fixture.fixtureDate).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(fixture);
    else groups.push({ key, label: formatDate(fixture.fixtureDate), items: [fixture] });
  }

  return (
    <div className={compact ? 'matchday-compact' : undefined}>
      {groups.map((group) => (
        <section key={group.key} className="matchday">
          <h2 className="matchday-date">
            <span>{group.label}</span>
            <span>{group.items.length} {group.items.length === 1 ? 'match' : 'matches'}</span>
          </h2>
          {group.items.map((fixture) => <MatchRow key={fixture.id} fixture={fixture} played={played} />)}
        </section>
      ))}
    </div>
  );
}

/* ── Directory ───────────────────────────────────────────────────── */

export function ClubCard({ club }: { club: any }) {
  return (
    <Link href={`/clubs/${club.id}`} className="card" style={{ color: 'inherit', textDecoration: 'none', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Avatar src={club.logoUrl} name={club.name} size={52} rounded="soft" />
        <div style={{ minWidth: 0 }}>
          <h3 className="card-title" style={{ margin: 0, fontSize: 19 }}>{club.name}</h3>
          <p className="card-meta" style={{ margin: 0 }}>{club.homeVenue?.name || 'Home ground TBC'}</p>
        </div>
      </div>
      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px var(--space-3)', fontSize: 13 }}>
        {club.managers?.[0] && (
          <>
            <dt className="text-muted">Manager</dt>
            <dd style={{ margin: 0 }}>{club.managers[0].firstName} {club.managers[0].lastName}</dd>
          </>
        )}
        {club.yearFounded && (
          <>
            <dt className="text-muted">Founded</dt>
            <dd style={{ margin: 0 }} className="num">{club.yearFounded}</dd>
          </>
        )}
        <dt className="text-muted">Squad</dt>
        <dd style={{ margin: 0 }}><span className="num">{club._count?.players ?? 0}</span> players</dd>
      </dl>
    </Link>
  );
}

export function PlayerCard({ player }: { player: any }) {
  return (
    <Link href={`/players/${player.id}`} className="card" style={{ color: 'inherit', textDecoration: 'none', alignItems: 'center', textAlign: 'center', gap: 'var(--space-2)' }}>
      <Avatar src={player.photoUrl} name={`${player.firstName} ${player.lastName}`} size={72} />
      <h3 className="card-title" style={{ margin: 0, fontSize: 16 }}>{player.firstName} {player.lastName}</h3>
      <p className="card-meta" style={{ justifyContent: 'center', margin: 0 }}>
        {[player.club?.name, player.position].filter(Boolean).join(' · ')}
      </p>
      {player.goals > 0 && (
        <p style={{ margin: 0 }}>
          <span className="num" style={{ fontSize: 20, color: 'var(--color-ink)' }}>{player.goals}</span>{' '}
          <span className="text-muted" style={{ fontSize: 12 }}>{player.goals === 1 ? 'goal' : 'goals'}</span>
        </p>
      )}
    </Link>
  );
}

export function NewsCard({ article, lead = false }: { article: any; lead?: boolean }) {
  const href = `/news/${article.slug || article.id}`;
  const summary = String(article.message || '');
  const cut = lead ? 200 : 110;

  // No image means a text-led story, not an empty grey plate. A newspaper runs
  // headline-first pieces all the time; a placeholder rectangle is just a hole.
  return (
    <Link href={href} className={`story${lead ? ' story-lead' : ''}${article.featuredImageUrl ? '' : ' story-textled'}`}>
      {article.featuredImageUrl && (
        <img src={article.featuredImageUrl} alt="" className="story-media" loading="lazy" />
      )}
      <p className="eyebrow" style={{ margin: article.featuredImageUrl ? 'var(--space-3) 0 0' : 0 }}>{article.category || 'League News'}</p>
      <h3 className="story-title">{article.title}</h3>
      <p className="text-muted" style={{ fontSize: lead ? 15 : 13, margin: '0 0 var(--space-2)' }}>
        {summary.slice(0, cut)}{summary.length > cut ? '…' : ''}
      </p>
      <p className="story-meta">
        <time dateTime={new Date(article.startDate).toISOString()}>{formatDate(article.startDate)}</time>
        {article.author && <span>· {article.author}</span>}
      </p>
    </Link>
  );
}

export function SponsorCard({ sponsor }: { sponsor: any }) {
  const inner = (
    <>
      {sponsor.logoUrl ? (
        <img src={sponsor.logoUrl} alt={sponsor.name} loading="lazy" style={{ maxHeight: 52, maxWidth: '100%', objectFit: 'contain' }} />
      ) : (
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>{sponsor.name}</span>
      )}
      <span style={{ fontSize: 11, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
        {sponsor.category || 'Partner'}
      </span>
    </>
  );

  return sponsor.websiteUrl ? (
    <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer sponsored">{inner}</a>
  ) : (
    <div>{inner}</div>
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
            <th scope="col" className="col-pos">#</th>
            <th scope="col" className="col-club">Club</th>
            <th scope="col" className="col-num">P</th>
            <th scope="col" className="col-num col-optional">W</th>
            <th scope="col" className="col-num col-optional">D</th>
            <th scope="col" className="col-num col-optional">L</th>
            <th scope="col" className="col-num col-optional">GF</th>
            <th scope="col" className="col-num col-optional">GA</th>
            <th scope="col" className="col-num">GD</th>
            <th scope="col" className="col-pts">Pts</th>
            {!compact && <th scope="col" className="col-optional">Form</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={row.position === 1 ? 'is-leader' : undefined}>
              <td className="col-pos">{row.position}</td>
              <td className="col-club">
                <Link href={`/clubs/${row.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'inherit', textDecoration: 'none' }}>
                  <Avatar src={row.logoUrl} name={row.clubName} size={24} rounded="soft" />
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.01em' }}>{row.clubName}</span>
                </Link>
              </td>
              <td className="col-num">{row.played}</td>
              <td className="col-num col-optional">{row.won}</td>
              <td className="col-num col-optional">{row.drawn}</td>
              <td className="col-num col-optional">{row.lost}</td>
              <td className="col-num col-optional">{row.goalsFor}</td>
              <td className="col-num col-optional">{row.goalsAgainst}</td>
              <td className="col-num">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              <td className="col-pts">{row.points}</td>
              {!compact && <td className="col-optional"><FormStrip form={row.form} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
