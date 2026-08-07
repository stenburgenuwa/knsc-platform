import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const news = await prisma.announcement.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.announcement.count();

    return Response.json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
