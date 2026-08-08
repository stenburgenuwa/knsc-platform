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
      <PublicNav />

      <main id="main" style={{ flex: 1 }}>{children}</main>

      <footer style={{ borderTop: '1px solid var(--color-divider)', marginTop: 'var(--space-8)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4" style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-4)', gap: 'var(--space-6)' }}>
          <div>
            <h4 style={{ marginBottom: 'var(--space-1)' }}>Kilifi North SCL</h4>
            <p className="text-muted" style={{ fontSize: 13 }}>
              {content['league.tagline'] || 'The official home of Kilifi North Sub County League football.'}
            </p>
            {content['league.season'] && <span className="tag tag-neutral">Season {content['league.season']}</span>}
          </div>

          <nav aria-label="Competition">
            <h6 style={{ marginBottom: 'var(--space-3)' }}>Competition</h6>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 14 }}>
              <li><Link href="/fixtures">Fixtures</Link></li>
              <li><Link href="/results">Results</Link></li>
              <li><Link href="/table">League Table</Link></li>
              <li><Link href="/statistics">Statistics</Link></li>
            </ul>
          </nav>

          <nav aria-label="League">
            <h6 style={{ marginBottom: 'var(--space-3)' }}>League</h6>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 14 }}>
              <li><Link href="/clubs">Clubs</Link></li>
              <li><Link href="/players">Players</Link></li>
              <li><Link href="/news">News</Link></li>
              <li><Link href="/downloads">Downloads</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </nav>

          <div>
            <h6 style={{ marginBottom: 'var(--space-3)' }}>Contact</h6>
            <address style={{ fontStyle: 'normal', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {content['contact.address'] && <span className="text-muted">{content['contact.address']}</span>}
              {content['contact.email'] && <a href={`mailto:${content['contact.email']}`}>{content['contact.email']}</a>}
              {content['contact.phone'] && <a href={`tel:${content['contact.phone'].replace(/\s+/g, '')}`}>{content['contact.phone']}</a>}
              {!content['contact.email'] && !content['contact.phone'] && (
                <Link href="/contact">Get in touch</Link>
              )}
            </address>
            {socials.length > 0 && (
              <ul style={{ listStyle: 'none', margin: 'var(--space-3) 0 0', padding: 0, display: 'flex', gap: 'var(--space-3)', fontSize: 14 }}>
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="hr" style={{ margin: 0 }} />
        <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)', margin: 0, fontSize: 13 }}>
          &copy; {new Date().getFullYear()} Kilifi North Sub County League. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
