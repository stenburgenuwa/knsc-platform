import { PrismaClient } from '@prisma/client';
import { PlayerApprovalInput } from '../types';
import { AUDIT_ACTIONS, PLATFORM_OWNER_CONSTANTS } from '../constants';

export class PlayerApprovalService {
  private prisma: PrismaClient;
  private userId: string;

  constructor(prisma: PrismaClient, userId: string) {
    this.prisma = prisma;
    this.userId = userId;
  }

  /**
   * Get pending player approvals
   */
  async getPendingApprovals(limit = 20, offset = 0): Promise<any> {
    const [registrations, total] = await Promise.all([
      this.prisma.playerRegistration.findMany({
        where: { status: PLATFORM_OWNER_CONSTANTS.PLAYER_APPROVAL_STATUS.PENDING },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          player: true,
          club: true,
          approvalHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      this.prisma.playerRegistration.count({
        where: { status: PLATFORM_OWNER_CONSTANTS.PLAYER_APPROVAL_STATUS.PENDING },
      }),
    ]);

    return { registrations, total, limit, offset };
  }

  /**
   * Approve player registration
   */
  async approvePlayer(input: PlayerApprovalInput): Promise<any> {
    const registration = await this.prisma.playerRegistration.findUnique({
      where: { id: input.playerRegistrationId },
    });

    if (!registration) {
      throw new Error('Player registration not found');
    }

    const updated = await this.prisma.playerRegistration.update({
      where: { id: input.playerRegistrationId },
      data: {
        status: PLATFORM_OWNER_CONSTANTS.PLAYER_APPROVAL_STATUS.APPROVED,
        approvedBy: this.userId,
        approvedAt: new Date(),
      },
      include: { player: true, club: true },
    });

    // Record approval history
    await this.prisma.playerApprovalHistory.create({
      data: {
        playerRegistrationId: input.playerRegistrationId,
        approvedBy: this.userId,
        action: 'Approved',
        comments: input.comments,
      },
    });

    // Audit log
    await this.auditLog(AUDIT_ACTIONS.PLAYER_APPROVED, 'PlayerRegistration', input.playerRegistrationId, registration, updated);

    return updated;
  }

  /**
   * Reject player registration
   */
  async rejectPlayer(input: PlayerApprovalInput): Promise<any> {
    const registration = await this.prisma.playerRegistration.findUnique({
      where: { id: input.playerRegistrationId },
    });

    if (!registration) {
      throw new Error('Player registration not found');
    }

    const updated = await this.prisma.playerRegistration.update({
      where: { id: input.playerRegistrationId },
      data: {
        status: PLATFORM_OWNER_CONSTANTS.PLAYER_APPROVAL_STATUS.REJECTED,
        rejectedBy: this.userId,
        rejectedAt: new Date(),
      },
    });

    // Record rejection history
    await this.prisma.playerApprovalHistory.create({
      data: {
        playerRegistrationId: input.playerRegistrationId,
        approvedBy: this.userId,
        action: 'Rejected',
        comments: input.comments,
      },
    });

    // Audit log
    await this.auditLog(AUDIT_ACTIONS.PLAYER_REJECTED, 'PlayerRegistration', input.playerRegistrationId, registration, updated);

    return updated;
  }

  /**
   * Request changes to player registration
   */
  async requestChanges(input: PlayerApprovalInput): Promise<any> {
    const registration = await this.playerRegistration.findUnique({
      where: { id: input.playerRegistrationId },
    });

    if (!registration) {
      throw new Error('Player registration not found');
    }

    const updated = await this.prisma.playerRegistration.update({
      where: { id: input.playerRegistrationId },
      data: {
        status: PLATFORM_OWNER_CONSTANTS.PLAYER_APPROVAL_STATUS.PENDING_CHANGES,
      },
    });

    // Record history
    await this.prisma.playerApprovalHistory.create({
      data: {
        playerRegistrationId: input.playerRegistrationId,
        approvedBy: this.userId,
        action: 'RequestedChanges',
        comments: input.comments,
      },
    });

    // Audit log
    await this.auditLog('player_changes_requested', 'PlayerRegistration', input.playerRegistrationId, registration, updated);

    return updated;
  }

  /**
   * Get approval statistics
   */
  async getApprovalStats(): Promise<any> {
    const total = await this.prisma.playerRegistration.count();
    const pending = await this.prisma.playerRegistration.count({
      where: { status: PLATFORM_OWNER_CONSTANTS.PLAYER_APPROVAL_STATUS.PENDING },
    });
    const approved = await this.prisma.playerRegistration.count({
      where: { status: PLATFORM_OWNER_CONSTANTS.PLAYER_APPROVAL_STATUS.APPROVED },
    });
    const rejected = await this.prisma.playerRegistration.count({
      where: { status: PLATFORM_OWNER_CONSTANTS.PLAYER_APPROVAL_STATUS.REJECTED },
    });

    return { total, pending, approved, rejected };
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
