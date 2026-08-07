import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { JwtService } from '../utils/jwt';
import { AUTH_CONSTANTS } from '../constants';

/**
 * Authentication API Controller
 * Handles all authentication endpoints
 */

export class AuthController {
  private authService: AuthService;
  private jwtService: JwtService;
  private prisma: PrismaClient;

  constructor(authService: AuthService, jwtService: JwtService, prisma: PrismaClient) {
    this.authService = authService;
    this.jwtService = jwtService;
    this.prisma = prisma;
  }

  /**
   * POST /auth/login
   */
  async login(req: any, res: any) {
    try {
      const { email, password, rememberMe } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const ipAddress = this.getIpAddress(req);
      const userAgent = req.headers['user-agent'] || '';

      const loginResponse = await this.authService.login(
        { email, password, rememberMe },
        ipAddress,
        userAgent
      );

      res.status(200).json(loginResponse);
    } catch (error: any) {
      res.status(401).json({ error: error.message || AUTH_CONSTANTS.INVALID_CREDENTIALS });
    }
  }

  /**
   * POST /auth/logout
   */
  async logout(req: any, res: any) {
    try {
      const { userId, sessionId } = req.body;

      if (!userId || !sessionId) {
        return res.status(400).json({ error: 'User ID and session ID are required' });
      }

      const ipAddress = this.getIpAddress(req);
      await this.authService.logout(userId, sessionId, ipAddress);

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /auth/refresh
   */
  async refresh(req: any, res: any) {
    try {
      const { refreshToken, sessionId } = req.body;

      if (!refreshToken || !sessionId) {
        return res.status(400).json({ error: 'Refresh token and session ID are required' });
      }

      const { accessToken, expiresIn } = await this.authService.refreshAccessToken(
        refreshToken,
        sessionId
      );

      res.status(200).json({ accessToken, expiresIn });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * POST /auth/change-password
   */
  async changePassword(req: any, res: any) {
    try {
      const { userId } = req.user;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'All password fields are required' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      const ipAddress = this.getIpAddress(req);
      await this.authService.changePassword(userId, currentPassword, newPassword, ipAddress);

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /auth/password-reset/request
   */
  async requestPasswordReset(req: any, res: any) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const ipAddress = this.getIpAddress(req);
      const { token, expiresAt } = await this.authService.requestPasswordReset(email, ipAddress);

      // In production, send email with token
      // For now, return token (only for testing/development)
      res.status(200).json({
        message: 'Password reset instructions sent to email',
        token: process.env.NODE_ENV === 'development' ? token : undefined,
        expiresAt,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /auth/password-reset/confirm
   */
  async confirmPasswordReset(req: any, res: any) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      const ipAddress = this.getIpAddress(req);
      await this.authService.confirmPasswordReset(token, newPassword, ipAddress);

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /auth/me
   */
  async getCurrentUser(req: any, res: any) {
    try {
      const { userId } = req.user;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          isActive: true,
          isLocked: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          lastLoginAt: true,
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const roles = user.roles
        .filter(ur => !ur.expiresAt || ur.expiresAt > new Date())
        .map(ur => ur.role.roleName);

      const permissions = Array.from(
        new Set(
          user.roles
            .filter(ur => !ur.expiresAt || ur.expiresAt > new Date())
            .flatMap(ur => ur.role.permissions.map(rp => rp.permission.permissionName))
        )
      );

      res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        roles,
        permissions,
        isActive: user.isActive,
        isLocked: user.isLocked,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        lastLoginAt: user.lastLoginAt,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /auth/sessions
   */
  async getActiveSessions(req: any, res: any) {
    try {
      const { userId } = req.user;

      const sessions = await this.prisma.userSession.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          deviceName: true,
          browser: true,
          operatingSystem: true,
          ipAddress: true,
          loginTime: true,
        },
        orderBy: { loginTime: 'desc' },
      });

      res.status(200).json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /auth/sessions/:sessionId
   */
  async terminateSession(req: any, res: any) {
    try {
      const { userId } = req.user;
      const { sessionId } = req.params;

      const session = await this.prisma.userSession.findUnique({
        where: { id: sessionId },
      });

      if (!session || session.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await this.prisma.userSession.update({
        where: { id: sessionId },
        data: { isActive: false, logoutTime: new Date() },
      });

      res.status(200).json({ message: 'Session terminated' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /auth/login-history
   */
  async getLoginHistory(req: any, res: any) {
    try {
      const { userId } = req.user;
      const limit = parseInt(req.query.limit) || 20;

      const history = await this.prisma.loginHistory.findMany({
        where: { userId },
        select: {
          id: true,
          emailAttempted: true,
          ipAddress: true,
          browser: true,
          operatingSystem: true,
          success: true,
          failureReason: true,
          loginTime: true,
        },
        orderBy: { loginTime: 'desc' },
        take: limit,
      });

      res.status(200).json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Helper: Get IP address from request
   */
  private getIpAddress(req: any): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      'unknown';
  }
}
