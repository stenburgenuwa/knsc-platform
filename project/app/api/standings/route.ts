import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const standings = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.name,
        c.logo,
        COUNT(CASE WHEN f.status = 'completed' AND (f.homeClubId = c.id OR f.awayClubId = c.id) THEN 1 END) as played,
        COUNT(CASE WHEN f.status = 'completed' AND 
          ((f.homeClubId = c.id AND f.homeScore > f.awayScore) OR 
           (f.awayClubId = c.id AND f.awayScore > f.homeScore)) THEN 1 END) as won,
        COUNT(CASE WHEN f.status = 'completed' AND f.homeScore = f.awayScore AND 
          (f.homeClubId = c.id OR f.awayClubId = c.id) THEN 1 END) as drawn,
        COUNT(CASE WHEN f.status = 'completed' AND 
          ((f.homeClubId = c.id AND f.homeScore < f.awayScore) OR 
           (f.awayClubId = c.id AND f.awayScore < f.homeScore)) THEN 1 END) as lost,
        COALESCE(SUM(CASE WHEN f.homeClubId = c.id THEN f.homeScore ELSE 0 END) +
                 SUM(CASE WHEN f.awayClubId = c.id THEN f.awayScore ELSE 0 END), 0) as goalsFor,
        COALESCE(SUM(CASE WHEN f.homeClubId = c.id THEN f.awayScore ELSE 0 END) +
                 SUM(CASE WHEN f.awayClubId = c.id THEN f.homeScore ELSE 0 END), 0) as goalsAgainst
      FROM Club c
      LEFT JOIN Fixture f ON (f.homeClubId = c.id OR f.awayClubId = c.id) AND f.status = 'completed'
      GROUP BY c.id, c.name, c.logo
      ORDER BY (COUNT(CASE WHEN f.status = 'completed' AND 
        ((f.homeClubId = c.id AND f.homeScore > f.awayScore) OR 
         (f.awayClubId = c.id AND f.awayScore > f.homeScore)) THEN 1 END) * 3 +
        COUNT(CASE WHEN f.status = 'completed' AND f.homeScore = f.awayScore AND 
        (f.homeClubId = c.id OR f.awayClubId = c.id) THEN 1 END)) DESC
    `;

    const topScorers = await prisma.player.findMany({
      where: { approved: true },
      select: {
        id: true,
        name: true,
        goals: true,
        club: { select: { name: true } },
      },
      orderBy: { goals: 'desc' },
      take: 10,
    });

    return Response.json({
      success: true,
      data: {
        standings: standings || [],
        topScorers,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}
