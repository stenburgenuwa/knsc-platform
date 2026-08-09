import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { getHomepageData } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import {
  CompetitionTable,
  CrestWall,
  MatchList,
  MatchdayBoard,
  NewsLead,
  NewsList,
  SeasonFigures,
} from '@/components/public/home';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Kilifi North Sub County League | Official Website',
  description:
    'Official home of the Kilifi North Sub County League — live standings, fixtures, results, clubs, players and news.',
  path: '/',
});

/*
  THE BOARD — see KNSCL_HOMEPAGE_VISUAL_DIRECTION.md.

  Six sections, two of which swap content by season state. No hero: the
  masthead already establishes identity, so the page opens on matchday.

    MATCHDAY     ink    primary anchor — club → score/status → club
    COMPETITION  paper  table in-season, real season figures before it
    CLUBS        paper  one ruled crest wall, not sixteen cards
    NEWS         paper  one dominant story, the rest as a rule list
    PARTNERS     ink    closes on the ground the page opened on

  State is derived from the data (any COMPLETED fixture), never configured.
*/
export default async function HomePage() {
  const {
    content, seasonState, statistics, standings, formByClub,
    heroFixture, nextFixture, otherResults, upcoming,
    crestWall, totals, news, sponsors,
  } = await getHomepageData();

  const active = seasonState === 'ACTIVE';
  const season = content['league.season'] || String(new Date().getFullYear());
  const [leadStory, ...moreNews] = news;
  const topScorer = statistics.topScorers[0];

  // A statistic with no value is not information. Zeros are dropped rather
  // than rendered, in both states.
  const figures = [
    { value: totals.clubs, label: 'Clubs' },
    { value: totals.fixtures, label: 'Fixtures' },
    { value: totals.players, label: 'Players' },
    ...(active ? [{ value: totals.played, label: 'Played' }, { value: totals.goals, label: 'Goals' }] : []),
  ].filter((f) => Number(f.value) > 0);

  // The rail beside the hero: what is coming, then what else has happened.
  const railFixtures = active ? [nextFixture, ...otherResults].filter(Boolean) : upcoming;

  return (
    <div>
      {/* ── 02 MATCHDAY ─────────────────────────────────────────────
          Runs straight out of the masthead, so the page opens on one
          uninterrupted ink field. */}
      <section className="bleed on-dark">
        <div className="bleed-inner" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
          {heroFixture ? (
            <div className="home-md-split">
              <MatchdayBoard fixture={heroFixture as any} formByClub={formByClub} />

              <div>
                <p className="home-label">
                  <span>{active ? 'Around the league' : 'Opening fixtures'}</span>
                  <Link href={active ? '/results' : '/fixtures'}>{active ? 'All results' : 'All fixtures'} &rarr;</Link>
                </p>
                {railFixtures.length > 0 ? (
                  <MatchList fixtures={railFixtures as any} />
                ) : (
                  <p className="text-muted" style={{ fontSize: 14, margin: 0 }}>
                    The rest of the round will be published shortly.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* No fixtures at all — state the season, do not report a void. */
            <div style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-4)' }}>
              <p className="home-md-rail" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <span>Season {season}</span>
              </p>
              <p className="home-kickoff" style={{ margin: 'var(--space-4) 0 0' }}>{totals.clubs}</p>
              <p className="home-score-note" style={{ marginTop: 'var(--space-2)' }}>
                Clubs confirmed · Fixtures to be published
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 03 COMPETITION ──────────────────────────────────────────
          Hard cut from ink to paper: the contrast is the section break. */}
      <section className="bleed">
        <div className="bleed-inner" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
          <div className="home-split">
            <div>
              <p className="home-label">
                <span>{active ? 'Table' : 'The season ahead'}</span>
                <Link href={active ? '/table' : '/fixtures'}>
                  {active ? 'Full table' : 'Fixture list'} &rarr;
                </Link>
              </p>

              {active ? (
                <CompetitionTable rows={standings as any} />
              ) : heroFixture ? (
                /* Pre-season, this slot answers "what happens next in this
                   league?" — the opening date carries the numeral weight the
                   table would carry in-season, and the fixture names the
                   football. Statistics move to the rail as support. */
                <div>
                  <p className="home-figure-value" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
                    {new Date(heroFixture.fixtureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                  </p>
                  <p className="home-figure-label" style={{ marginTop: 'var(--space-2)' }}>
                    Season opens · {heroFixture.kickoffTime || 'Kickoff TBC'}
                  </p>
                  <p style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>
                    {heroFixture.homeClub.name} <span className="text-muted" style={{ fontWeight: 500 }}>v</span> {heroFixture.awayClub.name}
                  </p>
                  <p className="story-meta">{heroFixture.venue?.name || 'Venue TBC'}</p>
                </div>
              ) : (
                <SeasonFigures figures={figures} />
              )}
            </div>

            <div>
              {active && topScorer ? (
                <>
                  <p className="home-label"><span>Leading scorer</span></p>
                  <Link
                    href={`/players/${topScorer.id}`}
                    style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
                  >
                    <Avatar src={topScorer.photoUrl} name={`${topScorer.firstName} ${topScorer.lastName}`} size={52} rounded="square" />
                    <span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>
                        {topScorer.firstName} {topScorer.lastName}
                      </span>
                      <span className="story-meta">{topScorer.club?.name}</span>
                    </span>
                  </Link>
                  <p style={{ margin: 'var(--space-4) 0 0' }}>
                    <span className="home-figure-value">{topScorer.goals}</span>
                    <span className="home-figure-label">{topScorer.goals === 1 ? 'Goal' : 'Goals'}</span>
                  </p>
                  {figures.length > 0 && (
                    <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-divider)' }}>
                      <SeasonFigures figures={figures.slice(0, 2)} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Statistics become the support beside the opening date,
                      rather than being the section's whole content. */}
                  <p className="home-label"><span>Registered</span></p>
                  <SeasonFigures figures={figures} stack />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 CLUBS ────────────────────────────────────────────────
          Sixteen clubs is small enough to show rather than link to. The
          crests are also the only real colour the league owns. */}
      {crestWall.length > 0 && (
        <section className="bleed">
          <div className="bleed-inner" style={{ paddingBottom: 'var(--space-8)' }}>
            <p className="home-label">
              <span>Clubs</span>
              <Link href="/clubs">All {crestWall.length} clubs &rarr;</Link>
            </p>
            <CrestWall clubs={crestWall} />
          </div>
        </section>
      )}

      {/* ── 05 NEWS ─────────────────────────────────────────────────── */}
      {leadStory && (
        <section className="bleed">
          <div className="bleed-inner" style={{ paddingBottom: 'var(--space-8)' }}>
            <p className="home-label">
              <span>News</span>
              <Link href="/news">Newsroom &rarr;</Link>
            </p>
            <div className="home-news">
              <NewsLead article={leadStory} />
              {moreNews.length > 0 && <NewsList articles={moreNews} />}
            </div>
          </div>
        </section>
      )}

      {/* ── 06 PARTNERS ─────────────────────────────────────────────
          Closes on the ground the page opened on. */}
      {sponsors.length > 0 && (
        <section className="bleed on-dark home-flush">
          <div className="bleed-inner" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
            <p className="home-label"><span>Partners</span></p>
            <div className="home-partners">
              {sponsors.slice(0, 6).map((s) =>
                s.websiteUrl ? (
                  <a key={s.id} href={s.websiteUrl} target="_blank" rel="noopener noreferrer sponsored" className="home-partner">
                    {s.logoUrl
                      ? <img src={s.logoUrl} alt={s.name} loading="lazy" />
                      : <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{s.name}</span>}
                    <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgb(255 255 255 / 0.5)' }}>
                      {s.category || 'Partner'}
                    </span>
                  </a>
                ) : (
                  <div key={s.id} className="home-partner">
                    {s.logoUrl
                      ? <img src={s.logoUrl} alt={s.name} loading="lazy" />
                      : <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{s.name}</span>}
                    <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgb(255 255 255 / 0.5)' }}>
                      {s.category || 'Partner'}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
