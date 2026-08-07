import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, AuthTokenPayload } from '@/lib/jwt';

export type AuthResult = { ok: true; user: AuthTokenPayload } | { ok: false; response: NextResponse };

export function requireAuth(request: NextRequest, allowedRoles?: string[]): AuthResult {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 }) };
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 }) };
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return { ok: false, response: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true, user: payload };
}
