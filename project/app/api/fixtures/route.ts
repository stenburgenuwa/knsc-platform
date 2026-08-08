import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Public pages want only upcoming games; the admin console passes
    // status=all to manage completed and postponed ones too.
    const statusParam = searchParams.get('status');
    const clubId = searchParams.get('clubId') || undefined;
    const reportStatus = searchParams.get('reportStatus') || undefined;
    const where = {
      ...(statusParam === 'all' ? {} : { status: (statusParam as any) || 'UPCOMING' }),
      ...(clubId ? { OR: [{ homeClubId: clubId }, { awayClubId: clubId }] } : {}),
      ...(reportStatus ? { reportStatus: reportStatus as any } : {}),
    };

    const [fixtures, total] = await Promise.all([
      prisma.fixture.findMany({
        where,
        include: { homeClub: true, awayClub: true, venue: true, refereeAssignment: { include: { referee: true } } },
        orderBy: { fixtureDate: statusParam === 'all' ? 'desc' : 'asc' },
        skip,
        take: limit,
      }),
      prisma.fixture.count({ where }),
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
    const { homeClubId, awayClubId, fixtureDate, kickoffTime } = body;

    if (!homeClubId || !awayClubId || !fixtureDate) {
      return NextResponse.json(
        { success: false, error: 'homeClubId, awayClubId and fixtureDate are required' },
        { status: 400 }
      );
    }
    if (homeClubId === awayClubId) {
      return NextResponse.json({ success: false, error: 'A club cannot play itself' }, { status: 400 });
    }

    // The venue is never chosen manually — it always follows the home club's
    // registered home venue, so the two can never drift out of sync.
    const homeClub = await prisma.club.findUnique({ where: { id: homeClubId } });
    if (!homeClub) {
      return NextResponse.json({ success: false, error: 'Home club not found' }, { status: 404 });
    }

    const fixture = await prisma.fixture.create({
      data: {
        homeClubId,
        awayClubId,
        venueId: homeClub.homeVenueId,
        fixtureDate: new Date(fixtureDate),
        kickoffTime: kickoffTime || null,
      },
      include: { homeClub: true, awayClub: true, venue: true },
    });

    await logAudit({
      userId: auth.user.sub,
      action: 'FIXTURE_CREATED',
      module: 'fixtures',
      targetId: fixture.id,
      detail: `${fixture.homeClub.name} vs ${fixture.awayClub.name}`,
    });

    return NextResponse.json({ success: true, data: fixture }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create fixture' },
      { status: 500 }
    );
  }
}
