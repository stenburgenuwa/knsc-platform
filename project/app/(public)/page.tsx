import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { getHomepageData } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { EmptyState, FixtureCard, LeagueTable, NewsCard, PlayerCard, ResultCard, SponsorCard, formatDate } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Kilifi North Sub County League | Official Website',
  description:
    'Official home of the Kilifi North Sub County League — live standings, fixtures, results, clubs, players and news.',
  path: '/',
});

// A pitch motif stands in when no hero photograph has been uploaded, so the
// page never opens on an empty grey box.
function PitchMotif() {
  return (
    <svg viewBox="0 0 800 450" width="100%" height="100%" role="img" aria-label="Football pitch illustration" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="450" fill="var(--color-neutral-200)" />
      <g fill="none" stroke="var(--color-neutral-400)" strokeWidth="2">
        <rect x="40" y="30" width="720" height="390" />
        <line x1="400" y1="30" x2="400" y2="420" />
        <circle cx="400" cy="225" r="70" />
        <rect x="40" y="130" width="90" height="190" />
        <rect x="670" y="130" width="90" height="190" />
      </g>
    </svg>
  );
}

export default async function HomePage() {
  const { content, statistics, standings, nextMatches, latestResults, news, sponsors, featuredPlayers } = await getHomepageData();

  const heroImage = content['hero.imageUrl'];
  const season = content['league.season'] || String(new Date().getFullYear());
  const nextMatch = nextMatches[0];
  const [featuredStory, ...moreNews] = news;

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-band">
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-6)', alignItems: 'center' }}>
            <div>
              <p className="eyebrow">Official League Platform · Season {season}</p>
              <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-2)' }}>
                {content['hero.title'] || 'Kilifi North Sub County League'}
              </h1>
              <p className="text-muted" style={{ maxWidth: 520, marginBottom: 'var(--space-4)' }}>
                {content['hero.subtitle'] ||
                  'Every fixture, every result, every player — the official record of football in Kilifi North.'}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Link href={content['hero.ctaHref'] || '/fixtures'} className="btn btn-primary">
                  {content['hero.ctaLabel'] || 'View Fixtures'} &rarr;
                </Link>
                <Link href="/table" className="btn btn-secondary">League Table</Link>
              </div>

              {nextMatch && (
                <div className="card" style={{ marginTop: 'var(--space-6)', maxWidth: 420, background: 'var(--color-bg)' }}>
                  <p className="eyebrow" style={{ margin: 0 }}>Next match</p>
                  <div className="match-row">
                    <span className="match-team">
                      <Avatar src={nextMatch.homeClub.logoUrl} name={nextMatch.homeClub.name} size={22} rounded="soft" />
                      <span>{nextMatch.homeClub.name}</span>
                    </span>
                    <span className="text-muted" style={{ fontSize: 12 }}>vs</span>
                    <span className="match-team" style={{ justifyContent: 'flex-end' }}>
                      <span>{nextMatch.awayClub.name}</span>
                      <Avatar src={nextMatch.awayClub.logoUrl} name={nextMatch.awayClub.name} size={22} rounded="soft" />
                    </span>
                  </div>
                  <p className="card-meta" style={{ margin: 0 }}>
                    {formatDate(nextMatch.fixtureDate)}
                    {nextMatch.kickoffTime ? ` · ${nextMatch.kickoffTime}` : ''}
                    {nextMatch.venue?.name ? ` · ${nextMatch.venue.name}` : ''}
                  </p>
                </div>
              )}
            </div>

            <div className="hero-figure" style={{ aspectRatio: '16 / 9' }}>
              {heroImage ? <img src={heroImage} alt="" /> : <PitchMotif />}
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell">
        {/* ── Season at a glance ─────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div className="stat-strip">
            <div className="stat-cell"><span className="stat-value">{statistics.totals.clubs}</span><span className="stat-label">Clubs</span></div>
            <div className="stat-cell"><span className="stat-value">{statistics.totals.players}</span><span className="stat-label">Players</span></div>
            <div className="stat-cell"><span className="stat-value">{statistics.totals.matches}</span><span className="stat-label">Matches played</span></div>
            <div className="stat-cell"><span className="stat-value">{statistics.totals.goals}</span><span className="stat-label">Goals scored</span></div>
          </div>
          {(statistics.leader || statistics.topScorers[0]) && (
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              {statistics.leader && (
                <Link href={`/clubs/${statistics.leader.id}`} className="card elev-sm" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-3)', color: 'inherit', textDecoration: 'none' }}>
                  <Avatar src={statistics.leader.logoUrl} name={statistics.leader.clubName} size={44} rounded="soft" />
                  <div>
                    <p className="eyebrow" style={{ margin: 0 }}>League leader</p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 17 }}>{statistics.leader.clubName}</p>
                    <p className="card-meta" style={{ margin: 0 }}>{statistics.leader.points} pts from {statistics.leader.played} matches</p>
                  </div>
                </Link>
              )}
              {statistics.topScorers[0] && (
                <Link href={`/players/${statistics.topScorers[0].id}`} className="card elev-sm" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-3)', color: 'inherit', textDecoration: 'none' }}>
                  <Avatar src={statistics.topScorers[0].photoUrl} name={`${statistics.topScorers[0].firstName} ${statistics.topScorers[0].lastName}`} size={44} />
                  <div>
                    <p className="eyebrow" style={{ margin: 0 }}>Top scorer</p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 17 }}>
                      {statistics.topScorers[0].firstName} {statistics.topScorers[0].lastName}
                    </p>
                    <p className="card-meta" style={{ margin: 0 }}>
                      {statistics.topScorers[0].goals} goals · {statistics.topScorers[0].club?.name}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* ── Latest results ─────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: 26 }}>Latest Results</h2>
            <Link href="/results" className="btn btn-ghost">All results &rarr;</Link>
          </div>
          {latestResults.length === 0 ? (
            <EmptyState title="No results published yet" hint="Scores appear as soon as match reports are approved." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
              {latestResults.map((f) => <ResultCard key={f.id} fixture={f as any} />)}
            </div>
          )}
        </section>

        {/* ── Upcoming fixtures ──────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: 26 }}>Upcoming Fixtures</h2>
            <Link href="/fixtures" className="btn btn-ghost">All fixtures &rarr;</Link>
          </div>
          {nextMatches.length === 0 ? (
            <EmptyState title="No fixtures scheduled" hint="The next round will be published shortly." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
              {nextMatches.map((f) => <FixtureCard key={f.id} fixture={f as any} />)}
            </div>
          )}
        </section>

        {/* ── Table preview ──────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: 26 }}>League Table</h2>
            <Link href="/table" className="btn btn-ghost">Full table &rarr;</Link>
          </div>
          <LeagueTable rows={standings} compact />
        </section>

        {/* ── Featured players ───────────────────────────────── */}
        {featuredPlayers.length > 0 && (
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div className="section-head">
              <h2 style={{ fontSize: 26 }}>Players to Watch</h2>
              <Link href="/players" className="btn btn-ghost">All players &rarr;</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
              {featuredPlayers.map((p: any) => <PlayerCard key={p.id} player={p} />)}
            </div>
          </section>
        )}

        {/* ── News ───────────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div className="section-head">
            <h2 style={{ fontSize: 26 }}>Latest News</h2>
            <Link href="/news" className="btn btn-ghost">All news &rarr;</Link>
          </div>
          {!featuredStory ? (
            <EmptyState title="No stories published yet" />
          ) : (
            <>
              <Link
                href={`/news/${featuredStory.slug || featuredStory.id}`}
                className="grid grid-cols-1 md:grid-cols-2"
                style={{ gap: 'var(--space-6)', alignItems: 'center', color: 'inherit', textDecoration: 'none', marginBottom: 'var(--space-6)' }}
              >
                {featuredStory.featuredImageUrl ? (
                  <img src={featuredStory.featuredImageUrl} alt="" className="media-16x9 plate" />
                ) : (
                  <div className="plate" style={{ aspectRatio: '16 / 9' }}><PitchMotif /></div>
                )}
                <div>
                  <p className="eyebrow">{featuredStory.category || 'League News'}</p>
                  <h3 style={{ fontWeight: 400, fontSize: 28, margin: '0 0 var(--space-2)' }}>{featuredStory.title}</h3>
                  <p className="text-muted">
                    {String(featuredStory.message).slice(0, 220)}
                    {String(featuredStory.message).length > 220 ? '…' : ''}
                  </p>
                  <p className="card-meta">{formatDate(featuredStory.startDate)}</p>
                  <span className="btn btn-ghost" style={{ padding: 0 }}>Read more &rarr;</span>
                </div>
              </Link>

              {moreNews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
                  {moreNews.map((article) => <NewsCard key={article.id} article={article} />)}
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Sponsors ───────────────────────────────────────── */}
        {sponsors.length > 0 && (
          <section>
            <div className="section-head">
              <h2 style={{ fontSize: 26 }}>Our Partners</h2>
              <Link href="/sponsors" className="btn btn-ghost">All partners &rarr;</Link>
            </div>
            <div className="logo-grid">
              {sponsors.slice(0, 5).map((s) => <SponsorCard key={s.id} sponsor={s} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
