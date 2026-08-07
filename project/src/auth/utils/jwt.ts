import crypto from 'crypto';
import { JwtPayload } from '../types';

/**
 * JWT utilities for token creation and verification
 */

interface JwtConfig {
  secret: string;
  accessTokenExpiry: number; // in seconds
  refreshTokenExpiry: number; // in seconds
}

export class JwtService {
  private config: JwtConfig;

  constructor(config: JwtConfig) {
    this.config = config;
  }

  /**
   * Create an access token
   */
  createAccessToken(userId: string, email: string, roles: string[], permissions: string[]): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      roles,
      permissions,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.accessTokenExpiry,
    };

    return this.sign(payload);
  }

  /**
   * Create a refresh token
   */
  createRefreshToken(userId: string): string {
    const payload: JwtPayload = {
      sub: userId,
      email: '', // Not needed in refresh token
      roles: [],
      permissions: [],
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.refreshTokenExpiry,
    };

    return this.sign(payload);
  }

  /**
   * Verify and decode a token
   */
  verify(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerB64, payloadB64, signatureB64] = parts;

      // Verify signature
      const message = `${headerB64}.${payloadB64}`;
      const expectedSignature = this.hmacSha256(message, this.config.secret);
      const providedSignature = this.base64urlUnescape(signatureB64);

      if (expectedSignature !== providedSignature) {
        return null;
      }

      // Decode payload
      const payload = JSON.parse(
        Buffer.from(this.base64urlUnescape(payloadB64), 'base64').toString()
      ) as JwtPayload;

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode a token without verification
   */
  decode(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payloadB64 = parts[1];
      const payload = JSON.parse(
        Buffer.from(this.base64urlUnescape(payloadB64), 'base64').toString()
      ) as JwtPayload;

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isExpired(token: string): boolean {
    const payload = this.decode(token);
    if (!payload) return true;
    return payload.exp < Math.floor(Date.now() / 1000);
  }

  /**
   * Sign a JWT payload
   */
  private sign(payload: JwtPayload): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const headerB64 = this.base64urlEscape(Buffer.from(JSON.stringify(header)).toString('base64'));
    const payloadB64 = this.base64urlEscape(Buffer.from(JSON.stringify(payload)).toString('base64'));

    const message = `${headerB64}.${payloadB64}`;
    const signature = this.hmacSha256(message, this.config.secret);
    const signatureB64 = this.base64urlEscape(signature);

    return `${message}.${signatureB64}`;
  }

  /**
   * HMAC-SHA256 signature
   */
  private hmacSha256(message: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('base64');
  }

  /**
   * Base64URL encode
   */
  private base64urlEscape(str: string): string {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Base64URL decode
   */
  private base64urlUnescape(str: string): string {
    str += Array(5 - (str.length % 4)).join('=');
    return str.replace(/\-/g, '+').replace(/_/g, '/');
  }
}
