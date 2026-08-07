/**
 * Unit Tests for JWT Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JwtService } from '../../src/auth/utils/jwt';
import { AUTH_CONSTANTS } from '../../src/auth/constants';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: 'test-secret-key-for-testing-purposes-only',
      accessTokenExpiry: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY_MINUTES * 60,
      refreshTokenExpiry: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    });
  });

  describe('createAccessToken', () => {
    it('should create a valid access token', () => {
      const token = jwtService.createAccessToken('user-123', 'user@example.com', ['Admin'], ['user:read']);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should embed user data in token', () => {
      const token = jwtService.createAccessToken('user-123', 'user@example.com', ['Admin'], ['user:read']);
      const payload = jwtService.verify(token);

      expect(payload).toBeDefined();
      expect(payload?.sub).toBe('user-123');
      expect(payload?.email).toBe('user@example.com');
      expect(payload?.roles).toContain('Admin');
      expect(payload?.permissions).toContain('user:read');
    });
  });

  describe('createRefreshToken', () => {
    it('should create a valid refresh token', () => {
      const token = jwtService.createRefreshToken('user-123');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should mark token as refresh type', () => {
      const token = jwtService.createRefreshToken('user-123');
      const payload = jwtService.verify(token);

      expect(payload?.type).toBe('refresh');
    });
  });

  describe('verify', () => {
    it('should verify a valid token', () => {
      const token = jwtService.createAccessToken('user-123', 'user@example.com', [], []);
      const payload = jwtService.verify(token);

      expect(payload).toBeDefined();
      expect(payload?.sub).toBe('user-123');
    });

    it('should reject invalid token signature', () => {
      const token = jwtService.createAccessToken('user-123', 'user@example.com', [], []);
      const tampered = token.slice(0, -5) + 'xxxxx';
      const payload = jwtService.verify(tampered);

      expect(payload).toBeNull();
    });

    it('should reject malformed token', () => {
      const payload = jwtService.verify('not.a.token');

      expect(payload).toBeNull();
    });
  });

  describe('decode', () => {
    it('should decode a token without verification', () => {
      const token = jwtService.createAccessToken('user-123', 'user@example.com', [], []);
      const payload = jwtService.decode(token);

      expect(payload).toBeDefined();
      expect(payload?.sub).toBe('user-123');
    });
  });

  describe('isExpired', () => {
    it('should return false for valid token', () => {
      const token = jwtService.createAccessToken('user-123', 'user@example.com', [], []);
      const isExpired = jwtService.isExpired(token);

      expect(isExpired).toBe(false);
    });
  });
});
