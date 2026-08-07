'use client';

import { useEffect, useState } from 'react';
import { getFixtures } from '@/lib/public-api';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchFixtures = async () => {
      setLoading(true);
      try {
        const response = await getFixtures(page, 12);
        setFixtures(response.data?.fixtures || []);
        setTotal(response.data?.pagination?.total || 0);
      } catch (error) {
        console.error('Error loading fixtures:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, [page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Fixtures</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-40 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {fixtures.map((fixture: any) => (
              <div key={fixture.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition">
                <p className="text-sm text-gray-500 mb-2">{fixture.date}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center flex-1">
                    <img 
                      src={fixture.homeClub?.logo || '/placeholder.png'} 
                      alt="" 
                      className="w-8 h-8 mx-auto mb-1 rounded"
                    />
                    <p className="font-semibold text-sm">{fixture.homeClub?.name}</p>
                  </div>
                  <p className="text-xl font-bold text-gray-300 mx-2">vs</p>
                  <div className="text-center flex-1">
                    <img 
                      src={fixture.awayClub?.logo || '/placeholder.png'} 
                      alt="" 
                      className="w-8 h-8 mx-auto mb-1 rounded"
                    />
                    <p className="font-semibold text-sm">{fixture.awayClub?.name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mb-1">{fixture.venue}</p>
                <p className="text-sm text-gray-600 text-center">{fixture.kickoffTime}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 rounded"
            >
              <FiChevronLeft />
            </button>
            <span className="text-gray-600">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 rounded"
            >
              <FiChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
