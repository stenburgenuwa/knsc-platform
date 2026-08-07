import { PrismaClient } from '@prisma/client';
import { 
  TeamManagerCreateInput,
  LeagueManagerCreateInput,
  RefereeManagerCreateInput 
} from '../types';
import { AUDIT_ACTIONS } from '../constants';

export class UserManagementService {
  private prisma: PrismaClient;
  private userId: string;

  constructor(prisma: PrismaClient, userId: string) {
    this.prisma = prisma;
    this.userId = userId;
  }

  /**
   * Create Team Manager account
   */
  async createTeamManager(input: TeamManagerCreateInput): Promise<any> {
    const teamManager = await this.prisma.teamManager.create({
      data: {
        userId: input.userId,
        clubId: input.clubId,
        appointmentDate: input.appointmentDate,
        status: 'Active',
      },
      include: { user: true, club: true },
    });

    await this.auditLog(AUDIT_ACTIONS.TEAM_MANAGER_CREATED, 'TeamManager', teamManager.id, null, {
      userId: input.userId,
      clubId: input.clubId,
    });

    return teamManager;
  }

  /**
   * Create League Manager account
   */
  async createLeagueManager(input: LeagueManagerCreateInput): Promise<any> {
    // Validate unique username
    const existing = await this.prisma.user.findUnique({
      where: { username: input.username },
    });

    if (existing) {
      throw new Error('Username already exists');
    }

    // Create user first
    const tempPassword = this.generateTemporaryPassword();
    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
        passwordHash: tempPassword, // Would be hashed in real implementation
        isActive: true,
        requiresPasswordChange: true,
      },
    });

    // Assign League Manager role
    const role = await this.prisma.role.findUnique({
      where: { roleName: 'League Manager' },
    });

    if (role) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }

    await this.auditLog(AUDIT_ACTIONS.LEAGUE_MANAGER_CREATED, 'User', user.id, null, {
      username: input.username,
      role: 'League Manager',
    });

    return {
      user,
      temporaryPassword: tempPassword,
    };
  }

  /**
   * Create Referee Manager account
   */
  async createRefereeManager(input: RefereeManagerCreateInput): Promise<any> {
    // Validate unique username
    const existing = await this.prisma.user.findUnique({
      where: { username: input.username },
    });

    if (existing) {
      throw new Error('Username already exists');
    }

    // Create user
    const tempPassword = this.generateTemporaryPassword();
    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
        passwordHash: tempPassword,
        isActive: true,
        requiresPasswordChange: true,
      },
    });

    // Assign Referee Manager role
    const role = await this.prisma.role.findUnique({
      where: { roleName: 'Referee Manager' },
    });

    if (role) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }

    await this.auditLog(AUDIT_ACTIONS.REFEREE_MANAGER_CREATED, 'User', user.id, null, {
      username: input.username,
      role: 'Referee Manager',
    });

    return {
      user,
      temporaryPassword: tempPassword,
    };
  }

  /**
   * Reset user password
   */
  async resetPassword(userId: string): Promise<string> {
    const tempPassword = this.generateTemporaryPassword();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: tempPassword,
        requiresPasswordChange: true,
      },
    });

    await this.auditLog('password_reset', 'User', userId, null, { passwordReset: true });

    return tempPassword;
  }

  /**
   * Suspend user
   */
  async suspendUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await this.auditLog('user_suspended', 'User', userId, null, { suspended: true });
  }

  /**
   * Reactivate user
   */
  async reactivateUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    await this.auditLog('user_reactivated', 'User', userId, null, { reactivated: true });
  }

  /**
   * List users by role
   */
  async listUsersByRole(roleName: string, limit = 20, offset = 0): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { roleName },
    });

    if (!role) {
      return { users: [], total: 0 };
    }

    const [users, total] = await Promise.all([
      this.prisma.userRole
        .findMany({
          where: { roleId: role.id },
          skip: offset,
          take: limit,
          include: { user: true },
        })
        .then(ur => ur.map(u => u.user)),
      this.prisma.userRole.count({ where: { roleId: role.id } }),
    ]);

    return { users, total, limit, offset };
  }

  /**
   * Generate temporary password
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Audit log helper
   */
  private async auditLog(
    action: string,
    entityType: string,
    entityId: string,
    previousValues: any,
    newValues: any
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: this.userId,
        module: 'platform-owner',
        action,
        entityType,
        entityId,
        previousValues,
        newValues,
      },
    });
  }
}
