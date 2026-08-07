import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;
    const skip = (page - 1) * limit;

    const fixtures = await prisma.fixture.findMany({
      where: { status: 'upcoming' },
      include: {
        homeClub: true,
        awayClub: true,
        assignedReferee: true,
      },
      skip,
      take: limit,
      orderBy: { kickoffTime: 'asc' },
    });

    const total = await prisma.fixture.count({
      where: { status: 'upcoming' },
    });

    return Response.json({
      success: true,
      data: fixtures,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch fixtures' },
      { status: 500 }
    );
  }
}
