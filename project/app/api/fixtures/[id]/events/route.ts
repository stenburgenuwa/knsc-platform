import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const events = await prisma.matchEvent.findMany({
    where: { fixtureId: params.id },
    include: { player: { include: { club: true } } },
    orderBy: [{ minute: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ success: true, data: events });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['REFEREE', 'LEAGUE_MANAGER', 'PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const { playerId, type, minute } = await request.json();

    if (!playerId || !['GOAL', 'YELLOW_CARD', 'RED_CARD'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'playerId and a valid type (GOAL, YELLOW_CARD, RED_CARD) are required' },
        { status: 400 }
      );
    }

    const fixture = await prisma.fixture.findUnique({ where: { id: params.id } });
    if (!fixture) {
      return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
    }

    if (auth.user.role === 'REFEREE') {
      const assignment = await prisma.refereeAssignment.findUnique({ where: { fixtureId: params.id } });
      if (!assignment || assignment.refereeId !== auth.user.sub) {
        return NextResponse.json(
          { success: false, error: 'You are not the assigned referee for this fixture' },
          { status: 403 }
        );
      }
      if (fixture.reportStatus === 'SUBMITTED' || fixture.reportStatus === 'APPROVED') {
        return NextResponse.json(
          { success: false, error: 'The match report has been submitted and can no longer be edited.' },
          { status: 409 }
        );
      }
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player || (player.clubId !== fixture.homeClubId && player.clubId !== fixture.awayClubId)) {
      return NextResponse.json(
        { success: false, error: 'Player must belong to one of the two clubs playing in this fixture' },
        { status: 400 }
      );
    }

    const [event] = await prisma.$transaction([
      prisma.matchEvent.create({
        data: { fixtureId: params.id, playerId, type, minute: minute ? Number(minute) : null },
        include: { player: { include: { club: true } } },
      }),
      ...(type === 'GOAL' ? [prisma.player.update({ where: { id: playerId }, data: { goals: { increment: 1 } } })] : []),
    ]);

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to record match event' },
      { status: 500 }
    );
  }
}
