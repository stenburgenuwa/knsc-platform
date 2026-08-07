'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/auth-service';
import { useAuthStore } from '@/store/auth';

export default function PlatformOwnerDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboard('Platform Owner');
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
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Total Leagues</p>
                <p className="text-4xl font-bold">{data?.totalLeagues || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Total Clubs</p>
                <p className="text-4xl font-bold">{data?.totalClubs || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Total Players</p>
                <p className="text-4xl font-bold">{data?.totalPlayers || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border">
                <p className="text-gray-600 mb-2">Pending Approvals</p>
                <p className="text-4xl font-bold text-orange-600">{data?.pendingApprovals || 0}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-semibold">Action {i + 1}</p>
                      <p className="text-sm text-gray-600">By Administrator</p>
                    </div>
                    <p className="text-sm text-gray-500">2 hours ago</p>
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
