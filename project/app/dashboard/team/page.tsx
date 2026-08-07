'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/auth-service';

export default function TeamManagerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboard('Team Manager');
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
        <h1 className="text-3xl font-bold mb-8">Team Manager Dashboard</h1>

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
                <p className="text-gray-600 mb-2">Squad Size</p>
                <p className="text-4xl font-bold">{data?.squadSize || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Next Fixture</p>
                <p className="text-lg font-semibold">{data?.nextFixture || 'TBD'}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Wins</p>
                <p className="text-4xl font-bold text-green-600">{data?.wins || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Points</p>
                <p className="text-4xl font-bold text-blue-600">{data?.points || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-xl font-bold mb-4">Squad Management</h2>
                <ul className="space-y-2">
                  <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">View Squad</li>
                  <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">Register Player</li>
                  <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">Manage Team Sheet</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
                <ul className="space-y-2">
                  <li className="p-2 border-b">
                    <p className="font-semibold text-sm">Your Team 2 - 1 Opponent</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
