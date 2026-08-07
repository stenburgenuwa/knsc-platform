'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Fixtures', href: '/fixtures' },
  { label: 'Results', href: '/results' },
  { label: 'Standings', href: '/standings' },
  { label: 'Clubs', href: '/clubs' },
  { label: 'Players', href: '/players' },
  { label: 'News', href: '/news' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--color-bg)' }}>
        <div className="nav" style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-3) var(--space-4)' }}>
          <Link href="/" className="nav-brand">
            Kilifi North Sub County League
          </Link>

          <nav className="hidden md:flex" style={{ gap: 'var(--space-4)', alignItems: 'center' }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="btn btn-primary">
              Sign In
            </Link>
          </nav>

          <button
            className="btn btn-icon md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden" style={{ borderTop: '1px solid var(--color-divider)' }}>
            <nav
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
              }}
            >
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/login" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer style={{ borderTop: '1px solid var(--color-divider)', marginTop: 'var(--space-8)' }}>
        <div
          style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}
          className="grid grid-cols-1 md:grid-cols-4"
        >
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h4>Kilifi North SCL</h4>
            <p className="text-muted">Kilifi North Sub County League</p>
          </div>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h6 style={{ marginBottom: 'var(--space-3)' }}>Quick Links</h6>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li><Link href="/fixtures">Fixtures</Link></li>
              <li><Link href="/standings">Standings</Link></li>
              <li><Link href="/clubs">Clubs</Link></li>
            </ul>
          </div>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h6 style={{ marginBottom: 'var(--space-3)' }}>Follow Us</h6>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h6 style={{ marginBottom: 'var(--space-3)' }}>Contact</h6>
            <p className="text-muted" style={{ marginBottom: 'var(--space-1)' }}>Email: info@knscl.co.ke</p>
            <p className="text-muted">Phone: +254 XXX XXX XXX</p>
          </div>
        </div>
        <div className="hr" style={{ margin: 0 }} />
        <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)', margin: 0 }}>
          &copy; 2026 Kilifi North Sub County League. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
