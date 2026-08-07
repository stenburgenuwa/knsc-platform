import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      prisma.fixture.findMany({
        where: { status: 'COMPLETED' },
        include: { homeClub: true, awayClub: true, venue: true },
        orderBy: { fixtureDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.fixture.count({ where: { status: 'COMPLETED' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: results,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
