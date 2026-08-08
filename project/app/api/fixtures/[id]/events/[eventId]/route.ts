import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: { id: string; eventId: string } }) {
  const auth = requireAuth(request, ['REFEREE', 'LEAGUE_MANAGER', 'PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const event = await prisma.matchEvent.findUnique({ where: { id: params.eventId } });
  if (!event || event.fixtureId !== params.id) {
    return NextResponse.json({ success: false, error: 'Event not found on this fixture' }, { status: 404 });
  }

  if (auth.user.role === 'REFEREE') {
    const assignment = await prisma.refereeAssignment.findUnique({ where: { fixtureId: params.id } });
    if (!assignment || assignment.refereeId !== auth.user.sub) {
      return NextResponse.json(
        { success: false, error: 'You are not the assigned referee for this fixture' },
        { status: 403 }
      );
    }
    const fixture = await prisma.fixture.findUnique({ where: { id: params.id } });
    if (fixture?.reportStatus === 'SUBMITTED' || fixture?.reportStatus === 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'The match report has been submitted and can no longer be edited.' },
        { status: 409 }
      );
    }
  }

  await prisma.$transaction([
    prisma.matchEvent.delete({ where: { id: params.eventId } }),
    ...(event.type === 'GOAL' ? [prisma.player.update({ where: { id: event.playerId }, data: { goals: { decrement: 1 } } })] : []),
  ]);

  return NextResponse.json({ success: true });
}
