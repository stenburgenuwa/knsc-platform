import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [clubs, players, completedFixtures, topScorer] = await Promise.all([
      prisma.club.count(),
      prisma.player.count({ where: { approved: true } }),
      prisma.fixture.findMany({ where: { status: 'COMPLETED' }, select: { homeScore: true, awayScore: true } }),
      prisma.player.findFirst({
        where: { approved: true },
        orderBy: { goals: 'desc' },
        include: { club: true },
      }),
    ]);

    const goals = completedFixtures.reduce((sum, f) => sum + (f.homeScore ?? 0) + (f.awayScore ?? 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        statistics: { clubs, players, matches: completedFixtures.length, goals },
        topScorer,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
