import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['REFEREE']);
  if (!auth.ok) return auth.response;

  try {
    const { status } = await request.json();
    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'status must be ACCEPTED or DECLINED' }, { status: 400 });
    }

    const assignment = await prisma.refereeAssignment.findUnique({ where: { id: params.id } });
    if (!assignment || assignment.refereeId !== auth.user.sub) {
      return NextResponse.json({ success: false, error: 'Not your assignment' }, { status: 403 });
    }

    const updated = await prisma.refereeAssignment.update({
      where: { id: params.id },
      data: { status },
      include: { fixture: { include: { homeClub: true, awayClub: true, venue: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update assignment' },
      { status: 500 }
    );
  }
}
