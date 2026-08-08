import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// League Manager review of a referee-submitted match report. Approving locks
// it for good; returning it hands editing back to the referee so they can
// fix and resubmit through PATCH /api/fixtures/[id]/result.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  const fixture = await prisma.fixture.findUnique({ where: { id: params.id } });
  if (!fixture) {
    return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
  }
  if (fixture.reportStatus !== 'SUBMITTED') {
    return NextResponse.json({ success: false, error: 'This fixture has no match report awaiting review.' }, { status: 409 });
  }

  try {
    const { action, notes } = await request.json();
    if (action !== 'APPROVE' && action !== 'RETURN') {
      return NextResponse.json({ success: false, error: 'action must be APPROVE or RETURN' }, { status: 400 });
    }

    const updated = await prisma.fixture.update({
      where: { id: params.id },
      data: {
        reportStatus: action === 'APPROVE' ? 'APPROVED' : 'RETURNED',
        ...(notes !== undefined ? { reportNotes: notes } : {}),
      },
      include: { homeClub: true, awayClub: true, venue: true },
    });

    await logAudit({
      userId: auth.user.sub,
      action: action === 'APPROVE' ? 'MATCH_REPORT_APPROVED' : 'MATCH_REPORT_RETURNED',
      module: 'match-reports',
      targetId: params.id,
      detail: notes || null,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to review match report' },
      { status: 500 }
    );
  }
}
