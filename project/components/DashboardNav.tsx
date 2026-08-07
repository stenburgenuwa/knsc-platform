'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { DASHBOARD_BY_LABEL } from '@/lib/roles';

// Each role currently has exactly one dashboard page that holds its stats
// and all its forms/actions inline — no separate sub-pages exist yet, so the
// nav only ever links to that one real route (plus the public site).
function navLinksFor(role: string): { label: string; href: string }[] {
  const dashboardHref = DASHBOARD_BY_LABEL[role];
  const links = dashboardHref ? [{ label: 'Dashboard', href: dashboardHref }] : [];
  return [...links, { label: 'Public Site', href: '/' }];
}

function NavLinks({
  links,
  pathname,
  onNavigate,
}: {
  links: { label: string; href: string }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          aria-current={pathname === link.href ? 'page' : undefined}
          style={{
            display: 'block',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            color: pathname === link.href ? 'var(--color-accent-300)' : 'var(--color-surface)',
            background: pathname === link.href ? 'color-mix(in srgb, var(--color-accent) 20%, transparent)' : 'transparent',
            textDecoration: 'none',
            fontFamily: 'var(--font-heading)',
            fontSize: 14,
          }}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

export default function DashboardNav() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const currentRole = user?.roles?.[0] || 'Public';
  const links = navLinksFor(currentRole);

  const railStyle: React.CSSProperties = {
    background: 'var(--color-neutral-900)',
    color: 'var(--color-surface)',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex" style={{ ...railStyle, width: 240 }}>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid color-mix(in srgb, var(--color-surface) 20%, transparent)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, margin: 0 }}>Kilifi North SCL</p>
          <p className="text-muted" style={{ fontSize: 12, marginTop: 'var(--space-1)' }}>{currentRole}</p>
        </div>

        <nav style={{ flex: 1, padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <NavLinks links={links} pathname={pathname} />
        </nav>

        <div style={{ padding: 'var(--space-3)', borderTop: '1px solid color-mix(in srgb, var(--color-surface) 20%, transparent)' }}>
          <button
            onClick={handleLogout}
            className="btn"
            style={{ color: 'var(--color-surface)', width: '100%', justifyContent: 'flex-start', gap: 'var(--space-2)' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile */}
      <div className="md:hidden" style={{ ...railStyle, height: 56, flexDirection: 'row', alignItems: 'center', padding: '0 var(--space-4)' }}>
        <button
          className="btn btn-icon"
          style={{ color: 'var(--color-surface)', marginRight: 'var(--space-3)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Kilifi North SCL</p>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden"
          style={{ ...railStyle, position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, zIndex: 40, overflowY: 'auto' }}
        >
          <nav style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <NavLinks links={links} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </nav>
          <div style={{ padding: 'var(--space-3)', borderTop: '1px solid color-mix(in srgb, var(--color-surface) 20%, transparent)' }}>
            <button
              onClick={handleLogout}
              className="btn"
              style={{ color: 'var(--color-surface)', width: '100%', justifyContent: 'flex-start', gap: 'var(--space-2)' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
