'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { FiLogOut, FiMenu } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardNav() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const navLinks: Record<string, { label: string; href: string }[]> = {
    'Platform Owner': [
      { label: 'Dashboard', href: '/dashboard/platform' },
      { label: 'Leagues', href: '/dashboard/platform/leagues' },
      { label: 'Clubs', href: '/dashboard/platform/clubs' },
      { label: 'Players', href: '/dashboard/platform/players' },
      { label: 'Reports', href: '/dashboard/platform/reports' },
    ],
    'League Manager': [
      { label: 'Dashboard', href: '/dashboard/league' },
      { label: 'Fixtures', href: '/dashboard/league/fixtures' },
      { label: 'Players', href: '/dashboard/league/players' },
      { label: 'Disciplinary', href: '/dashboard/league/disciplinary' },
      { label: 'Reports', href: '/dashboard/league/reports' },
    ],
    'Team Manager': [
      { label: 'Dashboard', href: '/dashboard/team' },
      { label: 'Squad', href: '/dashboard/team/squad' },
      { label: 'Team Sheet', href: '/dashboard/team/teamsheet' },
      { label: 'Fixtures', href: '/dashboard/team/fixtures' },
      { label: 'Statistics', href: '/dashboard/team/statistics' },
    ],
    'Referee': [
      { label: 'Dashboard', href: '/dashboard/referee' },
      { label: 'Assignments', href: '/dashboard/referee/assignments' },
      { label: 'Match Reports', href: '/dashboard/referee/reports' },
      { label: 'Profile', href: '/dashboard/referee/profile' },
    ],
  };

  const currentRole = user?.roles[0] || 'Public';
  const links = navLinks[currentRole] || [];

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">KNSCL</h1>
          <p className="text-sm text-gray-400 mt-1">{currentRole}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white h-16 flex items-center px-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mr-4"
        >
          <FiMenu size={24} />
        </button>
        <h1 className="text-2xl font-bold">KNSCL</h1>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-gray-900 text-white max-h-[calc(100vh-4rem)] overflow-y-auto z-40">
          <nav className="p-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 rounded hover:bg-gray-800 transition"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
