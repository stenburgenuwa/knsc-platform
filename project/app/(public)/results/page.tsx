'use client';

import { useEffect, useState } from 'react';
import { getResults } from '@/lib/public-api';

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await getResults(page, 12);
        setResults(response.data?.results || []);
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Results</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result: any) => (
            <div key={result.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition">
              <p className="text-sm text-gray-500 mb-4">{result.date}</p>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{result.homeClub?.name}</p>
                </div>
                <div className="mx-8 text-center">
                  <p className="text-4xl font-bold">{result.homeScore}</p>
                  <p className="text-gray-500">-</p>
                  <p className="text-4xl font-bold">{result.awayScore}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-semibold">{result.awayClub?.name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">{result.venue}</p>
              {result.hasMatchReport && (
                <div className="mt-4 text-center">
                  <a href={`/match-report/${result.id}`} className="text-green-600 hover:underline text-sm">
                    View Match Report →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
