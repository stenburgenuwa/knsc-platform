import Link from 'next/link';
import PublicNav from '@/components/public/PublicNav';
import { getSiteContent } from '@/lib/public-data';
import { jsonLd, organizationSchema } from '@/lib/seo';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();

  const socials = [
    { label: 'Facebook', href: content['social.facebook'] },
    { label: 'X (Twitter)', href: content['social.twitter'] },
    { label: 'Instagram', href: content['social.instagram'] },
  ].filter((s) => s.href);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationSchema())} />

      <a href="#main" className="skip-link">Skip to main content</a>
      <PublicNav season={content['league.season']} />

      <main id="main" style={{ flex: 1 }}>{children}</main>

      {/* The footer closes the page on the same dark ground the masthead opens
          it on, so the site reads as one object rather than a stack of pages. */}
      <footer className="on-dark" style={{ marginTop: 'var(--space-8)' }}>
        <div className="bleed-inner" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-4)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--space-4) var(--space-6)' }}>
            <div className="col-span-2 md:col-span-1">
              <p className="wordmark-name" style={{ marginBottom: 6 }}>Kilifi North</p>
              <p className="wordmark-sub" style={{ marginBottom: 'var(--space-3)' }}>Sub County League</p>
              <p className="text-muted" style={{ fontSize: 13, maxWidth: 280 }}>
                {content['league.tagline'] || 'The official home of Kilifi North Sub County League football.'}
              </p>
            </div>

            <nav aria-label="Competition">
              <p className="drawer-group" style={{ marginTop: 0, marginBottom: 'var(--space-3)' }}>Competition</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 14 }}>
                <li><Link href="/fixtures">Fixtures</Link></li>
                <li><Link href="/results">Results</Link></li>
                <li><Link href="/table">League Table</Link></li>
                <li><Link href="/statistics">Statistics</Link></li>
              </ul>
            </nav>

            <nav aria-label="League">
              <p className="drawer-group" style={{ marginTop: 0, marginBottom: 'var(--space-3)' }}>The League</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 14 }}>
                <li><Link href="/clubs">Clubs</Link></li>
                <li><Link href="/players">Players</Link></li>
                <li><Link href="/news">News</Link></li>
                <li><Link href="/gallery">Gallery</Link></li>
                <li><Link href="/downloads">Downloads</Link></li>
                <li><Link href="/about">About</Link></li>
              </ul>
            </nav>

            <div>
              <p className="drawer-group" style={{ marginTop: 0, marginBottom: 'var(--space-3)' }}>Contact</p>
              <address style={{ fontStyle: 'normal', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {content['contact.address'] && <span className="text-muted">{content['contact.address']}</span>}
                {content['contact.email'] && <a href={`mailto:${content['contact.email']}`}>{content['contact.email']}</a>}
                {content['contact.phone'] && <a href={`tel:${content['contact.phone'].replace(/\s+/g, '')}`}>{content['contact.phone']}</a>}
                {!content['contact.email'] && !content['contact.phone'] && (
                  <Link href="/contact">Get in touch</Link>
                )}
              </address>
              {socials.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 'var(--space-3) 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', fontSize: 14 }}>
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgb(255 255 255 / 0.12)' }}>
          <div
            className="bleed-inner"
            style={{
              paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-2)',
              display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)',
              justifyContent: 'space-between', alignItems: 'center',
              fontSize: 12, color: 'rgb(255 255 255 / 0.55)',
            }}
          >
            <span>&copy; {new Date().getFullYear()} Kilifi North Sub County League</span>
            {content['league.season'] && <span>Season {content['league.season']}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
