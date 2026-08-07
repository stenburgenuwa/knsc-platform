import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../utils/password';
import { JwtService } from '../utils/jwt';
import { LoginRequest, LoginResponse, AuthUser, AccountStatus } from '../types';
import { AUTH_CONSTANTS } from '../constants';

export class AuthService {
  private prisma: PrismaClient;
  private jwtService: JwtService;

  constructor(prisma: PrismaClient, jwtService: JwtService) {
    this.prisma = prisma;
    this.jwtService = jwtService;
  }

  /**
   * Authenticate user and return tokens
   */
  async login(credentials: LoginRequest, ipAddress: string, userAgent: string): Promise<LoginResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
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

    // Log failed attempt if user not found
    if (!user) {
      await this.logLoginFailure(credentials.email, ipAddress, userAgent, 'User not found');
      throw new Error(AUTH_CONSTANTS.INVALID_CREDENTIALS);
    }

    // Check account status
    if (!user.isActive) {
      await this.logLoginFailure(credentials.email, ipAddress, userAgent, 'Account inactive');
      throw new Error(AUTH_CONSTANTS.ACCOUNT_INACTIVE);
    }

    if (user.isLocked) {
      await this.logLoginFailure(credentials.email, ipAddress, userAgent, 'Account locked');
      throw new Error(AUTH_CONSTANTS.ACCOUNT_LOCKED);
    }

    // Verify password
    const passwordValid = await PasswordService.verifyPassword(credentials.password, user.passwordHash);
    if (!passwordValid) {
      await this.incrementFailedLoginAttempts(user.id);
      await this.logLoginFailure(credentials.email, ipAddress, userAgent, 'Invalid password');
      throw new Error(AUTH_CONSTANTS.INVALID_CREDENTIALS);
    }

    // Reset failed attempts on successful login
    await this.resetFailedLoginAttempts(user.id);

    // Create session
    const session = await this.createSession(user.id, ipAddress, userAgent);

    // Get user roles and permissions
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

    // Build auth user
    const authUser: AuthUser = {
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
    };

    // Create tokens
    const accessToken = this.jwtService.createAccessToken(
      user.id,
      user.email,
      roles,
      permissions
    );
    const refreshToken = this.jwtService.createRefreshToken(user.id);

