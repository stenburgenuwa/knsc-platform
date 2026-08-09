'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';

// Fourteen destinations is more than a single row can carry. The split is by
// what a fan comes for: the competition itself stays inline, the league's
// institutional pages sit under "More".
const COMPETITION = [
  { label: 'Fixtures', href: '/fixtures' },
  { label: 'Results', href: '/results' },
  { label: 'Table', href: '/table' },
  { label: 'Clubs', href: '/clubs' },
  { label: 'Players', href: '/players' },
  { label: 'Stats', href: '/statistics' },
  { label: 'News', href: '/news' },
];

const LEAGUE = [
  { label: 'Gallery', href: '/gallery' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicNav({ season }: { season?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const close = () => {
    setMobileOpen(false);
    setMoreOpen(false);
  };

  return (
    <header className="masthead">
      <div className="masthead-utility">
        <div className="masthead-utility-inner">
          <span>{season ? `Season ${season}` : 'Kilifi County · Kenya'}</span>
          <span style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Sign In</Link>
          </span>
        </div>
      </div>

      <div className="masthead-main">
        <Link href="/" className="wordmark" onClick={close}>
          <span className="wordmark-mark" aria-hidden="true">KN</span>
          <span className="wordmark-text">
            <span className="wordmark-name">Kilifi North</span>
            <span className="wordmark-sub">Sub County League</span>
          </span>
        </Link>

        <nav className="masthead-nav" aria-label="Main">
          {COMPETITION.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              aria-current={isCurrent(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}

          <div style={{ position: 'relative', display: 'flex' }}>
            <button
              type="button"
              className="nav-link"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen(!moreOpen)}
            >
              More
            </button>
            {moreOpen && (
              <div className="nav-menu">
                {LEAGUE.map((link) => (
                  <Link key={link.href} href={link.href} onClick={close}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Plain GET form — search works with JavaScript disabled. */}
        <form action="/search" method="get" role="search" className="masthead-search">
          <label htmlFor="site-search" className="sr-only">Search the site</label>
          <Search size={14} aria-hidden="true" />
          <input id="site-search" name="q" type="search" placeholder="Search" />
        </form>

        <button
          type="button"
          className="masthead-toggle"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="masthead-drawer">
          <nav className="masthead-drawer-inner" aria-label="Mobile">
            <form action="/search" method="get" role="search" style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-2)' }}>
              <label htmlFor="mobile-search" className="sr-only">Search the site</label>
              <input id="mobile-search" name="q" type="search" className="input" placeholder="Search players, clubs, news…" />
              <button type="submit" className="btn btn-primary" aria-label="Search"><Search size={16} /></button>
            </form>

            <p className="drawer-group">Competition</p>
            {COMPETITION.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="drawer-link"
                onClick={close}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}

            <p className="drawer-group">The League</p>
            {LEAGUE.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="drawer-link"
                onClick={close}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}

            <Link href="/login" className="btn btn-primary" onClick={close} style={{ marginTop: 'var(--space-4)', width: '100%', justifyContent: 'center' }}>
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
