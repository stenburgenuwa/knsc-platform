import { PrismaClient } from '@prisma/client';
import { FixtureCreateInput } from '../types';
import { AUDIT_ACTIONS, PLATFORM_OWNER_CONSTANTS } from '../constants';

export class FixtureService {
  private prisma: PrismaClient;
  private userId: string;

  constructor(prisma: PrismaClient, userId: string) {
    this.prisma = prisma;
    this.userId = userId;
  }

  /**
   * Create a fixture
   */
  async createFixture(input: FixtureCreateInput): Promise<any> {
    // Validate clubs exist
    const [homeClub, awayClub] = await Promise.all([
      this.prisma.club.findUnique({ where: { id: input.homeClubId } }),
      this.prisma.club.findUnique({ where: { id: input.awayClubId } }),
    ]);

    if (!homeClub || !awayClub) {
      throw new Error('One or both clubs not found');
    }

    if (homeClub.id === awayClub.id) {
      throw new Error('Home and away clubs cannot be the same');
    }

    const fixture = await this.prisma.fixture.create({
      data: {
        leagueId: input.leagueId,
        seasonId: input.seasonId,
        homeClubId: input.homeClubId,
        awayClubId: input.awayClubId,
        fixtureDate: input.fixtureDate,
        kickoffTime: input.kickoffTime,
        matchday: input.matchday || 1,
        fixtureStatus: PLATFORM_OWNER_CONSTANTS.FIXTURE_STATUS.SCHEDULED,
        venueId: input.venueId,
      },
      include: { homeClub: true, awayClub: true },
    });

    // Audit log
    await this.auditLog(AUDIT_ACTIONS.FIXTURE_CREATED, 'Fixture', fixture.id, null, {
      homeClub: input.homeClubId,
      awayClub: input.awayClubId,
      fixtureDate: input.fixtureDate,
    });

    return fixture;
  }

  /**
   * Update fixture
   */
  async updateFixture(fixtureId: string, updates: Partial<FixtureCreateInput>): Promise<any> {
    const previous = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
    });

    if (!previous) {
      throw new Error('Fixture not found');
    }

    const fixture = await this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        fixtureDate: updates.fixtureDate || previous.fixtureDate,
        kickoffTime: updates.kickoffTime || previous.kickoffTime,
      },
      include: { homeClub: true, awayClub: true },
    });

    // Audit log
    await this.auditLog(AUDIT_ACTIONS.FIXTURE_UPDATED, 'Fixture', fixtureId, previous, fixture);

    return fixture;
  }

  /**
   * Reschedule fixture
   */
  async rescheduleFixture(fixtureId: string, newDate: Date, newTime: string): Promise<any> {
    const fixture = await this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        fixtureDate: newDate,
        kickoffTime: newTime,
        fixtureStatus: PLATFORM_OWNER_CONSTANTS.FIXTURE_STATUS.SCHEDULED,
      },
    });

    await this.auditLog('fixture_rescheduled', 'Fixture', fixtureId, null, {
      newDate,
      newTime,
    });

    return fixture;
  }

  /**
   * Cancel fixture
   */
  async cancelFixture(fixtureId: string, reason: string): Promise<void> {
    await this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        fixtureStatus: PLATFORM_OWNER_CONSTANTS.FIXTURE_STATUS.CANCELLED,
      },
    });

    await this.auditLog('fixture_cancelled', 'Fixture', fixtureId, null, {
      reason,
    });
  }

  /**
   * Get upcoming fixtures
   */
  async getUpcomingFixtures(days = 7, limit = 20): Promise<any> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const fixtures = await this.prisma.fixture.findMany({
      where: {
        fixtureDate: {
          gte: now,
          lte: futureDate,
        },
      },
      take: limit,
      orderBy: { fixtureDate: 'asc' },
      include: { homeClub: true, awayClub: true, league: true },
    });

    return fixtures;
  }

  /**
   * List all fixtures for a league
   */
  async getLeagueFixtures(leagueId: string, limit = 50, offset = 0): Promise<any> {
    const [fixtures, total] = await Promise.all([
      this.prisma.fixture.findMany({
        where: { leagueId },
        skip: offset,
        take: limit,
        orderBy: { fixtureDate: 'desc' },
        include: { homeClub: true, awayClub: true },
      }),
      this.prisma.fixture.count({ where: { leagueId } }),
    ]);

    return { fixtures, total, limit, offset };
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
