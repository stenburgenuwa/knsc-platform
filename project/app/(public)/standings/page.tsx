'use client';

import { useEffect, useState } from 'react';
import { getStandings } from '@/lib/public-api';
import Avatar from '@/components/Avatar';
import { SkeletonRows } from '@/components/Skeleton';

export default function StandingsPage() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await getStandings();
        setStandings(response.data?.data?.standings || []);
      } catch (error) {
        console.error('Error loading standings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>League Standings</h1>

      {!loading && standings.length === 0 && <p className="text-muted">Standings will appear once fixtures are completed.</p>}

      {(loading || standings.length > 0) && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Club</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows rows={8} cols={10} />}
              {standings.map((team: any, index: number) => {
                const played = Number(team.played || 0);
                const won = Number(team.won || 0);
                const drawn = Number(team.drawn || 0);
                const lost = Number(team.lost || 0);
                const goalsFor = Number(team.goalsFor || 0);
                const goalsAgainst = Number(team.goalsAgainst || 0);
                return (
                  <tr key={team.id}>
                    <td>{team.position || index + 1}</td>
                    <td style={{ fontFamily: 'var(--font-heading)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Avatar src={team.logoUrl} name={team.clubName || team.name} size={24} rounded="soft" />
                        {team.clubName || team.name}
                      </span>
                    </td>
                    <td>{played}</td>
                    <td>{won}</td>
                    <td>{drawn}</td>
                    <td>{lost}</td>
                    <td>{goalsFor}</td>
                    <td>{goalsAgainst}</td>
                    <td>{goalsFor - goalsAgainst}</td>
                    <td style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}>
                      {team.points ?? won * 3 + drawn}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
