import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const [fixtures, total] = await Promise.all([
      prisma.fixture.findMany({
        where: { status: 'UPCOMING' },
        include: { homeClub: true, awayClub: true, venue: true, refereeAssignment: { include: { referee: true } } },
        orderBy: { fixtureDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.fixture.count({ where: { status: 'UPCOMING' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: fixtures,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch fixtures' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { homeClubId, awayClubId, venueId, fixtureDate, kickoffTime } = body;

    if (!homeClubId || !awayClubId || !fixtureDate) {
      return NextResponse.json(
        { success: false, error: 'homeClubId, awayClubId and fixtureDate are required' },
        { status: 400 }
      );
    }
    if (homeClubId === awayClubId) {
      return NextResponse.json({ success: false, error: 'A club cannot play itself' }, { status: 400 });
    }

    const fixture = await prisma.fixture.create({
      data: {
        homeClubId,
        awayClubId,
        venueId: venueId || null,
        fixtureDate: new Date(fixtureDate),
        kickoffTime: kickoffTime || null,
      },
      include: { homeClub: true, awayClub: true, venue: true },
    });

    return NextResponse.json({ success: true, data: fixture }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create fixture' },
      { status: 500 }
    );
  }
}
