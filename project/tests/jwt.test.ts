import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../lib/jwt';

describe('jwt sign/verify', () => {
  it('round-trips a valid token', () => {
    const token = signAccessToken({ sub: 'user-1', email: 'a@knscl.co.ke', role: 'REFEREE' });
    const payload = verifyAccessToken(token);
    expect(payload?.sub).toBe('user-1');
    expect(payload?.email).toBe('a@knscl.co.ke');
    expect(payload?.role).toBe('REFEREE');
  });

  it('rejects a tampered token', () => {
    const token = signAccessToken({ sub: 'user-1', email: 'a@knscl.co.ke', role: 'REFEREE' });
    const tampered = token.slice(0, -2) + 'xx';
    expect(verifyAccessToken(tampered)).toBeNull();
  });

  it('rejects garbage input', () => {
    expect(verifyAccessToken('not-a-jwt')).toBeNull();
  });

  it('carries an optional clubId through', () => {
    const token = signAccessToken({ sub: 'user-2', email: 'tm@knscl.co.ke', role: 'TEAM_MANAGER', clubId: 'club-1' });
    expect(verifyAccessToken(token)?.clubId).toBe('club-1');
  });
});
