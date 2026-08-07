// Referee Availability Service
import { PrismaClient } from '@prisma/client';
import { RefereeAvailability } from '../types';
import { AVAILABILITY_STATUS } from '../constants';

export class AvailabilityService {
  constructor(private prisma: PrismaClient) {}

  async updateAvailability(leagueId: string, refereeId: string, status: string, notes?: string) {
    const referee = await this.prisma.referee.findUnique({ where: { id: refereeId } });

    if (!referee || referee.leagueId !== leagueId) {
      throw new Error('Referee not found or access denied');
    }

    if (!Object.values(AVAILABILITY_STATUS).includes(status)) {
      throw new Error('Invalid availability status');
    }

    const availability = await this.prisma.refereeAvailability.upsert({
      where: { refereeId },
      update: { status, updatedDate: new Date(), notes },
      create: { refereeId, status, updatedDate: new Date(), notes },
    });

    return availability;
  }

  async getAvailability(leagueId: string, refereeId: string) {
    const referee = await this.prisma.referee.findUnique({ where: { id: refereeId } });

    if (!referee || referee.leagueId !== leagueId) {
      throw new Error('Referee not found or access denied');
    }

    return await this.prisma.refereeAvailability.findUnique({ where: { refereeId } });
  }

  async getAvailableReferees(leagueId: string) {
    return await this.prisma.referee.findMany({
      where: {
        leagueId,
        status: 'active',
        deletedAt: null,
        availability: { status: AVAILABILITY_STATUS.AVAILABLE },
      },
      select: {
        id: true,
        fullName: true,
        refereeNumber: true,
        category: true,
        phone: true,
        availability: true,
      },
    });
  }
}
