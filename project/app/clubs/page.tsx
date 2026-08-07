'use client';

import Link from 'next/link';

export default function ClubsPage() {
  const clubs = [
    { id: 1, name: 'City FC', location: 'Nairobi', founded: 2010 },
    { id: 2, name: 'Rangers FC', location: 'Mombasa', founded: 2005 },
    { id: 3, name: 'United FC', location: 'Kisumu', founded: 2012 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Clubs</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div key={club.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">{club.name}</h3>
              <p className="text-gray-600 mb-1">📍 {club.location}</p>
              <p className="text-gray-600">Founded: {club.founded}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
