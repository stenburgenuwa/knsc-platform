import { PrismaClient } from '@prisma/client';
import { PlatformOwnerDashboard, DashboardStatistics } from '../types';

export class DashboardService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get platform owner dashboard summary
   */
  async getDashboardSummary(): Promise<PlatformOwnerDashboard> {
    const [
      totalLeagues,
      totalClubs,
      totalPlayers,
      totalTeamManagers,
      totalLeagueManagers,
      totalRefereeManagers,
      totalReferees,
      fixturesThisWeek,
      completedFixtures,
      pendingPlayerApprovals,
      unreadNotifications,
    ] = await Promise.all([
      this.prisma.league.count(),
      this.prisma.club.count(),
      this.prisma.player.count(),
      this.prisma.teamManager.count({ where: { status: 'Active' } }),
      this.prisma.userRole.count({ where: { role: { roleName: 'League Manager' } } }),
      this.prisma.userRole.count({ where: { role: { roleName: 'Referee Manager' } } }),
      this.prisma.referee.count({ where: { status: 'Active' } }),
      this.getFixturesThisWeek(),
      this.getCompletedFixtures(),
      this.prisma.playerRegistration.count({ where: { status: 'Pending' } }),
      this.getUnreadNotificationsCount(),
    ]);

    return {
      totalLeagues,
      totalClubs,
      totalPlayers,
      totalTeamManagers,
      totalLeagueManagers,
      totalRefereeManagers,
      totalReferees,
      fixturesThisWeek,
      completedFixtures,
      pendingPlayerApprovals,
      pendingClubApprovals: 0, // To be implemented
      unreadNotifications,
    };
  }

  /**
   * Get fixtures scheduled this week
   */
  private async getFixturesThisWeek(): Promise<number> {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.fixture.count({
      where: {
        fixtureDate: {
          gte: now,
          lte: weekEnd,
        },
      },
    });
  }

  /**
   * Get completed fixtures count
   */
  private async getCompletedFixtures(): Promise<number> {
    return this.prisma.fixture.count({
      where: { fixtureStatus: 'Completed' },
    });
  }

  /**
   * Get unread notifications count
   */
  private async getUnreadNotificationsCount(): Promise<number> {
    return this.prisma.notification.count({
      where: { isRead: false },
    });
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(): Promise<DashboardStatistics> {
    const summary = await this.getDashboardSummary();

    return {
      timestamp: new Date(),
      leagueCount: summary.totalLeagues,
      clubCount: summary.totalClubs,
      playerCount: summary.totalPlayers,
      fixtureCount: summary.fixturesThisWeek,
      matchReportCount: summary.completedFixtures,
    };
  }

  /**
   * Get quick stats for widgets
   */
  async getWidgetStats(): Promise<any> {
    return {
      leagues: await this.prisma.league.count(),
      clubs: await this.prisma.club.count(),
      players: await this.prisma.player.count(),
      fixtures: await this.prisma.fixture.count(),
      completedMatches: await this.prisma.fixture.count({
        where: { fixtureStatus: 'Completed' },
      }),
      pendingApprovals: await this.prisma.playerRegistration.count({
        where: { status: 'Pending' },
      }),
      activeUsers: await this.prisma.user.count({ where: { isActive: true } }),
    };
  }
}
