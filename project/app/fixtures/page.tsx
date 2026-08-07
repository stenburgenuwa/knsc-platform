'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFixtures() {
      try {
        const res = await fetch('/api/fixtures?page=1');
        if (res.ok) {
          const data = await res.json();
          setFixtures(data.data || []);
        }
      } catch (error) {
        console.error('Error loading fixtures:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFixtures();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">📅 Upcoming Fixtures</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : fixtures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fixtures.map((fixture: any) => (
              <Link key={fixture.id} href={`/fixtures/${fixture.id}`}>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-blue-600">Round {fixture.round}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">UPCOMING</span>
                  </div>
                  <h3 className="font-bold mb-2">{fixture.homeClub?.name} vs {fixture.awayClub?.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">📍 {fixture.venue}</p>
                  <p className="text-sm text-gray-600 mb-3">⏰ {new Date(fixture.kickoffTime).toLocaleString()}</p>
                  {fixture.assignedReferee && (
                    <p className="text-xs text-gray-500">Referee: {fixture.assignedReferee.name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-12 rounded-lg text-center text-gray-500">No upcoming fixtures</div>
        )}
      </div>
    </div>
  );
}
