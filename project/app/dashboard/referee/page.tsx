'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/auth-service';

export default function RefereeDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboard('Referee');
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
        <h1 className="text-3xl font-bold mb-8">Referee Dashboard</h1>

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
                <p className="text-gray-600 mb-2">Assigned Matches</p>
                <p className="text-4xl font-bold">{data?.assignedMatches || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Pending Reports</p>
                <p className="text-4xl font-bold text-orange-600">{data?.pendingReports || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Average Rating</p>
                <p className="text-4xl font-bold text-yellow-600">{data?.avgRating || '4.5'} ⭐</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Matches Officiated</p>
                <p className="text-4xl font-bold">{data?.matchesOfficiated || 0}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">Upcoming Assignments</h2>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                    <div>
                      <p className="font-semibold">Team A vs Team B</p>
                      <p className="text-sm text-gray-600">Stadium • {i + 2} days</p>
                    </div>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
