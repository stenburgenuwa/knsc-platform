// Referee Dashboard Service
import { PrismaClient } from '@prisma/client';
import { RefereeDashboard, RefereeDashboardSummary } from '../types';

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getDashboard(leagueId: string, userId: string): Promise<RefereeDashboard> {
    // Verify user is assigned to this league
    const refereeManager = await this.prisma.refereeManager.findUnique({
      where: { leagueId_userId: { leagueId, userId } },
    });

    if (!refereeManager) {
      throw new Error('Unauthorized: User is not assigned to this league');
    }

    const league = await this.prisma.league.findUnique({ where: { id: leagueId } });

    if (!league) {
      throw new Error('League not found');
    }

    const summary = await this.getDashboardSummary(leagueId);
    const recentActivity = await this.getRecentActivity(leagueId);
    const unassignedFixtures = await this.getUnassignedFixtures(leagueId);
    const upcomingMatches = await this.getUpcomingMatches(leagueId);
    const pendingReports = await this.getPendingReports(leagueId);

    return {
      league: { id: league.id, name: league.name, logo: league.logo, season: league.season, currentRound: league.currentRound },
      summary,
      recentActivity,
      unassignedFixtures,
      upcomingMatches,
      pendingReports,
    };
  }

  private async getDashboardSummary(leagueId: string): Promise<RefereeDashboardSummary> {
    const [totalReferees, activeReferees, suspendedReferees, fixturesAwaitingAssignment, fixturesAssigned, reportsAwaitingReview, upcomingMatches] = await Promise.all([
      this.prisma.referee.count({ where: { leagueId, deletedAt: null } }),
      this.prisma.referee.count({ where: { leagueId, status: 'active', deletedAt: null } }),
      this.prisma.referee.count({ where: { leagueId, status: 'suspended', deletedAt: null } }),
      this.prisma.fixture.count({ where: { leagueId, assignedReferee: null, status: 'scheduled', deletedAt: null } }),
      this.prisma.assignment.count({ where: { leagueId, status: { not: 'cancelled' }, deletedAt: null } }),
      this.prisma.matchReport.count({ where: { fixture: { leagueId }, status: 'submitted', deletedAt: null } }),
      this.prisma.fixture.count({ where: { leagueId, kickoffTime: { gt: new Date() }, status: 'scheduled', deletedAt: null } }),
    ]);

    const reportsSubmittedToday = await this.prisma.matchReport.count({
      where: {
        fixture: { leagueId },
        submittedDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    const smsNotificationsSent = await this.prisma.smsNotification.count({
      where: { leagueId, status: 'sent', sentDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });

    return {
      totalReferees,
      activeReferees,
      suspendedReferees,
      fixturesAwaitingAssignment,
      fixturesAssigned,
      reportsAwaitingReview,
      reportsSubmittedToday,
      upcomingMatches,
      smsNotificationsSent,
    };
  }

  private async getRecentActivity(leagueId: string) {
    return await this.prisma.auditLog.findMany({
      where: { leagueId, deletedAt: null },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: { id: true, timestamp: true, action: true, details: true },
    });
  }

  private async getUnassignedFixtures(leagueId: string) {
    return await this.prisma.fixture.findMany({
      where: { leagueId, assignedReferee: null, status: 'scheduled', deletedAt: null },
      orderBy: { kickoffTime: 'asc' },
      take: 5,
      select: {
        id: true,
        matchNumber: true,
        homeClub: { select: { name: true } },
        awayClub: { select: { name: true } },
        kickoffTime: true,
        venue: true,
        round: true,
      },
    });
  }

  private async getUpcomingMatches(leagueId: string) {
    return await this.prisma.fixture.findMany({
      where: { leagueId, kickoffTime: { gt: new Date() }, status: 'scheduled', deletedAt: null },
      orderBy: { kickoffTime: 'asc' },
      take: 10,
      select: {
        id: true,
        matchNumber: true,
        homeClub: { select: { name: true } },
        awayClub: { select: { name: true } },
        kickoffTime: true,
        assignedReferee: { select: { fullName: true } },
        status: true,
      },
    });
  }

  private async getPendingReports(leagueId: string) {
    const awaiting = await this.prisma.matchReport.count({
      where: { fixture: { leagueId }, status: 'submitted', deletedAt: null },
    });

    const submittedToday = await this.prisma.matchReport.count({
      where: {
        fixture: { leagueId },
        submittedDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    const late = await this.prisma.matchReport.count({
      where: {
        fixture: { leagueId, kickoffTime: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        status: 'submitted',
      },
    });

    return { awaiting, submittedToday, late };
  }
}
