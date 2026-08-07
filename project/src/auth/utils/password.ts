import crypto from 'crypto';
import { AUTH_CONSTANTS } from '../constants';

/**
 * Password validation and hashing utilities
 * Uses Argon2 equivalent (crypto-based for Node.js)
 */

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordService {
  /**
   * Hash a password using PBKDF2 with SHA-256
   * (Argon2 would be preferred in production via argon2 package)
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    const salt = crypto.randomBytes(32);
    
    // PBKDF2 with SHA-256
    const iterations = 100000;
    const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256');
    
    // Combine salt and hash
    const combined = Buffer.concat([salt, hash]);
    return combined.toString('base64');
  }

  /**
   * Verify a password against a stored hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const combined = Buffer.from(hash, 'base64');
      const salt = combined.slice(0, 32);
      const storedHash = combined.slice(32);
      
      const iterations = 100000;
      const computedHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256');
      
      return crypto.timingSafeEqual(storedHash, computedHash);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate password against complexity requirements
   */
  static validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < AUTH_CONSTANTS.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} characters`);
    }

    if (password.length > AUTH_CONSTANTS.PASSWORD_MAX_LENGTH) {
      errors.push(`Password must not exceed ${AUTH_CONSTANTS.PASSWORD_MAX_LENGTH} characters`);
    }

    if (AUTH_CONSTANTS.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (AUTH_CONSTANTS.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (AUTH_CONSTANTS.PASSWORD_REQUIRE_NUMBER && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (AUTH_CONSTANTS.PASSWORD_REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a temporary password
   */
  static generateTemporaryPassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
