import Link from 'next/link';
import { formatDate } from '@/components/public';

/*
  Homepage-only components — "THE BOARD".

  Deliberately separate from components/public/index.tsx, which is shared by
  the clubs, players, fixtures, results and news pages. Nothing here is imported
  elsewhere, so the homepage can be rebuilt without touching those pages.

  The governing rule from KNSCL_HOMEPAGE_VISUAL_DIRECTION.md: a record is ruled
  and shares edges with its neighbours; a container is boxed and floats. Match
  rows, table rows and crest cells are records. None of them is a card.
*/

type Club = { id: string; name: string; shortName?: string | null; logoUrl?: string | null };
type Fixture = {
  id: string;
  fixtureDate: Date | string;
  kickoffTime?: string | null;
  round?: string | null;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeClub: Club;
  awayClub: Club;
  venue?: { name: string } | null;
};

/* ── Club crest ──────────────────────────────────────────────────────
   Where a real badge exists it is rendered at full size with no frame, so
   the crest itself is the object. Where one does not, the fallback is
   deliberately quiet — a restrained monogram that never competes with a
   real crest sitting next to it in the same wall. No logo is invented. */

export function ClubCrest({
  club,
  size,
  variant,
}: {
  club: { name: string; shortName?: string | null; logoUrl?: string | null };
  /** Fixed pixel size. Omit when using a variant, which sizes from CSS. */
  size?: number;
  /** `hero` and `wall` scale with the viewport so the balance between the
      matchday board and the crest wall holds at every breakpoint.
      `register` is the Clubs page record crest. */
  variant?: 'hero' | 'wall' | 'register';
}) {
  const cls = variant ? ` crest-${variant}` : '';
  const style = size ? { width: size, height: size } : undefined;

  if (club.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- data URLs / Blob CDN, not statically known
    return <img src={club.logoUrl} alt="" className={`home-crest-img${cls}`} style={style} loading="lazy" />;
  }

  const initials =
    club.shortName?.slice(0, 3).toUpperCase() ||
    club.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

  return (
    <span
      aria-hidden="true"
      className={`home-crest-fallback${cls}`}
      style={size ? { ...style, fontSize: Math.max(11, Math.round(size * 0.26)) } : undefined}
    >
      {initials || '—'}
    </span>
  );
}

/* ── Matchday temperature ────────────────────────────────────────────
   A fixture is an appointment, and relative time is most of what separates
   football from editorial. Only states the data can actually support are
   produced here — the schema has no in-play status, so none is invented. */

export function matchTemperature(fixture: Fixture): { label: string; live: boolean } {
  if (fixture.status === 'COMPLETED') return { label: 'Full time', live: false };
  if (fixture.status === 'POSTPONED') return { label: 'Postponed', live: false };

  // The date already sits on the left of the rail and the kickoff time fills
  // the numeral slot, so this returns a state word — never a repeat of either.
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((day(new Date(fixture.fixtureDate)) - day(new Date())) / 86_400_000);

  if (days === 0) return { label: 'Today', live: false };
  if (days === 1) return { label: 'Tomorrow', live: false };
  if (days > 1 && days <= 7) return { label: `In ${days} days`, live: false };
  return { label: 'Scheduled', live: false };
}

/* ── Form strip ──────────────────────────────────────────────────────
   Competition information, not decoration: three 19px squares carrying the
   only colour on the ink ground besides the crests. */

export function Form({ form }: { form?: ('W' | 'D' | 'L')[] }) {
  if (!form?.length) return null;
  const recent = form.slice(-3);
  return (
    <span className="form-strip" aria-label={`Recent form: ${recent.join(', ')}`}>
      {recent.map((f, i) => (
        <span key={i} className={`form-badge form-${f.toLowerCase()}`} aria-hidden="true">{f}</span>
      ))}
    </span>
  );
}

/* ── Matchday board — the primary visual anchor ──────────────────────
   club → score/status → club. On desktop the axis is horizontal; below
   720px it rotates to vertical. The order never changes and the score never
   leaves the middle. */

