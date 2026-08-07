/**
 * Input Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationService {
  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    } else if (email.length > 255) {
      errors.push('Email must not exceed 255 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate phone number
   */
  static validatePhoneNumber(phoneNumber: string): ValidationResult {
    const errors: string[] = [];

    if (!phoneNumber) {
      errors.push('Phone number is required');
    } else if (!/^[\d\s\-\+\(\)]+$/.test(phoneNumber)) {
      errors.push('Invalid phone number format');
    } else if (phoneNumber.replace(/\D/g, '').length < 10) {
      errors.push('Phone number must contain at least 10 digits');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate password format
   */
  static validatePasswordFormat(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    } else if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate token format
   */
  static validateToken(token: string): ValidationResult {
    const errors: string[] = [];

    if (!token) {
      errors.push('Token is required');
    } else if (typeof token !== 'string') {
      errors.push('Token must be a string');
    } else if (token.length < 10) {
      errors.push('Invalid token format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate UUID
   */
  static validateUUID(id: string): ValidationResult {
    const errors: string[] = [];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!id) {
      errors.push('ID is required');
    } else if (!uuidRegex.test(id)) {
      errors.push('Invalid UUID format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
