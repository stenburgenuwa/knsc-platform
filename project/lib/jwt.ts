import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
  clubId?: string | null;
}

function secret(): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return JWT_SECRET;
}

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: '2h' });
}

export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, secret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}
