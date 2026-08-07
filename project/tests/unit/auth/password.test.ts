/**
 * Unit Tests for Authentication Service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PasswordService } from '../../utils/password';

describe('PasswordService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'Test@1234';
      const hash = await PasswordService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(typeof hash).toBe('string');
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'Test@1234';
      const hash1 = await PasswordService.hashPassword(password);
      const hash2 = await PasswordService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'Test@1234';
      const hash = await PasswordService.hashPassword(password);
      const isValid = await PasswordService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'Test@1234';
      const hash = await PasswordService.hashPassword(password);
      const isValid = await PasswordService.verifyPassword('WrongPassword@123', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = PasswordService.validatePassword('Test@1234');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password without uppercase', () => {
      const result = PasswordService.validatePassword('test@1234');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
    });

    it('should reject password without lowercase', () => {
      const result = PasswordService.validatePassword('TEST@1234');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('lowercase'))).toBe(true);
    });

    it('should reject password without number', () => {
      const result = PasswordService.validatePassword('Test@');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('number'))).toBe(true);
    });

    it('should reject password without special character', () => {
      const result = PasswordService.validatePassword('Test1234');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('special'))).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = PasswordService.validatePassword('Test@1');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('least 8'))).toBe(true);
    });
  });

  describe('generateTemporaryPassword', () => {
    it('should generate a temporary password', () => {
      const password = PasswordService.generateTemporaryPassword();

      expect(password).toBeDefined();
      expect(password.length).toBe(12);
    });

    it('should generate passwords with custom length', () => {
      const password = PasswordService.generateTemporaryPassword(16);

      expect(password.length).toBe(16);
    });

    it('should generate different passwords', () => {
      const password1 = PasswordService.generateTemporaryPassword();
      const password2 = PasswordService.generateTemporaryPassword();

      expect(password1).not.toBe(password2);
    });
  });
});
