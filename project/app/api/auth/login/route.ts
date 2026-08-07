import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAccessToken } from '@/lib/jwt';
import { roleLabel } from '@/lib/roles';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { success: false, error: `Account locked after too many failed attempts. Try again in ${minutesLeft} minute(s).` },
        { status: 423 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockingOut = attempts >= MAX_ATTEMPTS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: lockingOut ? 0 : attempts,
          lockedUntil: lockingOut ? new Date(Date.now() + LOCKOUT_MINUTES * 60000) : null,
        },
      });
      return NextResponse.json(
        {
          success: false,
          error: lockingOut
            ? `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`
            : 'Invalid email or password',
        },
        { status: lockingOut ? 423 : 401 }
      );
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role, clubId: user.clubId });

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: [roleLabel(user.role)],
          permissions: [],
          clubId: user.clubId,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}
