'use client';

import { useEffect, useState } from 'react';
import { getClubs } from '@/lib/public-api';

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await getClubs(1, 12);
        setClubs(response.data?.clubs || []);
      } catch (error) {
        console.error('Error loading clubs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Clubs Directory</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-48 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club: any) => (
            <div key={club.id} className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition">
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                <img 
                  src={club.banner || '/placeholder.png'} 
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2">{club.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Home Ground:</strong> {club.homeGround}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Manager:</strong> {club.manager}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Founded:</strong> {club.founded}
                </p>
                <div className="mt-4">
                  <a href={`/clubs/${club.id}`} className="text-green-600 hover:underline text-sm">
                    View Profile →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
