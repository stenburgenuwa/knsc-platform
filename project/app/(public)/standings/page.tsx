'use client';

import { useEffect, useState } from 'react';
import { getStandings } from '@/lib/public-api';

export default function StandingsPage() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await getStandings();
        setStandings(response.data?.standings || []);
      } catch (error) {
        console.error('Error loading standings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">League Standings</h1>

      {loading ? (
        <div className="bg-gray-200 h-96 rounded animate-pulse"></div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Pos</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Team</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">P</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">W</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">D</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">L</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">GF</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">GA</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">GD</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team: any) => (
                  <tr key={team.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold">{team.position}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={team.clubLogo || '/placeholder.png'} alt="" className="w-6 h-6 rounded" />
                        <span className="font-semibold">{team.clubName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{team.played}</td>
                    <td className="px-4 py-3 text-center">{team.won}</td>
                    <td className="px-4 py-3 text-center">{team.drawn}</td>
                    <td className="px-4 py-3 text-center">{team.lost}</td>
                    <td className="px-4 py-3 text-center">{team.goalsFor}</td>
                    <td className="px-4 py-3 text-center">{team.goalsAgainst}</td>
                    <td className="px-4 py-3 text-center">{team.goalDifference}</td>
                    <td className="px-4 py-3 text-center font-bold text-lg">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
