'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';

// Fourteen destinations is more than a single row can carry, so the primary
// competition links stay inline on desktop and the rest live under "More".
const PRIMARY = [
  { label: 'Fixtures', href: '/fixtures' },
  { label: 'Results', href: '/results' },
  { label: 'Table', href: '/table' },
  { label: 'Clubs', href: '/clubs' },
  { label: 'Players', href: '/players' },
  { label: 'News', href: '/news' },
];

const SECONDARY = [
  { label: 'Statistics', href: '/statistics' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const close = () => {
    setMobileOpen(false);
    setMoreOpen(false);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Link href="/" className="nav-brand" style={{ textDecoration: 'none', color: 'inherit', marginRight: 'auto', lineHeight: 1.1 }}>
          <span style={{ display: 'block', fontSize: 18 }}>Kilifi North</span>
          <span className="eyebrow" style={{ margin: 0 }}>Sub County League</span>
        </Link>

        <nav className="hidden lg:flex" aria-label="Main" style={{ gap: 'var(--space-4)', alignItems: 'center' }}>
          {PRIMARY.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? 'page' : undefined}
              style={{ color: isCurrent(link.href) ? 'var(--color-accent)' : 'inherit', textDecoration: 'none', fontSize: 14 }}
            >
              {link.label}
            </Link>
          ))}

          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen(!moreOpen)}
              style={{ fontSize: 14 }}
            >
              More
            </button>
            {moreOpen && (
              <div
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 4, minWidth: 180,
                  background: 'var(--color-surface)', border: '1px solid var(--color-divider)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: 'var(--space-2)',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}
              >
                {SECONDARY.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)', color: 'inherit', textDecoration: 'none', fontSize: 14 }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Plain GET form — search works with JavaScript disabled. */}
        <form action="/search" method="get" role="search" className="hidden md:flex" style={{ gap: 4 }}>
          <label htmlFor="site-search" className="sr-only">Search the site</label>
          <input id="site-search" name="q" type="search" className="input" placeholder="Search…" style={{ maxWidth: 150 }} />
          <button type="submit" className="btn btn-icon" aria-label="Search">
            <Search size={16} />
          </button>
        </form>

        <Link href="/login" className="btn btn-primary hidden sm:inline-flex">Sign In</Link>

        <button
          className="btn btn-icon lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden" style={{ borderTop: '1px solid var(--color-divider)', maxHeight: '70vh', overflowY: 'auto' }}>
          <nav aria-label="Mobile" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-3) var(--space-4)' }}>
            <form action="/search" method="get" role="search" style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-3)' }}>
              <label htmlFor="mobile-search" className="sr-only">Search the site</label>
              <input id="mobile-search" name="q" type="search" className="input" placeholder="Search players, clubs, news…" />
              <button type="submit" className="btn btn-secondary" aria-label="Search"><Search size={16} /></button>
            </form>
            {[...PRIMARY, ...SECONDARY].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
                style={{
                  padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)',
                  color: isCurrent(link.href) ? 'var(--color-accent)' : 'inherit', textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="btn btn-primary" onClick={close} style={{ marginTop: 'var(--space-3)' }}>Sign In</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
