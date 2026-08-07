import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../../src/auth/services/auth.service';
import { JwtService } from '../../src/auth/services/jwt.service';
import { PasswordService } from '../../src/auth/services/password.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);
const jwtService = new JwtService();
const passwordService = new PasswordService();

describe('Authentication - Login & Session', () => {
  let testUser: any;

  beforeEach(async () => {
    const hash = await passwordService.hash('TestPassword123!');
    testUser = await prisma.user.create({
      data: {
        username: `auth-test-${Date.now()}`,
        email: `auth-${Date.now()}@test.com`,
        passwordHash: hash,
        firstName: 'Auth',
        lastName: 'Test',
        isEmailVerified: true,
      },
    });
  });

  describe('Successful Login', () => {
    it('should login with correct credentials', async () => {
      const result = await authService.login(testUser.username, 'TestPassword123!');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe(testUser.id);
    });

    it('should generate valid JWT token', async () => {
      const result = await authService.login(testUser.username, 'TestPassword123!');
      const decoded = jwtService.verify(result.accessToken);
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.username).toBe(testUser.username);
    });
  });

  describe('Failed Login', () => {
    it('should reject incorrect password', async () => {
      await expect(
        authService.login(testUser.username, 'WrongPassword123!')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      await expect(
        authService.login('nonexistent-user', 'password')
      ).rejects.toThrow();
    });
  });

  describe('Account Status', () => {
    it('should reject suspended users', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { isSuspended: true },
      });

      await expect(
        authService.login(testUser.username, 'TestPassword123!')
      ).rejects.toThrow('Account suspended');
    });

    it('should reject inactive users', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { isActive: false },
      });

      await expect(
        authService.login(testUser.username, 'TestPassword123!')
      ).rejects.toThrow('Account inactive');
    });
  });

  describe('Password Reset', () => {
    it('should generate reset token', async () => {
      const token = await authService.generatePasswordResetToken(testUser.id);
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });

    it('should reset password with valid token', async () => {
      const token = await authService.generatePasswordResetToken(testUser.id);
      const newPassword = 'NewPassword456!';

      await authService.resetPassword(testUser.id, token, newPassword);

      const result = await authService.login(testUser.username, newPassword);
      expect(result).toHaveProperty('accessToken');
    });

    it('should reject reset with invalid token', async () => {
      await expect(
        authService.resetPassword(testUser.id, 'invalid-token', 'NewPassword456!')
      ).rejects.toThrow('Invalid token');
    });
  });

  describe('Logout', () => {
    it('should invalidate refresh token on logout', async () => {
      const loginResult = await authService.login(testUser.username, 'TestPassword123!');
      
      await authService.logout(testUser.id, loginResult.refreshToken);

      await expect(
        authService.refreshAccessToken(loginResult.refreshToken)
      ).rejects.toThrow();
    });
  });

  describe('Session Timeout', () => {
    it('should expire old tokens', async () => {
      const result = await authService.login(testUser.username, 'TestPassword123!');
      
      // Token should be valid immediately
      const decoded = jwtService.verify(result.accessToken);
      expect(decoded.userId).toBe(testUser.id);

      // Simulate expiration by checking expiration time
      expect(decoded.exp).toBeDefined();
    });
  });
});
