import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { roleLabel } from '@/lib/roles';
import { logAudit } from '@/lib/audit';

function randomTempPassword() {
  return Math.random().toString(36).slice(-6) + 'A1!';
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'REFEREE_MANAGER']);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const roleFilter = searchParams.get('role') || undefined;

  // Referee Managers may only browse referees, not the full user list.
  if (auth.user.role === 'REFEREE_MANAGER' && roleFilter !== 'REFEREE') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: roleFilter ? { role: roleFilter as any } : undefined,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      clubId: true,
      club: { select: { name: true } },
      availability: true,
      createdAt: true,
    },
    orderBy: { lastName: 'asc' },
  });

  return NextResponse.json({
    success: true,
    data: users.map((u) => ({ ...u, roleLabel: roleLabel(u.role) })),
  });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'REFEREE_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { email, firstName, lastName, role, clubId } = body;

    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { success: false, error: 'email, firstName, lastName and role are required' },
        { status: 400 }
      );
    }
    if (role === 'TEAM_MANAGER' && !clubId) {
      return NextResponse.json({ success: false, error: 'Team Managers must be assigned a club' }, { status: 400 });
    }

    // Referee Managers may only register referees, not any other staff role.
    if (auth.user.role === 'REFEREE_MANAGER' && role !== 'REFEREE') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const tempPassword = randomTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: String(email).toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role,
        clubId: role === 'TEAM_MANAGER' ? clubId : null,
      },
    });

    await logAudit({ userId: auth.user.sub, action: 'USER_CREATED', module: 'users', targetId: user.id, detail: `${user.email} (${role})` });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          roleLabel: roleLabel(user.role),
          temporaryPassword: tempPassword,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'A user with that email already exists' }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}
