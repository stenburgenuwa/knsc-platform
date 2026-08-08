import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const player = await prisma.player.update({
      where: { id: params.id },
      data: { approved: true },
      include: { club: true },
    });
    await logAudit({
      userId: auth.user.sub,
      action: 'PLAYER_APPROVED',
      module: 'players',
      targetId: player.id,
      detail: `${player.firstName} ${player.lastName} (${player.club.name})`,
    });
    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to approve player' },
      { status: 500 }
    );
  }
}
