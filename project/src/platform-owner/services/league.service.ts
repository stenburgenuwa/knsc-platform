import { PrismaClient } from '@prisma/client';
import { 
  LeagueCreateInput, 
  LeagueUpdateInput,
  PlatformOwnerDashboard,
  DashboardStatistics 
} from '../types';
import { PLATFORM_OWNER_CONSTANTS, AUDIT_ACTIONS } from '../constants';

export class LeagueService {
  private prisma: PrismaClient;
  private userId: string;

  constructor(prisma: PrismaClient, userId: string) {
    this.prisma = prisma;
    this.userId = userId;
  }

  /**
   * Create a new league
   */
  async createLeague(input: LeagueCreateInput): Promise<any> {
    // Validate unique league name
    const existing = await this.prisma.league.findFirst({
      where: { leagueName: input.leagueName },
    });

    if (existing) {
      throw new Error(PLATFORM_OWNER_CONSTANTS.LEAGUE_EXISTS);
    }

    const league = await this.prisma.league.create({
      data: {
        leagueName: input.leagueName,
        division: {
          create: {
            competition: {
              connect: { id: input.seasonId }, // Using seasonId as reference
            },
            divisionName: input.leagueName,
            level: 1,
          },
        },
        shortName: input.leagueName.substring(0, 20),
        description: input.description || '',
        homeAndAway: true,
        pointsWin: input.pointsWin || PLATFORM_OWNER_CONSTANTS.DEFAULT_POINTS_WIN,
        pointsDraw: input.pointsDraw || PLATFORM_OWNER_CONSTANTS.DEFAULT_POINTS_DRAW,
        pointsLoss: input.pointsLoss || PLATFORM_OWNER_CONSTANTS.DEFAULT_POINTS_LOSS,
        status: 'Draft',
      },
      include: { division: true },
    });

    // Audit log
    await this.auditLog(AUDIT_ACTIONS.LEAGUE_CREATED, 'League', league.id, null, {
      leagueName: league.leagueName,
      status: league.status,
    });

    return league;
  }

  /**
   * Update league
   */
  async updateLeague(leagueId: string, input: LeagueUpdateInput): Promise<any> {
    // Validate unique name if changing
    if (input.leagueName) {
      const existing = await this.prisma.league.findFirst({
        where: {
          leagueName: input.leagueName,
          NOT: { id: leagueId },
        },
      });

      if (existing) {
        throw new Error(PLATFORM_OWNER_CONSTANTS.LEAGUE_EXISTS);
      }
    }

    const previous = await this.prisma.league.findUnique({
      where: { id: leagueId },
    });

    const league = await this.prisma.league.update({
      where: { id: leagueId },
      data: {
        leagueName: input.leagueName || previous?.leagueName,
        description: input.description !== undefined ? input.description : previous?.description,
        status: input.status || previous?.status,
      },
    });

    // Audit log
    await this.auditLog(AUDIT_ACTIONS.LEAGUE_UPDATED, 'League', leagueId, previous, league);

    return league;
  }

  /**
   * Archive league (soft delete)
   */
  async archiveLeague(leagueId: string): Promise<void> {
    await this.prisma.league.update({
      where: { id: leagueId },
      data: { status: PLATFORM_OWNER_CONSTANTS.LEAGUE_STATUS.ARCHIVED },
    });

    await this.auditLog(AUDIT_ACTIONS.LEAGUE_DELETED, 'League', leagueId, null, null);
  }

  /**
   * Get league with statistics
   */
  async getLeagueWithStats(leagueId: string): Promise<any> {
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        clubs: true,
        fixtures: true,
        leagueTables: true,
        division: true,
      },
    });

    if (!league) {
      throw new Error('League not found');
    }

    return {
      ...league,
      clubCount: league.clubs.length,
      fixtureCount: league.fixtures.length,
      completedFixtures: league.fixtures.filter(f => f.fixtureStatus === 'Completed').length,
    };
  }

  /**
   * List all leagues
   */
  async listLeagues(limit = 20, offset = 0): Promise<any> {
    const [leagues, total] = await Promise.all([
      this.prisma.league.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { division: true },
      }),
      this.prisma.league.count(),
    ]);

    return { leagues, total, limit, offset };
  }

  /**
   * Assign league manager
   */
  async assignLeagueManager(leagueId: string, userId: string): Promise<void> {
    // This would require a LeagueManager table linking users to leagues
    // Placeholder for now
    await this.auditLog(AUDIT_ACTIONS.LEAGUE_UPDATED, 'League', leagueId, null, null);
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
