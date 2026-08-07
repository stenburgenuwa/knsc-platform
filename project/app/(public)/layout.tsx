'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-600">
            KNSCL
          </Link>
          
          <nav className="hidden md:flex gap-8">
            <Link href="/fixtures" className="text-gray-700 hover:text-green-600">Fixtures</Link>
            <Link href="/results" className="text-gray-700 hover:text-green-600">Results</Link>
            <Link href="/standings" className="text-gray-700 hover:text-green-600">Standings</Link>
            <Link href="/clubs" className="text-gray-700 hover:text-green-600">Clubs</Link>
            <Link href="/players" className="text-gray-700 hover:text-green-600">Players</Link>
            <Link href="/news" className="text-gray-700 hover:text-green-600">News</Link>
            <Link href="/login" className="bg-green-600 text-white px-4 py-2 rounded">Sign In</Link>
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="flex flex-col gap-4 p-4">
              <Link href="/fixtures" className="text-gray-700 hover:text-green-600">Fixtures</Link>
              <Link href="/results" className="text-gray-700 hover:text-green-600">Results</Link>
              <Link href="/standings" className="text-gray-700 hover:text-green-600">Standings</Link>
              <Link href="/clubs" className="text-gray-700 hover:text-green-600">Clubs</Link>
              <Link href="/players" className="text-gray-700 hover:text-green-600">Players</Link>
              <Link href="/news" className="text-gray-700 hover:text-green-600">News</Link>
              <Link href="/login" className="bg-green-600 text-white px-4 py-2 rounded">Sign In</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">KNSCL</h3>
              <p className="text-gray-400">Kenya National Sub County League</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/fixtures">Fixtures</Link></li>
                <li><Link href="/standings">Standings</Link></li>
                <li><Link href="/clubs">Clubs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400">Email: info@knscl.co.ke</p>
              <p className="text-gray-400">Phone: +254 XXX XXX XXX</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 KNSCL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
