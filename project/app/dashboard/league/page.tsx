'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/auth-service';

export default function LeagueManagerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboard('League Manager');
        setData(response.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="p-8 md:p-0">
      <div className="md:p-8">
        <h1 className="text-3xl font-bold mb-8">League Manager Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Upcoming Fixtures</p>
                <p className="text-4xl font-bold">{data?.upcomingFixtures || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Pending Reports</p>
                <p className="text-4xl font-bold text-orange-600">{data?.pendingReports || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Registered Players</p>
                <p className="text-4xl font-bold">{data?.registeredPlayers || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Disciplinary Cases</p>
                <p className="text-4xl font-bold text-red-600">{data?.disciplinaryCases || 0}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border rounded hover:bg-gray-50 transition">
                  Create Fixture
                </button>
                <button className="p-4 border rounded hover:bg-gray-50 transition">
                  Approve Players
                </button>
                <button className="p-4 border rounded hover:bg-gray-50 transition">
                  Generate Report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
