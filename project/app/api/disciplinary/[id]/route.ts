import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const STATUSES = ['OPEN', 'RESOLVED', 'APPEALED'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.disciplinaryCase.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Disciplinary case not found' }, { status: 404 });
  }

  try {
    const { reason, decision, decisionDate, status, notes } = await request.json();
    if (status !== undefined && !STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Unknown status' }, { status: 400 });
    }

    const updated = await prisma.disciplinaryCase.update({
      where: { id: params.id },
      data: {
        ...(reason !== undefined ? { reason } : {}),
        ...(decision !== undefined ? { decision } : {}),
        ...(decisionDate !== undefined ? { decisionDate: decisionDate ? new Date(decisionDate) : null } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: { player: true, club: true },
    });

    await logAudit({
      userId: auth.user.sub,
      action: 'DISCIPLINARY_CASE_UPDATED',
      module: 'disciplinary',
      targetId: params.id,
      detail: status ? `status -> ${status}` : undefined,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update disciplinary case' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.disciplinaryCase.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Disciplinary case not found' }, { status: 404 });
  }

  await prisma.disciplinaryCase.delete({ where: { id: params.id } });

  await logAudit({
    userId: auth.user.sub,
    action: 'DISCIPLINARY_CASE_DELETED',
    module: 'disciplinary',
    targetId: params.id,
    detail: existing.reason,
  });

  return NextResponse.json({ success: true });
}
