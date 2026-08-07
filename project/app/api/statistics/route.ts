import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM Club) as clubs,
        (SELECT COUNT(*) FROM Player WHERE approved = true) as players,
        (SELECT COUNT(*) FROM Fixture WHERE status = 'completed') as matches,
        COALESCE(SUM(homeScore + awayScore), 0) as goals
      FROM Fixture
      WHERE status = 'completed'
    `;

    const topScorer = await prisma.player.findFirst({
      where: { approved: true },
      orderBy: { goals: 'desc' },
      include: { club: true },
    });

    const leaderClub = await prisma.club.findFirst({
      orderBy: { wins: 'desc' },
    });

    return Response.json({
      success: true,
      data: {
        statistics: stats?.[0] || { clubs: 0, players: 0, matches: 0, goals: 0 },
        topScorer,
        leaderClub,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
