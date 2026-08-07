'use client';

import { useEffect, useState } from 'react';

export default function StandingsPage() {
  const [standings, setStandings] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStandings() {
      try {
        const res = await fetch('/api/standings');
        if (res.ok) {
          const data = await res.json();
          setStandings(data.data.standings || []);
          setTopScorers(data.data.topScorers || []);
        }
      } catch (error) {
        console.error('Error loading standings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStandings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">📊 League Standings</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {standings.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-12">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Pos</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Club</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">P</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">W</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">D</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">L</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">GF</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">GA</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-700">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((club: any, index: number) => (
                      <tr key={club.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 font-bold text-blue-600">{index + 1}</td>
                        <td className="px-6 py-3">{club.name}</td>
                        <td className="px-6 py-3 text-center">{club.played || 0}</td>
                        <td className="px-6 py-3 text-center">{club.won || 0}</td>
                        <td className="px-6 py-3 text-center">{club.drawn || 0}</td>
                        <td className="px-6 py-3 text-center">{club.lost || 0}</td>
                        <td className="px-6 py-3 text-center">{club.goalsFor || 0}</td>
                        <td className="px-6 py-3 text-center">{club.goalsAgainst || 0}</td>
                        <td className="px-6 py-3 text-center font-bold text-green-600">{(club.won || 0) * 3 + (club.drawn || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-12 rounded-lg text-center text-gray-500 mb-12">No standings data</div>
            )}

            {topScorers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">🏆 Top Scorers</h2>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Pos</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Player</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Club</th>
                        <th className="px-6 py-3 text-center font-semibold text-gray-700">Goals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topScorers.map((scorer: any, index: number) => (
                        <tr key={scorer.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 font-bold text-blue-600">{index + 1}</td>
                          <td className="px-6 py-3">{scorer.name}</td>
                          <td className="px-6 py-3">{scorer.club?.name}</td>
                          <td className="px-6 py-3 text-center font-bold text-green-600">{scorer.goals}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
