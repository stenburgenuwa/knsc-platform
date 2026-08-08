import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';
import { maybeAssignRegistrationNumber } from '@/lib/player-registration';

export const dynamic = 'force-dynamic';

// A player becomes visible/usable as soon as either approver signs off
// (unchanged from the previous single-step behaviour), but only receives an
// official KNSCL registration number once BOTH have approved.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const approvalField = auth.user.role === 'LEAGUE_MANAGER' ? 'leagueManagerApproved' : 'platformOwnerApproved';

    const player = await prisma.$transaction(async (tx) => {
      const updated = await tx.player.update({
        where: { id: params.id },
        data: { approved: true, [approvalField]: true },
      });
      await maybeAssignRegistrationNumber(tx, updated);
      return tx.player.findUniqueOrThrow({ where: { id: params.id }, include: { club: true } });
    });

    await logAudit({
      userId: auth.user.sub,
      action: 'PLAYER_APPROVED',
      module: 'players',
      targetId: player.id,
      detail: `${player.firstName} ${player.lastName} (${player.club.name})${player.registrationNumber ? ` — ${player.registrationNumber}` : ''}`,
    });
    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to approve player' },
      { status: 500 }
    );
  }
}
