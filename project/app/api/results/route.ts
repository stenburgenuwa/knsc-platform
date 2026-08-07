import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;
    const skip = (page - 1) * limit;

    const results = await prisma.fixture.findMany({
      where: { status: 'completed' },
      include: {
        homeClub: true,
        awayClub: true,
        matchReport: true,
      },
      skip,
      take: limit,
      orderBy: { kickoffTime: 'desc' },
    });

    const total = await prisma.fixture.count({
      where: { status: 'completed' },
    });

    return Response.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
