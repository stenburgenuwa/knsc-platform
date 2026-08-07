'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">KNSCL Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Welcome, {user.email}!</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm font-medium">Fixtures</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">24</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm font-medium">Clubs</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">18</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm font-medium">Players</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">450</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm font-medium">Referees</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">35</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/fixtures" className="block bg-blue-50 hover:bg-blue-100 p-3 rounded">
                Manage Fixtures
              </Link>
              <Link href="/dashboard/clubs" className="block bg-purple-50 hover:bg-purple-100 p-3 rounded">
                Manage Clubs
              </Link>
              <Link href="/dashboard/players" className="block bg-green-50 hover:bg-green-100 p-3 rounded">
                Manage Players
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>✓ New fixture created</p>
              <p>✓ Player registration approved</p>
              <p>✓ Match report submitted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
