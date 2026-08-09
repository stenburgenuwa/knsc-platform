import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { getHomepageData } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import {
  EmptyState,
  FixtureCard,
  LeagueTable,
  NewsCard,
  NextMatchBoard,
  PlayerCard,
  ResultCard,
  SectionHead,
  SponsorCard,
  formatDate,
} from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Kilifi North Sub County League | Official Website',
  description:
    'Official home of the Kilifi North Sub County League — live standings, fixtures, results, clubs, players and news.',
  path: '/',
});

// Homepage order answers a fan's questions in the order they ask them:
// who are we → what's next → what just happened → where does that leave the
// table → who's performing → what's the story → who backs the league.
export default async function HomePage() {
  const { content, statistics, standings, nextMatches, latestResults, news, sponsors, featuredPlayers } = await getHomepageData();

  const season = content['league.season'] || String(new Date().getFullYear());
  const [nextMatch, ...laterMatches] = nextMatches;
  const [leadStory, ...moreNews] = news;
  const leader = statistics.leader;
  const topScorer = statistics.topScorers[0];

  return (
    <div>
      {/* ── Identity + matchday board ─────────────────────────── */}
      <section className="bleed on-dark">
        <div className="bleed-inner" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: 'var(--space-8)', alignItems: 'center' }}>
            <div className="lg:col-span-5">
              <p className="eyebrow">Season {season}</p>
              <h1 style={{ marginBottom: 'var(--space-3)' }}>
                {content['hero.title'] || 'Kilifi North Sub County League'}
              </h1>
              <p className="text-muted" style={{ fontSize: 16, maxWidth: 460, marginBottom: 'var(--space-4)' }}>
                {content['hero.subtitle'] ||
                  'Every fixture, every result, every player — the official record of football in Kilifi North.'}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Link href={content['hero.ctaHref'] || '/fixtures'} className="btn btn-primary">
                  {content['hero.ctaLabel'] || 'View Fixtures'}
                </Link>
                <Link href="/table" className="btn btn-secondary">League Table</Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              {nextMatch ? (
                <div style={{ border: '1px solid rgb(255 255 255 / 0.18)', borderRadius: 'var(--radius-md)' }}>
                  <p
                    className="eyebrow"
                    style={{ margin: 0, padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid rgb(255 255 255 / 0.18)' }}
                  >
                    Next match
                  </p>
                  <NextMatchBoard fixture={nextMatch as any} />
                  <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid rgb(255 255 255 / 0.18)', textAlign: 'center' }}>
                    <Link href="/fixtures" className="btn btn-secondary">All fixtures</Link>
                  </div>
                </div>
              ) : (
                <div style={{ border: '1px solid rgb(255 255 255 / 0.18)', borderRadius: 'var(--radius-md)', padding: 'var(--space-8)', textAlign: 'center' }}>
                  <p className="text-muted" style={{ margin: 0 }}>The next round of fixtures will be published shortly.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Season at a glance, tied to the identity band rather than floating
            as its own card row. */}
        <div style={{ borderTop: '1px solid rgb(255 255 255 / 0.14)' }}>
          <div className="bleed-inner">
            <div className="stat-band">
              <div className="stat-cell"><span className="stat-value">{statistics.totals.clubs}</span><span className="stat-label">Clubs</span></div>
              <div className="stat-cell"><span className="stat-value">{statistics.totals.players}</span><span className="stat-label">Players</span></div>
              <div className="stat-cell"><span className="stat-value">{statistics.totals.matches}</span><span className="stat-label">Matches played</span></div>
              <div className="stat-cell"><span className="stat-value">{statistics.totals.goals}</span><span className="stat-label">Goals scored</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell">
        {/* ── What just happened ──────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <SectionHead title="Latest Results" href="/results" linkLabel="All results" />
          {latestResults.length === 0 ? (
            <EmptyState title="No results published yet" hint="Scores appear as soon as match reports are approved." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
              {latestResults.map((f) => <ResultCard key={f.id} fixture={f as any} />)}
            </div>
          )}
        </section>

        {/* ── Where that leaves the competition ───────────────── */}
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <SectionHead title="League Table" href="/table" linkLabel="Full table" />
          <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: 'var(--space-6)' }}>
            <div className="lg:col-span-8">
              <LeagueTable rows={standings} compact />
            </div>

            {/* Leader and top scorer read as consequences of the table, not as
                two more cards in an unrelated grid. */}
            <aside className="lg:col-span-4 list-rule">
              {leader && (
                <Link href={`/clubs/${leader.id}`} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                  <Avatar src={leader.logoUrl} name={leader.clubName} size={44} rounded="soft" />
                  <div>
                    <p className="eyebrow" style={{ margin: 0 }}>Top of the table</p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>{leader.clubName}</p>
                    <p className="card-meta" style={{ margin: 0 }}>
                      <span className="num">{leader.points}</span> pts from <span className="num">{leader.played}</span> matches
                    </p>
                  </div>
                </Link>
              )}
              {topScorer && (
                <Link href={`/players/${topScorer.id}`} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                  <Avatar src={topScorer.photoUrl} name={`${topScorer.firstName} ${topScorer.lastName}`} size={44} />
                  <div>
                    <p className="eyebrow" style={{ margin: 0 }}>Leading scorer</p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>
                      {topScorer.firstName} {topScorer.lastName}
                    </p>
                    <p className="card-meta" style={{ margin: 0 }}>
                      <span className="num">{topScorer.goals}</span> goals · {topScorer.club?.name}
                    </p>
                  </div>
                </Link>
              )}
              <Link href="/statistics" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                Season statistics
              </Link>
            </aside>
          </div>
        </section>

        {/* ── Coming up ───────────────────────────────────────── */}
        {laterMatches.length > 0 && (
          <section style={{ marginBottom: 'var(--space-12)' }}>
            <SectionHead title="Also Coming Up" href="/fixtures" linkLabel="All fixtures" />
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
              {laterMatches.map((f) => <FixtureCard key={f.id} fixture={f as any} />)}
            </div>
          </section>
        )}

        {/* ── Stories ─────────────────────────────────────────── */}
        {leadStory && (
          <section style={{ marginBottom: 'var(--space-12)' }}>
            <SectionHead title="Latest News" href="/news" linkLabel="Newsroom" />
            <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: 'var(--space-6)' }}>
              <div className="lg:col-span-7">
                <NewsCard article={leadStory} lead />
              </div>
              {moreNews.length > 0 && (
                <div className="lg:col-span-5 list-rule">
                  {moreNews.map((article) => (
                    <Link key={article.id} href={`/news/${article.slug || article.id}`} className="story">
                      <p className="eyebrow" style={{ margin: 0 }}>{article.category || 'League News'}</p>
                      <h3 className="story-title" style={{ fontSize: 17, margin: '4px 0' }}>{article.title}</h3>
                      <p className="story-meta">{formatDate(article.startDate)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Players ─────────────────────────────────────────── */}
        {featuredPlayers.length > 0 && (
          <section style={{ marginBottom: 'var(--space-12)' }}>
            <SectionHead title="Players to Watch" href="/players" linkLabel="All players" />
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
              {featuredPlayers.map((p: any) => <PlayerCard key={p.id} player={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* ── Partners ──────────────────────────────────────────── */}
      {sponsors.length > 0 && (
        <section className="bleed" style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
          <div className="bleed-inner">
            <h6 style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>Official Partners</h6>
            <div className="logo-wall">
              {sponsors.slice(0, 5).map((s) => <SponsorCard key={s.id} sponsor={s} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
