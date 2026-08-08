import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const STATUSES = ['OPEN', 'RESOLVED', 'APPEALED'];

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const clubId = searchParams.get('clubId') || undefined;

  const cases = await prisma.disciplinaryCase.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(clubId ? { clubId } : {}),
    },
    include: {
      player: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      club: { select: { id: true, name: true } },
      fixture: { select: { id: true, fixtureDate: true, homeClub: { select: { name: true } }, awayClub: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: cases });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const { playerId, fixtureId, reason, decision, decisionDate, status, notes } = await request.json();

    if (!playerId || !reason) {
      return NextResponse.json({ success: false, error: 'playerId and reason are required' }, { status: 400 });
    }
    if (status !== undefined && !STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Unknown status' }, { status: 400 });
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    const disciplinaryCase = await prisma.disciplinaryCase.create({
      data: {
        playerId,
        clubId: player.clubId,
        fixtureId: fixtureId || null,
        reason,
        decision: decision || null,
        decisionDate: decisionDate ? new Date(decisionDate) : null,
        status: status || 'OPEN',
        notes: notes || null,
      },
      include: { player: true, club: true },
    });

    await logAudit({
      userId: auth.user.sub,
      action: 'DISCIPLINARY_CASE_OPENED',
      module: 'disciplinary',
      targetId: disciplinaryCase.id,
      detail: `${player.firstName} ${player.lastName}: ${reason}`,
    });

    return NextResponse.json({ success: true, data: disciplinaryCase }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to open disciplinary case' },
      { status: 500 }
    );
  }
}