function MatchSide({ club, beaten, form }: { club: Club; beaten?: boolean; form?: ('W' | 'D' | 'L')[] }) {
  return (
    <Link href={`/clubs/${club.id}`} className={`home-match-club${beaten ? ' is-beaten' : ''}`}>
      <ClubCrest club={club} variant="hero" />
      <span style={{ minWidth: 0 }}>
        <span className="home-match-name" style={{ display: 'block' }}>{club.name}</span>
        <span style={{ display: 'block', marginTop: 6 }}><Form form={form} /></span>
      </span>
    </Link>
  );
}

export function MatchdayBoard({
  fixture,
  formByClub,
}: {
  fixture: Fixture;
  formByClub: Record<string, ('W' | 'D' | 'L')[]>;
}) {
  const played = fixture.status === 'COMPLETED';
  const home = fixture.homeScore ?? 0;
  const away = fixture.awayScore ?? 0;
  const temp = matchTemperature(fixture);

  return (
    <div>
      <p className="home-md-rail">
        <span>{fixture.round || (played ? 'League' : 'Next match')} · {formatDate(fixture.fixtureDate)}</span>
        <span className={`home-md-status${temp.live ? ' is-live' : ''}`}>{temp.label}</span>
      </p>

      <div className="home-match">
        <MatchSide club={fixture.homeClub} beaten={played && home < away} form={played ? formByClub[fixture.homeClub.id] : undefined} />

        <div className="home-score-slot">
          {played ? (
            <p className="home-score" style={{ margin: 0 }}>
              {home}<span className="home-score-sep" aria-hidden="true">–</span>
              <span className="sr-only"> versus </span>{away}
            </p>
          ) : (
            <p className="home-kickoff" style={{ margin: 0 }}>{fixture.kickoffTime || 'TBC'}</p>
          )}
          <span className="home-score-note">{played ? 'Full time' : 'Kickoff'}</span>
        </div>

        <MatchSide club={fixture.awayClub} beaten={played && away < home} form={played ? formByClub[fixture.awayClub.id] : undefined} />
      </div>

      <p className="home-md-foot">
        <span>{fixture.venue?.name || 'Venue TBC'}</span>
        {played && <Link href={`/matches/${fixture.id}`}>Match report &rarr;</Link>}
      </p>
    </div>
  );
}

/* ── Match list — flush-right numerals, so scores fall in one column ── */

export function MatchList({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <div className="home-list">
      {fixtures.map((f) => {
        const played = f.status === 'COMPLETED';
        const body = (
          <>
            <span className="home-list-teams">
              {/* Full names, not codes — an abbreviation reads as a database
                  key, and clarity is worth the extra line. */}
              {f.homeClub.name} <span style={{ opacity: 0.5, fontWeight: 500 }}>v</span> {f.awayClub.name}
              <span className="home-list-meta">
                {formatDate(f.fixtureDate, 'short')}{f.venue?.name ? ` · ${f.venue.name}` : ''}
              </span>
            </span>
            <span className="home-list-score">
              {played
                ? <>{f.homeScore ?? 0}<span style={{ opacity: 0.4 }}>–</span>{f.awayScore ?? 0}</>
                : f.kickoffTime || 'TBC'}
            </span>
          </>
        );
        return played ? (
          <Link key={f.id} href={`/matches/${f.id}`} className="home-list-item">{body}</Link>
        ) : (
          <div key={f.id} className="home-list-item">{body}</div>
        );
      })}
    </div>
  );
}

/* ── Competition ─────────────────────────────────────────────────────
   In-season the slot holds the table; pre-season it holds real season
   figures. Same rails, same rule, no zero ever displayed. */

type Standing = {
  id: string; clubName: string; logoUrl?: string | null; position: number;
  played: number; won: number; drawn: number; lost: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; points: number;
};

