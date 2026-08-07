import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;
    const skip = (page - 1) * limit;

    const clubs = await prisma.club.findMany({
      include: {
        league: true,
        homeFixtures: { where: { status: 'completed' } },
        awayFixtures: { where: { status: 'completed' } },
      },
      skip,
      take: limit,
    });

    const total = await prisma.club.count();

    const clubsWithStats = clubs.map(club => ({
      ...club,
      statistics: {
        homeMatches: club.homeFixtures.length,
        awayMatches: club.awayFixtures.length,
        totalMatches: club.homeFixtures.length + club.awayFixtures.length,
      },
    }));

    return Response.json({
      success: true,
      data: clubsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch clubs' },
      { status: 500 }
    );
  }
}
