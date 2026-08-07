import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { verifyAccessToken } from '@/lib/jwt';

function optionalAuth(request: NextRequest) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  return token ? verifyAccessToken(token) : null;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '16');
    const clubId = searchParams.get('clubId') || undefined;
    const includePending = searchParams.get('includePending') === 'true';
    const skip = (page - 1) * limit;

    const user = optionalAuth(request);
    const isTeamManagerInScope = user?.role === 'TEAM_MANAGER' && user.clubId && (!clubId || clubId === user.clubId);
    const canSeePending =
      includePending && user && (user.role === 'PLATFORM_OWNER' || user.role === 'LEAGUE_MANAGER' || isTeamManagerInScope);

    // A Team Manager's pending-visibility is scoped to their own club even if
    // clubId wasn't passed explicitly, so they never see another club's queue.
    const effectiveClubId = clubId || (isTeamManagerInScope ? (user!.clubId as string) : undefined);

    const where = {
      ...(canSeePending ? {} : { approved: true }),
      ...(effectiveClubId ? { clubId: effectiveClubId } : {}),
    };

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        include: { club: true },
        orderBy: { lastName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.player.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: players,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'TEAM_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { clubId, firstName, lastName, playerNumber, position, dateOfBirth, photoUrl } = body;

    if (!clubId || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'clubId, firstName and lastName are required' },
        { status: 400 }
      );
    }
    if (auth.user.role === 'TEAM_MANAGER' && auth.user.clubId !== clubId) {
      return NextResponse.json(
        { success: false, error: 'Team Managers can only register players for their own club' },
        { status: 403 }
      );
    }

    // Team Managers submit for approval; Platform Owner registrations go straight in.
    const approved = auth.user.role === 'PLATFORM_OWNER';

    const player = await prisma.player.create({
      data: {
        clubId,
        firstName,
        lastName,
        playerNumber: playerNumber ? Number(playerNumber) : null,
        position: position || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        photoUrl: photoUrl || null,
        approved,
      },
      include: { club: true },
    });

    return NextResponse.json({ success: true, data: player }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create player' },
      { status: 500 }
    );
  }
}
