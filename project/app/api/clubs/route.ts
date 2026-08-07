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

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        include: { homeVenue: true, _count: { select: { players: true } } },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.club.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: clubs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch clubs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { name, shortName, yearFounded, homeVenueId, email, phone } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 });
    }

    const club = await prisma.club.create({
      data: {
        name,
        shortName: shortName || null,
        yearFounded: yearFounded ? Number(yearFounded) : null,
        homeVenueId: homeVenueId || null,
        email: email || null,
        phone: phone || null,
      },
      include: { homeVenue: true },
    });

    return NextResponse.json({ success: true, data: club }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create club' },
      { status: 500 }
    );
  }
}