    // Update refresh token in session
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { refreshToken },
    });

    // Log successful login
    await this.logLoginSuccess(user.id, credentials.email, ipAddress, userAgent);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Determine redirect URL based on role
    const redirectUrl = this.getRedirectUrl(roles[0] || 'Public');

    return {
      accessToken,
      refreshToken,
      user: authUser,
      expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY_MINUTES * 60,
      redirectUrl,
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string, sessionId: string, ipAddress: string): Promise<void> {
    // Invalidate session
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false, logoutTime: new Date() },
    });

    // Log logout
    await this.auditLog(userId, 'auth', 'logout', 'UserSession', sessionId, null, null, ipAddress);
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string, sessionId: string): Promise<{ accessToken: string; expiresIn: number }> {
    // Verify refresh token
    const payload = this.jwtService.verify(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      throw new Error(AUTH_CONSTANTS.INVALID_TOKEN);
    }

    // Check session is still active
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.isActive) {
      throw new Error(AUTH_CONSTANTS.SESSION_EXPIRED);
    }

    // Get user with updated roles/permissions
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
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
      throw new Error(AUTH_CONSTANTS.ACCOUNT_NOT_FOUND);
    }

    // Get updated roles and permissions
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

    // Create new access token
    const accessToken = this.jwtService.createAccessToken(
      user.id,
      user.email,
      roles,
      permissions
    );

    return {
      accessToken,
      expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY_MINUTES * 60,
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string, ipAddress: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(AUTH_CONSTANTS.ACCOUNT_NOT_FOUND);
    }

    // Verify current password
    const passwordValid = await PasswordService.verifyPassword(currentPassword, user.passwordHash);
    if (!passwordValid) {
      throw new Error(AUTH_CONSTANTS.PASSWORD_MISMATCH);
    }

    // Validate new password
    const validation = PasswordService.validatePassword(newPassword);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Hash new password
    const newPasswordHash = await PasswordService.hashPassword(newPassword);

    // Update password and invalidate sessions
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all active sessions
    await this.prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, logoutTime: new Date() },
    });

    // Log password change
    await this.auditLog(userId, 'auth', 'change_password', 'User', userId, null, null, ipAddress);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string, ipAddress: string): Promise<{ token: string; expiresAt: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        token: '',
        expiresAt: new Date(),
      };
    }

    // Generate reset token
    const token = this.generateRandomToken();
    const expiresAt = new Date(Date.now() + AUTH_CONSTANTS.PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store reset token
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Log password reset request
    await this.auditLog(user.id, 'auth', 'request_password_reset', 'User', user.id, null, null, ipAddress);

    return { token, expiresAt };
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(token: string, newPassword: string, ipAddress: string): Promise<void> {
    // Find reset token
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt) {
      throw new Error(AUTH_CONSTANTS.INVALID_TOKEN);
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error('Password reset token has expired');
    }

    // Validate new password
    const validation = PasswordService.validatePassword(newPassword);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Hash new password
    const newPasswordHash = await PasswordService.hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all active sessions
    await this.prisma.userSession.updateMany({
      where: { userId: resetToken.userId, isActive: true },
      data: { isActive: false, logoutTime: new Date() },
    });

    // Log password reset
    await this.auditLog(resetToken.userId, 'auth', 'reset_password', 'User', resetToken.userId, null, null, ipAddress);
  }

  /**
   * Create user session
   */
  private async createSession(userId: string, ipAddress: string, userAgent: string): Promise<any> {
    return this.prisma.userSession.create({
      data: {
        userId,
        ipAddress: ipAddress || undefined,
        browser: this.parseBrowser(userAgent),
        operatingSystem: this.parseOS(userAgent),
        isActive: true,
      },
    });
  }

  /**
   * Increment failed login attempts
   */
  private async incrementFailedLoginAttempts(userId: string): Promise<void> {
    // This would be tracked in a separate failed_attempts table or cache
    // For now, using SystemSetting as a workaround
    const settingKey = `failed_attempts_${userId}`;
    const current = await this.prisma.systemSetting.findUnique({
      where: { settingKey },
    });

    const count = current ? parseInt(current.settingValue) + 1 : 1;

    if (count >= AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS) {
      // Lock account
      await this.prisma.user.update({
        where: { id: userId },
        data: { isLocked: true },
      });
    }

    // Store attempt count with expiry
    await this.prisma.systemSetting.upsert({
      where: { settingKey },
      update: { settingValue: count.toString() },
      create: {
        settingKey,
        settingValue: count.toString(),
        description: `Failed login attempts for user ${userId}`,
      },
    });
  }

  /**
   * Reset failed login attempts
   */
  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    const settingKey = `failed_attempts_${userId}`;
    await this.prisma.systemSetting.deleteMany({
      where: { settingKey },
    });
  }

  /**
   * Log successful login
   */
  private async logLoginSuccess(userId: string, email: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.prisma.loginHistory.create({
      data: {
        userId,
        emailAttempted: email,
        ipAddress: ipAddress || undefined,
        browser: this.parseBrowser(userAgent),
        operatingSystem: this.parseOS(userAgent),
        success: true,
      },
    });

    await this.auditLog(userId, 'auth', 'login', 'User', userId, null, null, ipAddress, userAgent);
  }

  /**
   * Log failed login attempt
   */
  private async logLoginFailure(email: string, ipAddress: string, userAgent: string, reason: string): Promise<void> {
    await this.prisma.loginHistory.create({
      data: {
        emailAttempted: email,
        ipAddress: ipAddress || undefined,
        browser: this.parseBrowser(userAgent),
        operatingSystem: this.parseOS(userAgent),
        success: false,
        failureReason: reason,
      },
    });
  }

  /**
   * Get redirect URL based on role
   */
  private getRedirectUrl(role: string): string {
    const routes: Record<string, string> = {
      'Platform Owner': '/dashboard/platform',
      'League Manager': '/dashboard/league',
      'Referee Manager': '/dashboard/referee',
      'Team Manager': '/dashboard/team',
      'Referee': '/dashboard/match',
    };
    return routes[role] || '/dashboard';
  }

  /**
   * Generate random token
   */
  private generateRandomToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Parse browser from user agent
   */
  private parseBrowser(userAgent: string): string | undefined {
    if (!userAgent) return undefined;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Parse OS from user agent
   */
  private parseOS(userAgent: string): string | undefined {
    if (!userAgent) return undefined;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Audit log
   */
  private async auditLog(
    userId: string | undefined,
    module: string,
    action: string,
    entityType: string,
    entityId: string | undefined,
    previousValues: any,
    newValues: any,
    ipAddress: string | undefined,
    userAgent: string | undefined = undefined
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: userId || undefined,
        module,
        action,
        entityType,
        entityId: entityId || undefined,
        previousValues: previousValues || undefined,
        newValues: newValues || undefined,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
      },
    });
  }
}
