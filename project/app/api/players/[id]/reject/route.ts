import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/*
  Rejecting a player registration. The reason is mandatory — a rejection with
  no explanation gives the Team Manager nothing to correct — and is stored on
  the player so it survives refresh and login, and shows on the Team Manager's
  dashboard until they resubmit.

  Rejection withdraws this approver's sign-off and takes the player back out of
  circulation. An already-issued registration number is never revoked: numbers
  are permanent once assigned.
*/
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.player.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
  }

  try {
    const { reason } = await request.json();
    if (typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'A reason is required when rejecting a player.' },
        { status: 400 }
      );
    }

    const approvalField = auth.user.role === 'LEAGUE_MANAGER' ? 'leagueManagerApproved' : 'platformOwnerApproved';

    const player = await prisma.player.update({
      where: { id: params.id },
      data: {
        approved: false,
        [approvalField]: false,
        rejectionReason: reason.trim(),
        rejectedAt: new Date(),
      },
      include: { club: true },
    });

    await logAudit({
      userId: auth.user.sub,
      action: 'PLAYER_REJECTED',
      module: 'players',
      targetId: player.id,
      detail: `${player.firstName} ${player.lastName} (${player.club.name}) — ${reason.trim()}`,
    });

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to reject player' },
      { status: 500 }
    );
  }
}
