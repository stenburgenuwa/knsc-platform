import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['REFEREE_MANAGER', 'PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const { refereeId } = await request.json();
    if (!refereeId) {
      return NextResponse.json({ success: false, error: 'refereeId is required' }, { status: 400 });
    }

    const referee = await prisma.user.findUnique({ where: { id: refereeId } });
    if (!referee || referee.role !== 'REFEREE') {
      return NextResponse.json({ success: false, error: 'refereeId must belong to a Referee' }, { status: 400 });
    }

    const assignment = await prisma.refereeAssignment.upsert({
      where: { fixtureId: params.id },
      create: { fixtureId: params.id, refereeId, status: 'ASSIGNED' },
      update: { refereeId, status: 'ASSIGNED' },
      include: { referee: true, fixture: { include: { homeClub: true, awayClub: true } } },
    });

    await logAudit({
      userId: auth.user.sub,
      action: 'REFEREE_ASSIGNED',
      module: 'fixtures',
      targetId: params.id,
      detail: `${assignment.referee.firstName} ${assignment.referee.lastName} — ${assignment.fixture.homeClub.name} vs ${assignment.fixture.awayClub.name}`,
    });

    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to assign referee' },
      { status: 500 }
    );
  }
}
