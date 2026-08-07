'use client';

import { useEffect, useState } from 'react';
import { getPlayers } from '@/lib/public-api';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const response = await getPlayers(page, 16);
        setPlayers(response.data?.players || []);
        setTotal(response.data?.pagination?.total || 0);
      } catch (error) {
        console.error('Error loading players:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [page]);

  const totalPages = Math.ceil(total / 16);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Players Directory</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-40 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {players.map((player: any) => (
              <div key={player.id} className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition text-center">
                <div className="h-32 bg-gray-100 flex items-center justify-center">
                  <img 
                    src={player.photo || '/placeholder.png'} 
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1">{player.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{player.position}</p>
                  <p className="text-sm text-gray-600">{player.club}</p>
                  <p className="text-sm font-bold mt-2 text-green-600">#{player.jerseyNumber}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
