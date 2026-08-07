/**
 * Authentication API Routes Setup for Next.js
 * Place this in: src/app/api/auth/[...auth]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/auth/services/auth.service';
import { JwtService } from '@/auth/utils/jwt';
import { AuthController } from '@/auth/controllers/auth.controller';
import { RbacService } from '@/auth/services/rbac.service';
import { AUTH_CONSTANTS } from '@/auth/constants';

const prisma = new PrismaClient();

const jwtService = new JwtService({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  accessTokenExpiry: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY_MINUTES * 60,
  refreshTokenExpiry: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
});

const authService = new AuthService(prisma, jwtService);
const authController = new AuthController(authService, jwtService, prisma);
const rbacService = new RbacService(prisma);

/**
 * Handle auth routes
 */
export async function POST(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    const method = request.method;
    const req = {
      body: await request.json(),
      headers: Object.fromEntries(request.headers),
      socket: { remoteAddress: request.ip },
      connection: { remoteAddress: request.ip },
    };

    // Route handling
    if (path.includes('/auth/login')) {
      return handleLogin(req);
    }
    if (path.includes('/auth/logout')) {
      return handleLogout(req);
    }
    if (path.includes('/auth/refresh')) {
      return handleRefresh(req);
    }
    if (path.includes('/auth/change-password')) {
      return handleChangePassword(req);
    }
    if (path.includes('/auth/password-reset/request')) {
      return handlePasswordResetRequest(req);
    }
    if (path.includes('/auth/password-reset/confirm')) {
      return handlePasswordResetConfirm(req);
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: AUTH_CONSTANTS.UNAUTHORIZED }, { status: 401 });
    }

    const payload = jwtService.verify(token);
    if (!payload) {
      return NextResponse.json({ error: AUTH_CONSTANTS.INVALID_TOKEN }, { status: 401 });
    }

    const req = {
      user: { userId: payload.sub, email: payload.email },
      headers: Object.fromEntries(request.headers),
    };

    if (path.includes('/auth/me')) {
      return handleGetCurrentUser(req);
    }
    if (path.includes('/auth/sessions')) {
      return handleGetSessions(req);
    }
    if (path.includes('/auth/login-history')) {
      return handleGetLoginHistory(req);
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: AUTH_CONSTANTS.UNAUTHORIZED }, { status: 401 });
    }

    const payload = jwtService.verify(token);
    if (!payload) {
      return NextResponse.json({ error: AUTH_CONSTANTS.INVALID_TOKEN }, { status: 401 });
    }

    if (path.includes('/auth/sessions/')) {
      const sessionId = path.split('/').pop();
      const req = {
        user: { userId: payload.sub },
        params: { sessionId },
      };
      return handleTerminateSession(req);
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handler functions
async function handleLogin(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.login(req, res.status(200));
  return res.status(200).json({});
}

async function handleLogout(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.logout(req, res.status(200));
  return res.status(200).json({});
}

async function handleRefresh(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.refresh(req, res.status(200));
  return res.status(200).json({});
}

async function handleChangePassword(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.changePassword(req, res.status(200));
  return res.status(200).json({});
}

async function handlePasswordResetRequest(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.requestPasswordReset(req, res.status(200));
  return res.status(200).json({});
}

async function handlePasswordResetConfirm(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.confirmPasswordReset(req, res.status(200));
  return res.status(200).json({});
}

async function handleGetCurrentUser(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.getCurrentUser(req, res.status(200));
  return res.status(200).json({});
}

async function handleGetSessions(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.getActiveSessions(req, res.status(200));
  return res.status(200).json({});
}

async function handleTerminateSession(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.terminateSession(req, res.status(200));
  return res.status(200).json({});
}

async function handleGetLoginHistory(req: any) {
  const res = {
    status: (code: number) => ({
      json: (data: any) => NextResponse.json(data, { status: code }),
    }),
  };
  await authController.getLoginHistory(req, res.status(200));
  return res.status(200).json({});
}
