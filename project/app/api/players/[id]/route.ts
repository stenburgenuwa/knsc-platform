import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { deletePlayerCascade } from '@/lib/cascade';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'TEAM_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.player.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
  }
  if (auth.user.role === 'TEAM_MANAGER' && auth.user.clubId !== existing.clubId) {
    return NextResponse.json(
      { success: false, error: 'Team Managers can only remove players from their own club' },
      { status: 403 }
    );
  }

  try {
    await deletePlayerCascade(prisma, params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete player' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'TEAM_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.player.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
  }
  if (auth.user.role === 'TEAM_MANAGER' && auth.user.clubId !== existing.clubId) {
    return NextResponse.json(
      { success: false, error: 'Team Managers can only edit players in their own club' },
      { status: 403 }
    );
  }

  try {
    const { firstName, lastName, playerNumber, position, dateOfBirth, photoUrl } = await request.json();

    const player = await prisma.player.update({
      where: { id: params.id },
      data: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(playerNumber !== undefined ? { playerNumber: playerNumber ? Number(playerNumber) : null } : {}),
        ...(position !== undefined ? { position: position || null } : {}),
        ...(dateOfBirth !== undefined ? { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null } : {}),
        ...(photoUrl !== undefined ? { photoUrl: photoUrl || null } : {}),
      },
      include: { club: true },
    });

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update player' },
      { status: 500 }
    );
  }
}
