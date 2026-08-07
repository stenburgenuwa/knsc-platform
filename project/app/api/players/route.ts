import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 16;
    const skip = (page - 1) * limit;

    const players = await prisma.player.findMany({
      where: { approved: true },
      include: { club: true },
      skip,
      take: limit,
    });

    const total = await prisma.player.count({
      where: { approved: true },
    });

    return Response.json({
      success: true,
      data: players,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch players' },
      { status: 500 }
    );
  }
}
