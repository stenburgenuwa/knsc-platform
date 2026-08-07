import { PrismaClient } from '@prisma/client';
import { ReportGenerateInput, AuditLogFilter } from '../types';

export class ReportService {
  private prisma: PrismaClient;
  private userId: string;

  constructor(prisma: PrismaClient, userId: string) {
    this.prisma = prisma;
    this.userId = userId;
  }

  /**
   * Generate player registrations report
   */
  async generatePlayerReport(filters?: Record<string, any>): Promise<any> {
    const players = await this.prisma.playerRegistration.findMany({
      where: filters || {},
      include: { player: true, club: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      reportType: 'Player Registrations',
      generatedAt: new Date(),
      generatedBy: this.userId,
      totalRecords: players.length,
      data: players,
    };
  }

  /**
   * Generate club registrations report
   */
  async generateClubReport(filters?: Record<string, any>): Promise<any> {
    const clubs = await this.prisma.club.findMany({
      where: filters || {},
      include: { players: true, fixtures: true },
      orderBy: { clubName: 'asc' },
    });

    const data = clubs.map(club => ({
      ...club,
      playerCount: club.players.length,
      fixtureCount: club.fixtures.length,
    }));

    return {
      reportType: 'Club Registrations',
      generatedAt: new Date(),
      generatedBy: this.userId,
      totalRecords: clubs.length,
      data,
    };
  }

  /**
   * Generate league summary report
   */
  async generateLeagueSummary(): Promise<any> {
    const leagues = await this.prisma.league.findMany({
      include: {
        clubs: true,
        fixtures: true,
        leagueTables: true,
      },
    });

    return {
      reportType: 'League Summary',
      generatedAt: new Date(),
      generatedBy: this.userId,
      totalLeagues: leagues.length,
      data: leagues.map(league => ({
        id: league.id,
        leagueName: league.leagueName,
        clubCount: league.clubs.length,
        fixtureCount: league.fixtures.length,
        completedFixtures: league.fixtures.filter(f => f.fixtureStatus === 'Completed').length,
      })),
    };
  }

  /**
   * Generate top scorers report
   */
  async generateTopScorersReport(leagueId?: string): Promise<any> {
    // Query goals by player
    const topScorers = await this.prisma.goalRecord.findMany({
      take: 50,
      orderBy: { goals: 'desc' },
      include: { player: true, club: true },
    });

    return {
      reportType: 'Top Scorers',
      generatedAt: new Date(),
      generatedBy: this.userId,
      leagueId,
      totalRecords: topScorers.length,
      data: topScorers,
    };
  }

  /**
   * Generate disciplinary report
   */
  async generateDisciplinaryReport(): Promise<any> {
    const yellowCards = await this.prisma.disciplinaryRecord.findMany({
      where: { cardType: 'Yellow' },
      include: { player: true, club: true },
    });

    const redCards = await this.prisma.disciplinaryRecord.findMany({
      where: { cardType: 'Red' },
      include: { player: true, club: true },
    });

    return {
      reportType: 'Disciplinary',
      generatedAt: new Date(),
      generatedBy: this.userId,
      yellowCards: yellowCards.length,
      redCards: redCards.length,
      data: {
        yellowCards,
        redCards,
      },
    };
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters: AuditLogFilter): Promise<any> {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.module) where.module = filters.module;
    if (filters.action) where.action = filters.action;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  }
}
