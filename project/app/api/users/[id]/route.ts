import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { roleLabel } from '@/lib/roles';
import { deleteUserCascade } from '@/lib/cascade';

export const dynamic = 'force-dynamic';

const ROLES = ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'TEAM_MANAGER', 'REFEREE', 'REFEREE_MANAGER'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'REFEREE_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  // Referee Managers may only edit referee accounts, and can't change what
  // role the account holds.
  if (auth.user.role === 'REFEREE_MANAGER' && existing.role !== 'REFEREE') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { email, firstName, lastName, role, clubId, password } = await request.json();

    if (auth.user.role === 'REFEREE_MANAGER' && role !== undefined && role !== 'REFEREE') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (role !== undefined && !ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Unknown role' }, { status: 400 });
    }

    // Don't let the last Platform Owner demote themselves out of existence.
    if (role !== undefined && existing.role === 'PLATFORM_OWNER' && role !== 'PLATFORM_OWNER') {
      const owners = await prisma.user.count({ where: { role: 'PLATFORM_OWNER' } });
      if (owners <= 1) {
        return NextResponse.json(
          { success: false, error: 'This is the only Platform Owner — create another before changing this role.' },
          { status: 409 }
        );
      }
    }

    const nextRole = role ?? existing.role;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(email !== undefined ? { email: String(email).toLowerCase() } : {}),
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(role !== undefined ? { role } : {}),
        // Only Team Managers carry a club; switching away from that role clears it.
        ...(clubId !== undefined || role !== undefined
          ? { clubId: nextRole === 'TEAM_MANAGER' ? clubId ?? existing.clubId ?? null : null }
          : {}),
        ...(password ? { passwordHash: await bcrypt.hash(password, 10), failedLoginAttempts: 0, lockedUntil: null } : {}),
      },
      include: { club: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roleLabel: roleLabel(user.role),
        clubId: user.clubId,
        club: user.club ? { name: user.club.name } : null,
      },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Another account already uses that email' }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'REFEREE_MANAGER']);
  if (!auth.ok) return auth.response;

  if (params.id === auth.user.sub) {
    return NextResponse.json(
      { success: false, error: 'You cannot delete the account you are signed in with.' },
      { status: 409 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  // Referee Managers may only remove referee accounts.
  if (auth.user.role === 'REFEREE_MANAGER' && existing.role !== 'REFEREE') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  if (existing.role === 'PLATFORM_OWNER') {
    const owners = await prisma.user.count({ where: { role: 'PLATFORM_OWNER' } });
    if (owners <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the only Platform Owner.' },
        { status: 409 }
      );
    }
  }

  try {
    await deleteUserCascade(prisma, params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: 500 }
    );
  }
}
