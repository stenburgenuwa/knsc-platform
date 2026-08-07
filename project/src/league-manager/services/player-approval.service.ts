// Player Approval Service - Player Registration Review & Approval Workflows
import { PrismaClient } from '@prisma/client';
import { PlayerApprovalRequest } from '../types';
import { PLAYER_APPROVAL_STATUS, AUDIT_ACTION_TYPES } from '../constants';

export class PlayerApprovalService {
  constructor(private prisma: PrismaClient) {}

  async getPendingApprovals(leagueId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [approvals, total] = await Promise.all([
      this.prisma.playerRegistration.findMany({
        where: { leagueId, status: PLAYER_APPROVAL_STATUS.PENDING, deletedAt: null },
        orderBy: { submittedDate: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          playerId: true,
          player: { select: { name: true, dateOfBirth: true } },
          club: { select: { name: true } },
          position: true,
          registrationNumber: true,
          photoPath: true,
          nationalIdPath: true,
          birthCertificatePath: true,
          emergencyContact: true,
          phone: true,
          preferredFoot: true,
          height: true,
          weight: true,
          submittedDate: true,
          status: true,
        },
      }),
      this.prisma.playerRegistration.count({
        where: { leagueId, status: PLAYER_APPROVAL_STATUS.PENDING, deletedAt: null },
      }),
    ]);

    return { approvals, total, page, pages: Math.ceil(total / limit) };
  }

  async getApprovalDetail(leagueId: string, registrationId: string) {
    const registration = await this.prisma.playerRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.leagueId !== leagueId) {
      throw new Error('Registration not found or access denied');
    }

    const approvalHistory = await this.prisma.playerApprovalHistory.findMany({
      where: { registrationId },
      orderBy: { timestamp: 'desc' },
    });

    return { registration, approvalHistory };
  }

  async approveRegistration(leagueId: string, registrationId: string, userId: string, notes?: string) {
    const registration = await this.prisma.playerRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.leagueId !== leagueId) {
      throw new Error('Registration not found or access denied');
    }

    if (registration.status !== PLAYER_APPROVAL_STATUS.PENDING) {
      throw new Error(`Cannot approve registration with status: ${registration.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.playerRegistration.update({
        where: { id: registrationId },
        data: { status: PLAYER_APPROVAL_STATUS.APPROVED, updatedBy: userId },
      }),
      this.prisma.playerApprovalHistory.create({
        data: {
          registrationId,
          action: PLAYER_APPROVAL_STATUS.APPROVED,
          reviewedBy: userId,
          notes,
          timestamp: new Date(),
        },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.PLAYER_APPROVED,
          resourceType: 'PlayerRegistration',
          resourceId: registrationId,
          details: `Player registration approved: ${registration.playerId}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Player registration approved' };
  }

  async rejectRegistration(leagueId: string, registrationId: string, userId: string, reason: string) {
    const registration = await this.prisma.playerRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.leagueId !== leagueId) {
      throw new Error('Registration not found or access denied');
    }

    if (registration.status !== PLAYER_APPROVAL_STATUS.PENDING) {
      throw new Error(`Cannot reject registration with status: ${registration.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.playerRegistration.update({
        where: { id: registrationId },
        data: { status: PLAYER_APPROVAL_STATUS.REJECTED, updatedBy: userId },
      }),
      this.prisma.playerApprovalHistory.create({
        data: {
          registrationId,
          action: PLAYER_APPROVAL_STATUS.REJECTED,
          reviewedBy: userId,
          notes: reason,
          timestamp: new Date(),
        },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.PLAYER_REJECTED,
          resourceType: 'PlayerRegistration',
          resourceId: registrationId,
          details: `Player registration rejected: ${registration.playerId}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Player registration rejected' };
  }

  async requestChanges(leagueId: string, registrationId: string, userId: string, requiredChanges: string) {
    const registration = await this.prisma.playerRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.leagueId !== leagueId) {
      throw new Error('Registration not found or access denied');
    }

    if (registration.status !== PLAYER_APPROVAL_STATUS.PENDING) {
      throw new Error(`Cannot request changes for registration with status: ${registration.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.playerRegistration.update({
        where: { id: registrationId },
        data: { status: PLAYER_APPROVAL_STATUS.CHANGES_REQUESTED, updatedBy: userId },
      }),
      this.prisma.playerApprovalHistory.create({
        data: {
          registrationId,
          action: PLAYER_APPROVAL_STATUS.CHANGES_REQUESTED,
          reviewedBy: userId,
          notes: requiredChanges,
          timestamp: new Date(),
        },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.PLAYER_CHANGES_REQUESTED,
          resourceType: 'PlayerRegistration',
          resourceId: registrationId,
          details: `Changes requested for player registration: ${registration.playerId}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Changes requested from team manager' };
  }

  async validateRegistration(registrationId: string): Promise<{ valid: boolean; errors: string[] }> {
    const registration = await this.prisma.playerRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return { valid: false, errors: ['Registration not found'] };
    }

    const errors: string[] = [];

    // Check for missing required fields
    if (!registration.photoPath) errors.push('Missing player photograph');
    if (!registration.nationalIdPath && !registration.birthCertificatePath) {
      errors.push('Missing national ID or birth certificate');
    }
    if (!registration.emergencyContact) errors.push('Missing emergency contact');
    if (!registration.phone) errors.push('Missing phone number');

    // Check for duplicate registrations
    const duplicate = await this.prisma.playerRegistration.findFirst({
      where: {
        registrationNumber: registration.registrationNumber,
        id: { not: registrationId },
        status: PLAYER_APPROVAL_STATUS.APPROVED,
        deletedAt: null,
      },
    });

    if (duplicate) {
      errors.push('Duplicate registration number found');
    }

    // Age validation (must be at least 16)
    if (registration.player) {
      const age = new Date().getFullYear() - registration.player.dateOfBirth.getFullYear();
      if (age < 16) {
        errors.push('Player must be at least 16 years old');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
