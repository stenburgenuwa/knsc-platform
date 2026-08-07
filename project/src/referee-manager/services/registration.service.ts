// Referee Registration Service
import { PrismaClient } from '@prisma/client';
import { RefereeRegistration } from '../types';
import { REFEREE_STATUS, AUDIT_ACTION_TYPES } from '../constants';

export class RefereeRegistrationService {
  constructor(private prisma: PrismaClient) {}

  async registerReferee(leagueId: string, data: Omit<RefereeRegistration, 'id' | 'refereeNumber' | 'createdDate'>, userId: string) {
    // Validate duplicates
    const duplicateCheck = await this.validateDuplicates(data);
    if (duplicateCheck.length > 0) {
      throw new Error(`Duplicate found: ${duplicateCheck.join(', ')}`);
    }

    // Generate referee number
    const refereeNumber = await this.generateRefereeNumber(leagueId);

    const referee = await this.prisma.referee.create({
      data: {
        leagueId,
        refereeNumber,
        fullName: data.fullName,
        nationalId: data.nationalId,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        county: data.county,
        homeTown: data.homeTown,
        physicalAddress: data.physicalAddress,
        category: data.category,
        yearsOfExperience: data.yearsOfExperience,
        preferredLanguage: data.preferredLanguage,
        emergencyContact: data.emergencyContact,
        username: data.username,
        password: data.password,
        status: REFEREE_STATUS.INACTIVE,
        photoPath: data.photoPath,
        createdBy: userId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        leagueId,
        userId,
        action: AUDIT_ACTION_TYPES.REFEREE_CREATED,
        resourceType: 'Referee',
        resourceId: referee.id,
        details: `Referee registered: ${data.fullName} (${refereeNumber})`,
        timestamp: new Date(),
      },
    });

    return referee;
  }

  async editReferee(leagueId: string, refereeId: string, data: Partial<RefereeRegistration>, userId: string) {
    const referee = await this.prisma.referee.findUnique({ where: { id: refereeId } });

    if (!referee || referee.leagueId !== leagueId) {
      throw new Error('Referee not found or access denied');
    }

    // Don't allow duplicate checks if these fields aren't changing
    if ((data.username && data.username !== referee.username) || (data.email && data.email !== referee.email) || (data.phone && data.phone !== referee.phone)) {
      const duplicateCheck = await this.validateDuplicates(data, refereeId);
      if (duplicateCheck.length > 0) {
        throw new Error(`Duplicate found: ${duplicateCheck.join(', ')}`);
      }
    }

    const previousValues = { ...referee };

    await this.prisma.$transaction([
      this.prisma.referee.update({
        where: { id: refereeId },
        data: {
          fullName: data.fullName || referee.fullName,
          phone: data.phone || referee.phone,
          email: data.email || referee.email,
          county: data.county || referee.county,
          yearsOfExperience: data.yearsOfExperience ?? referee.yearsOfExperience,
          category: data.category || referee.category,
          updatedBy: userId,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.REFEREE_UPDATED,
          resourceType: 'Referee',
          resourceId: refereeId,
          details: `Referee updated: ${referee.fullName}`,
          previousValues: JSON.stringify(previousValues),
          newValues: JSON.stringify(data),
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Referee updated successfully' };
  }

  async suspendReferee(leagueId: string, refereeId: string, userId: string) {
    const referee = await this.prisma.referee.findUnique({ where: { id: refereeId } });

    if (!referee || referee.leagueId !== leagueId) {
      throw new Error('Referee not found or access denied');
    }

    await this.prisma.$transaction([
      this.prisma.referee.update({
        where: { id: refereeId },
        data: { status: REFEREE_STATUS.SUSPENDED, updatedBy: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.REFEREE_SUSPENDED,
          resourceType: 'Referee',
          resourceId: refereeId,
          details: `Referee suspended: ${referee.fullName}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Referee suspended successfully' };
  }

  async activateReferee(leagueId: string, refereeId: string, userId: string) {
    const referee = await this.prisma.referee.findUnique({ where: { id: refereeId } });

    if (!referee || referee.leagueId !== leagueId) {
      throw new Error('Referee not found or access denied');
    }

    await this.prisma.$transaction([
      this.prisma.referee.update({
        where: { id: refereeId },
        data: { status: REFEREE_STATUS.ACTIVE, updatedBy: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.REFEREE_ACTIVATED,
          resourceType: 'Referee',
          resourceId: refereeId,
          details: `Referee activated: ${referee.fullName}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Referee activated successfully' };
  }

  async archiveReferee(leagueId: string, refereeId: string, userId: string) {
    const referee = await this.prisma.referee.findUnique({ where: { id: refereeId } });

    if (!referee || referee.leagueId !== leagueId) {
      throw new Error('Referee not found or access denied');
    }

    await this.prisma.referee.update({
      where: { id: refereeId },
      data: { status: REFEREE_STATUS.ARCHIVED, deletedAt: new Date(), updatedBy: userId },
    });

    return { success: true, message: 'Referee archived successfully' };
  }

  async resetPassword(leagueId: string, refereeId: string, newPassword: string, userId: string) {
    const referee = await this.prisma.referee.findUnique({ where: { id: refereeId } });

    if (!referee || referee.leagueId !== leagueId) {
      throw new Error('Referee not found or access denied');
    }

    await this.prisma.$transaction([
      this.prisma.referee.update({
        where: { id: refereeId },
        data: { password: newPassword, updatedBy: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.PASSWORD_RESET,
          resourceType: 'Referee',
          resourceId: refereeId,
          details: `Password reset for referee: ${referee.fullName}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Password reset successfully' };
  }

  private async validateDuplicates(data: Partial<RefereeRegistration>, excludeId?: string): Promise<string[]> {
    const errors: string[] = [];

    if (data.nationalId) {
      const duplicate = await this.prisma.referee.findFirst({
        where: { nationalId: data.nationalId, id: { not: excludeId }, deletedAt: null },
      });
      if (duplicate) errors.push('National ID');
    }

    if (data.username) {
      const duplicate = await this.prisma.referee.findFirst({
        where: { username: data.username, id: { not: excludeId }, deletedAt: null },
      });
      if (duplicate) errors.push('Username');
    }

    if (data.phone) {
      const duplicate = await this.prisma.referee.findFirst({
        where: { phone: data.phone, id: { not: excludeId }, deletedAt: null },
      });
      if (duplicate) errors.push('Phone');
    }

    if (data.email) {
      const duplicate = await this.prisma.referee.findFirst({
        where: { email: data.email, id: { not: excludeId }, deletedAt: null },
      });
      if (duplicate) errors.push('Email');
    }

    return errors;
  }

  private async generateRefereeNumber(leagueId: string): Promise<string> {
    const lastReferee = await this.prisma.referee.findFirst({
      where: { leagueId },
      orderBy: { createdAt: 'desc' },
      select: { refereeNumber: true },
    });

    const lastNumber = lastReferee ? parseInt(lastReferee.refereeNumber.split('-')[1], 10) : 0;
    return `REF-${String(lastNumber + 1).padStart(5, '0')}`;
  }
}
