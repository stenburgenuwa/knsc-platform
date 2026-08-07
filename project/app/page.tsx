'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ clubs: 0, players: 0, matches: 0, goals: 0 });
  const [fixtures, setFixtures] = useState([]);
  const [results, setResults] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, fixturesRes, resultsRes, standingsRes] = await Promise.all([
          fetch('/api/statistics'),
          fetch('/api/fixtures?page=1'),
          fetch('/api/results?page=1'),
          fetch('/api/standings'),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data.statistics || {});
        }
        if (fixturesRes.ok) {
          const data = await fixturesRes.json();
          setFixtures(data.data || []);
        }
        if (resultsRes.ok) {
          const data = await resultsRes.json();
          setResults(data.data || []);
        }
        if (standingsRes.ok) {
          const data = await standingsRes.json();
          setTopScorers(data.data.topScorers || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">⚽ KNSCL Platform</h1>
          <p className="text-xl opacity-90">Kenya National Sub County League</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-3xl font-bold text-blue-600">{stats.clubs || 0}</h3>
            <p className="text-gray-600 mt-2">Clubs</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-3xl font-bold text-blue-600">{stats.players || 0}</h3>
            <p className="text-gray-600 mt-2">Players</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-3xl font-bold text-blue-600">{stats.matches || 0}</h3>
            <p className="text-gray-600 mt-2">Matches</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-3xl font-bold text-blue-600">{stats.goals || 0}</h3>
            <p className="text-gray-600 mt-2">Goals</p>
          </div>
        </div>

        {/* Upcoming Fixtures */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">📅 Upcoming Fixtures</h2>
          {fixtures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fixtures.slice(0, 3).map((fixture: any) => (
                <div key={fixture.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-blue-600">Round {fixture.round}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">UPCOMING</span>
                  </div>
                  <h3 className="font-bold mb-2">{fixture.homeClub?.name} vs {fixture.awayClub?.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">📍 {fixture.venue}</p>
                  <p className="text-sm text-gray-600">⏰ {new Date(fixture.kickoffTime).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">No upcoming fixtures</div>
          )}
        </div>

        {/* Latest Results */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">📊 Latest Results</h2>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.slice(0, 3).map((result: any) => (
                <div key={result.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-green-600">Round {result.round}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">FINAL</span>
                  </div>
                  <h3 className="font-bold mb-4">{result.homeClub?.name} vs {result.awayClub?.name}</h3>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-gray-800">
                      {result.homeScore} - {result.awayScore}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">📍 {result.venue}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">No completed matches yet</div>
          )}
        </div>

        {/* Top Scorers */}
        <div>
          <h2 className="text-3xl font-bold mb-6">🏆 Top Scorers</h2>
          {topScorers.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Position</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Player</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Club</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {topScorers.slice(0, 10).map((scorer: any, index: number) => (
                    <tr key={scorer.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 font-bold text-blue-600">{index + 1}</td>
                      <td className="px-6 py-3">{scorer.name}</td>
                      <td className="px-6 py-3">{scorer.club?.name}</td>
                      <td className="px-6 py-3 font-bold text-green-600">{scorer.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">No scorers yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
