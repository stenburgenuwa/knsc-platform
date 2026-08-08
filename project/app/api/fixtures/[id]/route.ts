import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { deleteFixtureCascade } from '@/lib/cascade';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const fixture = await prisma.fixture.findUnique({
    where: { id: params.id },
    include: {
      homeClub: true,
      awayClub: true,
      venue: true,
      refereeAssignment: { include: { referee: { select: { firstName: true, lastName: true } } } },
      matchEvents: { include: { player: { include: { club: true } } }, orderBy: { minute: 'asc' } },
    },
  });

  if (!fixture) {
    return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: fixture });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const { homeClubId, awayClubId, fixtureDate, kickoffTime, status, homeScore, awayScore, round, featured } =
      await request.json();

    if (homeClubId && awayClubId && homeClubId === awayClubId) {
      return NextResponse.json({ success: false, error: 'A club cannot play itself' }, { status: 400 });
    }
    if (status !== undefined && !['UPCOMING', 'COMPLETED', 'POSTPONED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Unknown fixture status' }, { status: 400 });
    }

    // The venue is derived from the home club, never chosen manually — if the
    // home club is changing, re-resolve the venue from its registered ground.
    let venueUpdate = {};
    if (homeClubId !== undefined) {
      const homeClub = await prisma.club.findUnique({ where: { id: homeClubId } });
      if (!homeClub) {
        return NextResponse.json({ success: false, error: 'Home club not found' }, { status: 404 });
      }
      venueUpdate = { venueId: homeClub.homeVenueId };
    }

    const fixture = await prisma.fixture.update({
      where: { id: params.id },
      data: {
        ...(homeClubId !== undefined ? { homeClubId } : {}),
        ...(awayClubId !== undefined ? { awayClubId } : {}),
        ...venueUpdate,
        ...(fixtureDate !== undefined ? { fixtureDate: new Date(fixtureDate) } : {}),
        ...(kickoffTime !== undefined ? { kickoffTime: kickoffTime || null } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(homeScore !== undefined ? { homeScore: homeScore === null || homeScore === '' ? null : Number(homeScore) } : {}),
        ...(awayScore !== undefined ? { awayScore: awayScore === null || awayScore === '' ? null : Number(awayScore) } : {}),
        ...(round !== undefined ? { round: round || null } : {}),
        ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
      },
      include: { homeClub: true, awayClub: true, venue: true },
    });

    await logAudit({
      userId: auth.user.sub,
      action: 'FIXTURE_UPDATED',
      module: 'fixtures',
      targetId: fixture.id,
      detail: `${fixture.homeClub.name} vs ${fixture.awayClub.name}`,
    });

    return NextResponse.json({ success: true, data: fixture });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update fixture' },
      { status: 500 }
    );
  }
}

// Deleting a fixture outright is reserved for the Platform Owner — the
// League Manager's remit (per spec) stops at editing, rescheduling, and
// cancelling (POSTPONED), not permanently removing platform data.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.fixture.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
  }

  try {
    await deleteFixtureCascade(prisma, params.id);
    await logAudit({ userId: auth.user.sub, action: 'FIXTURE_DELETED', module: 'fixtures', targetId: params.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete fixture' },
      { status: 500 }
    );
  }
}
