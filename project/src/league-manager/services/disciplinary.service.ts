// Disciplinary Management Service - Disciplinary Cases & Sanctions
import { PrismaClient } from '@prisma/client';
import { DisciplinaryCase } from '../types';
import { DISCIPLINARY_STATUS, AUDIT_ACTION_TYPES } from '../constants';

export class DisciplinaryService {
  constructor(private prisma: PrismaClient) {}

  async getCases(leagueId: string, page: number = 1, limit: number = 20, filters?: Record<string, unknown>) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { leagueId, deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.caseType) where.caseType = filters.caseType;

    const [cases, total] = await Promise.all([
      this.prisma.disciplinaryCase.findMany({
        where,
        orderBy: { createdDate: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          caseNumber: true,
          caseType: true,
          playerOrClub: true,
          reason: true,
          status: true,
          createdDate: true,
          decisionDate: true,
        },
      }),
      this.prisma.disciplinaryCase.count({ where }),
    ]);

    return { cases, total, page, pages: Math.ceil(total / limit) };
  }

  async getCaseDetail(leagueId: string, caseId: string) {
    const disciplinaryCase = await this.prisma.disciplinaryCase.findUnique({
      where: { id: caseId },
    });

    if (!disciplinaryCase || disciplinaryCase.leagueId !== leagueId) {
      throw new Error('Case not found or access denied');
    }

    return disciplinaryCase;
  }

  async createCase(
    leagueId: string,
    caseData: { caseType: 'player' | 'club' | 'official'; playerOrClub: string; reason: string; evidence?: string },
    userId: string,
  ) {
    const caseNumber = await this.generateCaseNumber(leagueId);

    const newCase = await this.prisma.disciplinaryCase.create({
      data: {
        leagueId,
        caseNumber,
        caseType: caseData.caseType,
        playerOrClub: caseData.playerOrClub,
        reason: caseData.reason,
        evidence: caseData.evidence,
        status: DISCIPLINARY_STATUS.OPEN,
        createdDate: new Date(),
        createdBy: userId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        leagueId,
        userId,
        action: AUDIT_ACTION_TYPES.DISCIPLINARY_CASE_CREATED,
        resourceType: 'DisciplinaryCase',
        resourceId: newCase.id,
        details: `Disciplinary case created: ${caseNumber}`,
        timestamp: new Date(),
      },
    });

    return newCase;
  }

  async recordDecision(
    leagueId: string,
    caseId: string,
    decision: string,
    userId: string,
  ) {
    const disciplinaryCase = await this.prisma.disciplinaryCase.findUnique({
      where: { id: caseId },
    });

    if (!disciplinaryCase || disciplinaryCase.leagueId !== leagueId) {
      throw new Error('Case not found or access denied');
    }

    await this.prisma.$transaction([
      this.prisma.disciplinaryCase.update({
        where: { id: caseId },
        data: {
          status: DISCIPLINARY_STATUS.DECIDED,
          decision,
          decisionDate: new Date(),
          updatedBy: userId,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.DISCIPLINARY_DECISION_MADE,
          resourceType: 'DisciplinaryCase',
          resourceId: caseId,
          details: `Decision made on case: ${disciplinaryCase.caseNumber}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Decision recorded successfully' };
  }

  async closeCase(leagueId: string, caseId: string, userId: string) {
    const disciplinaryCase = await this.prisma.disciplinaryCase.findUnique({
      where: { id: caseId },
    });

    if (!disciplinaryCase || disciplinaryCase.leagueId !== leagueId) {
      throw new Error('Case not found or access denied');
    }

    await this.prisma.disciplinaryCase.update({
      where: { id: caseId },
      data: { status: DISCIPLINARY_STATUS.CLOSED, updatedBy: userId },
    });

    return { success: true, message: 'Case closed successfully' };
  }

  async recordSuspension(leagueId: string, caseId: string, suspensionDays: number, userId: string) {
    const disciplinaryCase = await this.prisma.disciplinaryCase.findUnique({
      where: { id: caseId },
    });

    if (!disciplinaryCase || disciplinaryCase.leagueId !== leagueId) {
      throw new Error('Case not found or access denied');
    }

    const suspensionUntil = new Date();
    suspensionUntil.setDate(suspensionUntil.getDate() + suspensionDays);

    await this.prisma.disciplinaryCase.update({
      where: { id: caseId },
      data: {
        decision: `Suspended for ${suspensionDays} days until ${suspensionUntil.toDateString()}`,
        updatedBy: userId,
      },
    });

    return { success: true, message: `Player/Club suspended for ${suspensionDays} days` };
  }

  async recordRedCardAccumulation(leagueId: string, playerId: string, userId: string) {
    // Find player's accumulated red cards
    const redCards = await this.prisma.redCards.count({
      where: {
        fixture: { leagueId },
        playerId,
      },
    });

    if (redCards >= 2) {
      // Create disciplinary case for automatic suspension
      const caseNumber = await this.generateCaseNumber(leagueId);

      await this.prisma.disciplinaryCase.create({
        data: {
          leagueId,
          caseNumber,
          caseType: 'player',
          playerOrClub: playerId,
          reason: `Automatic suspension - ${redCards} red cards`,
          status: DISCIPLINARY_STATUS.DECIDED,
          decision: 'Automatic suspension - 2 red cards = 1 match ban',
          decisionDate: new Date(),
          createdBy: userId,
        },
      });
    }
  }

  async recordYellowCardAccumulation(leagueId: string, playerId: string, userId: string) {
    // Find player's accumulated yellow cards
    const yellowCards = await this.prisma.yellowCards.count({
      where: {
        fixture: { leagueId },
        playerId,
      },
    });

    if (yellowCards >= 5) {
      // Create disciplinary case for automatic suspension
      const caseNumber = await this.generateCaseNumber(leagueId);

      await this.prisma.disciplinaryCase.create({
        data: {
          leagueId,
          caseNumber,
          caseType: 'player',
          playerOrClub: playerId,
          reason: `Automatic suspension - ${yellowCards} yellow cards`,
          status: DISCIPLINARY_STATUS.DECIDED,
          decision: 'Automatic suspension - 5 yellow cards = 1 match ban',
          decisionDate: new Date(),
          createdBy: userId,
        },
      });
    }
  }

  private async generateCaseNumber(leagueId: string): Promise<string> {
    const lastCase = await this.prisma.disciplinaryCase.findFirst({
      where: { leagueId },
      orderBy: { createdDate: 'desc' },
      select: { caseNumber: true },
    });

    const lastNumber = lastCase ? parseInt(lastCase.caseNumber.split('-')[1], 10) : 0;
    return `DISC-${String(lastNumber + 1).padStart(5, '0')}`;
  }
}
