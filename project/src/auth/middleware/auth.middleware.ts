import { JwtService } from '../utils/jwt';
import { AUTH_CONSTANTS } from '../constants';

/**
 * Authentication middleware for Express/Next.js
 */

export interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  token?: string;
  sessionId?: string;
}

export class AuthMiddleware {
  private jwtService: JwtService;

  constructor(jwtService: JwtService) {
    this.jwtService = jwtService;
  }

  /**
   * Verify JWT token from Authorization header
   */
  verifyToken(token: string): any | null {
    if (!token) return null;

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    return this.jwtService.verify(cleanToken);
  }

  /**
   * Express middleware for authentication
   */
  authenticate() {
    return (req: any, res: any, next: any) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({ error: AUTH_CONSTANTS.UNAUTHORIZED });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const payload = this.jwtService.verify(token);

        if (!payload) {
          return res.status(401).json({ error: AUTH_CONSTANTS.INVALID_TOKEN });
        }

        req.user = {
          id: payload.sub,
          email: payload.email,
          roles: payload.roles,
          permissions: payload.permissions,
        };
        req.token = token;

        next();
      } catch (error) {
        res.status(401).json({ error: AUTH_CONSTANTS.UNAUTHORIZED });
      }
    };
  }

  /**
   * Middleware to check specific permission
   */
  checkPermission(requiredPermission: string) {
    return (req: any, res: any, next: any) => {
      if (!req.user) {
        return res.status(401).json({ error: AUTH_CONSTANTS.UNAUTHORIZED });
      }

      if (!req.user.permissions.includes(requiredPermission)) {
        return res.status(403).json({ error: AUTH_CONSTANTS.FORBIDDEN });
      }

      next();
    };
  }

  /**
   * Middleware to check specific role
   */
  checkRole(requiredRole: string | string[]) {
    return (req: any, res: any, next: any) => {
      if (!req.user) {
        return res.status(401).json({ error: AUTH_CONSTANTS.UNAUTHORIZED });
      }

      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!roles.some(role => req.user.roles.includes(role))) {
        return res.status(403).json({ error: AUTH_CONSTANTS.FORBIDDEN });
      }

      next();
    };
  }

  /**
   * Middleware to check any permission
   */
  checkAnyPermission(permissions: string[]) {
    return (req: any, res: any, next: any) => {
      if (!req.user) {
        return res.status(401).json({ error: AUTH_CONSTANTS.UNAUTHORIZED });
      }

      if (!permissions.some(perm => req.user.permissions.includes(perm))) {
        return res.status(403).json({ error: AUTH_CONSTANTS.FORBIDDEN });
      }

      next();
    };
  }

  /**
   * Middleware to check all permissions
   */
  checkAllPermissions(permissions: string[]) {
    return (req: any, res: any, next: any) => {
      if (!req.user) {
        return res.status(401).json({ error: AUTH_CONSTANTS.UNAUTHORIZED });
      }

      if (!permissions.every(perm => req.user.permissions.includes(perm))) {
        return res.status(403).json({ error: AUTH_CONSTANTS.FORBIDDEN });
      }

      next();
    };
  }
}
