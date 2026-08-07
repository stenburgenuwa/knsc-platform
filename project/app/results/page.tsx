'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await fetch('/api/results?page=1');
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || []);
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">📊 Latest Results</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result: any) => (
              <Link key={result.id} href={`/results/${result.id}`}>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-green-600">Round {result.round}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">FINAL</span>
                  </div>
                  <h3 className="font-bold mb-4">{result.homeClub?.name} vs {result.awayClub?.name}</h3>
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-gray-800">
                      {result.homeScore} - {result.awayScore}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">📍 {result.venue}</p>
                  {result.matchReport && (
                    <p className="text-xs text-blue-600 mt-2">📄 Report available</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-12 rounded-lg text-center text-gray-500">No completed matches yet</div>
        )}
      </div>
    </div>
  );
}
