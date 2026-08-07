// Dashboard Service - League Manager Dashboard Operations
import { PrismaClient } from '@prisma/client';
import { LeagueManagerDashboard, DashboardSummary } from '../types';

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getDashboard(leagueId: string, userId: string): Promise<LeagueManagerDashboard> {
    // Verify user is assigned to this league
    const leagueAssignment = await this.prisma.leagueManager.findUnique({
      where: { leagueId_userId: { leagueId, userId } },
    });

    if (!leagueAssignment) {
      throw new Error('Unauthorized: User is not assigned to this league');
    }

    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      throw new Error('League not found');
    }

    const summary = await this.getDashboardSummary(leagueId);
    const recentActivity = await this.getRecentActivity(leagueId);
    const upcomingFixtures = await this.getUpcomingFixtures(leagueId);
    const pendingApprovals = await this.getPendingApprovals(leagueId);

    return {
      league: {
        id: league.id,
        name: league.name,
        logo: league.logo,
        competitionType: league.competitionType,
        season: league.season,
        county: league.county,
        currentRound: league.currentRound,
        status: league.status as 'active' | 'inactive' | 'archived',
        startDate: league.startDate,
        endDate: league.endDate,
      },
      summary,
      recentActivity,
      upcomingFixtures,
      pendingApprovals,
    };
  }

  private async getDashboardSummary(leagueId: string): Promise<DashboardSummary> {
    const [totalClubs, totalPlayers, pendingPlayerApprovals, pendingMatchReports, activeReferees, disciplinaryCases] =
      await Promise.all([
        this.prisma.club.count({ where: { leagueId, deletedAt: null } }),
        this.prisma.player.count({ where: { club: { leagueId }, deletedAt: null } }),
        this.prisma.playerRegistration.count({ where: { league: { id: leagueId }, status: 'pending', deletedAt: null } }),
        this.prisma.matchReport.count({ where: { fixture: { leagueId }, status: 'pending', deletedAt: null } }),
        this.prisma.referee.count({ where: { assignedLeagues: { some: { id: leagueId } }, deletedAt: null } }),
        this.prisma.disciplinaryCase.count({ where: { leagueId, status: { not: 'closed' }, deletedAt: null } }),
      ]);

    const upcomingFixtures = await this.prisma.fixture.count({
      where: {
        leagueId,
        kickoffTime: { gt: new Date() },
        status: 'scheduled',
        deletedAt: null,
      },
    });

    const fixturesThisWeek = await this.prisma.fixture.count({
      where: {
        leagueId,
        kickoffTime: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: 'scheduled',
        deletedAt: null,
      },
    });

    const matchesPlayed = await this.prisma.fixture.count({
      where: {
        leagueId,
        status: 'completed',
        deletedAt: null,
      },
    });

    const leagueTablePublished = await this.prisma.standingsPublish.findFirst({
      where: { leagueId, deletedAt: null },
      orderBy: { publishedDate: 'desc' },
    });

    return {
      totalClubs,
      totalPlayers,
      upcomingFixtures,
      fixturesThisWeek,
      matchesPlayed,
      pendingPlayerApprovals,
      pendingMatchReports,
      activeReferees,
      leagueTablePublishedDate: leagueTablePublished?.publishedDate,
      disciplinaryCases,
    };
  }

  private async getRecentActivity(leagueId: string) {
    return await this.prisma.auditLog.findMany({
      where: { leagueId, deletedAt: null },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        id: true,
        timestamp: true,
        action: true,
        userId: true,
        details: true,
      },
    });
  }

  private async getUpcomingFixtures(leagueId: string) {
    return await this.prisma.fixture.findMany({
      where: {
        leagueId,
        kickoffTime: { gt: new Date() },
        status: 'scheduled',
        deletedAt: null,
      },
      orderBy: { kickoffTime: 'asc' },
      take: 5,
      select: {
        id: true,
        homeClub: { select: { name: true } },
        awayClub: { select: { name: true } },
        kickoffTime: true,
        venue: true,
        round: true,
      },
    });
  }

  private async getPendingApprovals(leagueId: string) {
    const [playerRegistrations, matchReports] = await Promise.all([
      this.prisma.playerRegistration.count({
        where: { league: { id: leagueId }, status: 'pending', deletedAt: null },
      }),
      this.prisma.matchReport.count({
        where: { fixture: { leagueId }, status: 'pending', deletedAt: null },
      }),
    ]);

    return {
      playerRegistrations,
      matchReports,
      fixtureChanges: 0, // Tracked separately in fixture change requests
    };
  }
}
