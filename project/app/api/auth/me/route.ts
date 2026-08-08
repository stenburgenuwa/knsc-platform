import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { roleLabel } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const user = await prisma.user.findUnique({ where: { id: auth.user.sub }, include: { club: true } });
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: [roleLabel(user.role)],
      permissions: [],
      clubId: user.clubId,
      clubName: user.club?.name ?? null,
      availability: user.availability,
    },
  });
}

const AVAILABILITY_VALUES = ['AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE', 'INJURED'];

// Referees update their own match-day availability here; the Referee Manager
// reads it back through GET /api/users?role=REFEREE.
export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request, ['REFEREE']);
  if (!auth.ok) return auth.response;

  try {
    const { availability } = await request.json();
    if (!AVAILABILITY_VALUES.includes(availability)) {
      return NextResponse.json({ success: false, error: 'Invalid availability value' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: auth.user.sub },
      data: { availability },
    });

    return NextResponse.json({ success: true, data: { availability: user.availability } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update availability' },
      { status: 500 }
    );
  }
}
