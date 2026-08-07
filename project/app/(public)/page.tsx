'use client';

import { useEffect, useState } from 'react';
import { getFixtures, getResults, getStandings, getTopScorers } from '@/lib/public-api';
import Link from 'next/link';

export default function HomePage() {
  const [upcomingFixtures, setUpcomingFixtures] = useState<any[]>([]);
  const [latestResults, setLatestResults] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fixtures, results, scorers] = await Promise.all([
          getFixtures(1, 3),
          getResults(1, 3),
          getTopScorers(5),
        ]);
        setUpcomingFixtures(fixtures.data?.fixtures || []);
        setLatestResults(results.data?.results || []);
        setTopScorers(scorers.data?.scorers || []);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Kenya National Sub County League
          </h1>
          <p className="text-xl text-green-100">
            Discover Kenya's premier sub-county football competition
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upcoming Fixtures */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Upcoming Fixtures</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingFixtures.map((fixture: any) => (
                <div key={fixture.id} className="bg-white border rounded-lg p-4 hover:shadow-lg transition">
                  <p className="text-sm text-gray-500 mb-2">{fixture.date}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center flex-1">
                      <p className="font-semibold">{fixture.homeClub?.name}</p>
                    </div>
                    <p className="text-xl font-bold text-gray-300 mx-2">vs</p>
                    <div className="text-center flex-1">
                      <p className="font-semibold">{fixture.awayClub?.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">{fixture.venue}</p>
                  <p className="text-sm text-gray-600 text-center">{fixture.kickoffTime}</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-6">
            <Link href="/fixtures" className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              View All Fixtures →
            </Link>
          </div>
        </section>

        {/* Latest Results */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Latest Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestResults.map((result: any) => (
              <div key={result.id} className="bg-white border rounded-lg p-4 hover:shadow-lg transition">
                <p className="text-sm text-gray-500 mb-2">{result.date}</p>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{result.homeClub?.name}</p>
                  </div>
                  <div className="mx-2 text-center">
                    <p className="text-2xl font-bold">{result.homeScore}</p>
                  </div>
                </div>
                <div className="border-t border-b py-2 mb-2 text-center text-gray-500">vs</div>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{result.awayClub?.name}</p>
                  </div>
                  <div className="mx-2 text-center">
                    <p className="text-2xl font-bold">{result.awayScore}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/results" className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              View All Results →
            </Link>
          </div>
        </section>

        {/* Top Scorers */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Top Scorers</h2>
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-left">Club</th>
                  <th className="px-4 py-3 text-center">Goals</th>
                </tr>
              </thead>
              <tbody>
                {topScorers.map((scorer: any, index: number) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{scorer.playerName}</td>
                    <td className="px-4 py-3">{scorer.clubName}</td>
                    <td className="px-4 py-3 text-center text-lg font-bold text-green-600">{scorer.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
