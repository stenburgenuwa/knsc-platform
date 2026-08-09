import Link from 'next/link';
import { getClubsRegister } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState } from '@/components/public';
import { ClubRegister } from '@/components/public/clubs';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Clubs | Kilifi North Sub County League',
  description: 'Every club competing in the Kilifi North Sub County League — crests, home grounds and squads.',
  path: '/clubs',
});

/*
  The league register — see KNSCL_CLUBS_UX_VISUAL_DIRECTION.md.

  Three parts, one of which is a single line. The page is deliberately short in
  structure and long in content, which is what stops it reading as a copy of the
  homepage's five-section narrative.

    HEAD      compact. no hero. the first record sits in the first screen.
    REGISTER  the page. one ruled record per club.
    FOOT      one quiet line onward.
*/
export default async function ClubsPage() {
  const { register, active, total } = await getClubsRegister();

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Clubs', href: '/clubs' }]} />

      {/* ── Head ─────────────────────────────────────────────────── */}
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            gap: 'var(--space-4)', flexWrap: 'wrap',
            paddingBottom: 'var(--space-2)', borderBottom: '2px solid var(--color-ink)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 'clamp(30px, 4vw, 40px)' }}>Clubs</h1>
          <span className="home-figure-label" style={{ marginTop: 0 }}>
            {total} {total === 1 ? 'club' : 'clubs'}
          </span>
        </div>
        <p className="text-muted" style={{ fontSize: 16, marginTop: 'var(--space-3)', maxWidth: '58ch' }}>
          {active
            ? `Every club competing in the Kilifi North Sub County League this season, ordered by league position.`
            : `Every club registered for the Kilifi North Sub County League this season, listed alphabetically until the first match is played.`}
        </p>
      </header>

      {/* ── Register ─────────────────────────────────────────────── */}
      {register.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 15 }}>
          Clubs will be listed here once the league office registers them.
        </p>
      ) : (
        <ClubRegister clubs={register} active={active} />
      )}

      {/* ── Foot ─────────────────────────────────────────────────── */}
      {register.length > 0 && (
        <p
          style={{
            display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap',
            marginTop: 'var(--space-6)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
          }}
        >
          <Link href="/players">Every registered player &rarr;</Link>
          {active && <Link href="/table">Full league table &rarr;</Link>}
          <Link href="/fixtures">Fixtures &rarr;</Link>
        </p>
      )}
    </div>
  );
}
