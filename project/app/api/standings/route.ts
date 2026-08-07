import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeStandings } from '@/lib/standings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [clubs, completedFixtures, topScorers] = await Promise.all([
      prisma.club.findMany({ orderBy: { name: 'asc' } }),
      prisma.fixture.findMany({ where: { status: 'COMPLETED' } }),
      prisma.player.findMany({
        where: { approved: true, goals: { gt: 0 } },
        include: { club: true },
        orderBy: { goals: 'desc' },
        take: 10,
      }),
    ]);

    const standings = computeStandings(clubs, completedFixtures);

    const scorers = topScorers.map((player) => ({
      id: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      clubName: player.club.name,
      goals: player.goals,
    }));

    return NextResponse.json({
      success: true,
      data: { standings, topScorers: scorers },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}