export function CompetitionTable({ rows }: { rows: Standing[] }) {
  return (
    <table className="home-table">
      <caption className="sr-only">League table, leading clubs</caption>
      <thead>
        <tr>
          <th scope="col" className="col-pos">#</th>
          <th scope="col">Club</th>
          <th scope="col" className="col-n">P</th>
          <th scope="col" className="col-n col-opt">W</th>
          <th scope="col" className="col-n col-opt">D</th>
          <th scope="col" className="col-n col-opt">L</th>
          <th scope="col" className="col-n">GD</th>
          <th scope="col" className="col-pts">Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className={row.position === 1 ? 'is-leader' : undefined}>
            <td className="col-pos">{row.position}</td>
            <td>
              <Link href={`/clubs/${row.id}`} className="home-club-cell">
                <ClubCrest club={{ name: row.clubName, logoUrl: row.logoUrl }} size={24} />
                <span>{row.clubName}</span>
              </Link>
            </td>
            <td className="col-n">{row.played}</td>
            <td className="col-n col-opt">{row.won}</td>
            <td className="col-n col-opt">{row.drawn}</td>
            <td className="col-n col-opt">{row.lost}</td>
            <td className="col-n">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
            <td className="col-pts">{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Only non-zero figures are passed in — a statistic with no value is not
// information, so the caller omits it rather than rendering a zero.
export function SeasonFigures({
  figures,
  stack = false,
}: {
  figures: { value: number | string; label: string }[];
  /** Single column, for the narrow competition rail. */
  stack?: boolean;
}) {
  return (
    <div className={`home-figures${stack ? ' home-figures-stack' : ''}`}>
      {figures.map((f) => (
        <div key={f.label}>
          <span className="home-figure-value">{f.value}</span>
          <span className="home-figure-label">{f.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Crest wall — one ruled object, not sixteen cards ───────────────── */

export function CrestWall({
  clubs,
}: {
  clubs: { id: string; name: string; shortName?: string | null; logoUrl?: string | null; position?: number | null }[];
}) {
  return (
    <div className="home-crestwall">
      {clubs.map((club) => (
        <Link key={club.id} href={`/clubs/${club.id}`} className="home-crest-cell">
          {club.position != null && (
            <span className="home-crest-pos" aria-hidden="true">{club.position}</span>
          )}
          <ClubCrest club={club} variant="wall" />
          <span className="home-crest-name">{club.name}</span>
        </Link>
      ))}
    </div>
  );
}

/* ── News — asymmetric editorial split ───────────────────────────────
   One image only. Without it the lead takes a rule and a larger headline;
   an empty grey plate would be a hole, not a design. */

export function NewsLead({ article }: { article: any }) {
  const href = `/news/${article.slug || article.id}`;
  const summary = String(article.message || '');

  return (
    <Link href={href} className={`home-lead${article.featuredImageUrl ? '' : ' is-textled'}`}>
      {article.featuredImageUrl && (
        <img src={article.featuredImageUrl} alt="" className="home-lead-media" loading="lazy" />
      )}
      <p className="eyebrow" style={{ margin: article.featuredImageUrl ? 'var(--space-3) 0 0' : 0 }}>
        {article.category || 'League News'}
      </p>
      <h3 className="home-lead-title">{article.title}</h3>
      <p className="text-muted" style={{ fontSize: 15, margin: '0 0 var(--space-2)', maxWidth: '52ch' }}>
        {summary.slice(0, 180)}{summary.length > 180 ? '…' : ''}
      </p>
      <p className="story-meta">
        <time dateTime={new Date(article.startDate).toISOString()}>{formatDate(article.startDate)}</time>
        {article.author && <span>· {article.author}</span>}
      </p>
    </Link>
  );
}

export function NewsList({ articles }: { articles: any[] }) {
  return (
    <div>
      {articles.map((article) => (
        <Link key={article.id} href={`/news/${article.slug || article.id}`} className="home-story">
          <p className="eyebrow" style={{ margin: 0 }}>{article.category || 'League News'}</p>
          <h3 className="home-story-title">{article.title}</h3>
          <p className="story-meta">{formatDate(article.startDate)}</p>
        </Link>
      ))}
    </div>
  );
}
