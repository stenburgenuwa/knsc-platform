// Fixture Management Service - Fixture CRUD and Publishing Operations
import { PrismaClient } from '@prisma/client';
import { FixtureEditRequest } from '../types';
import { FIXTURE_STATUS, AUDIT_ACTION_TYPES, VALIDATION_RULES } from '../constants';

export class FixtureService {
  constructor(private prisma: PrismaClient) {}

  async getFixtures(leagueId: string, page: number = 1, limit: number = 20, filters?: Record<string, unknown>) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { leagueId, deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.round) where.round = filters.round;

    const [fixtures, total] = await Promise.all([
      this.prisma.fixture.findMany({
        where,
        orderBy: { kickoffTime: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          matchNumber: true,
          homeClub: { select: { name: true } },
          awayClub: { select: { name: true } },
          venue: true,
          kickoffTime: true,
          round: true,
          status: true,
          assignedReferee: { select: { name: true } },
        },
      }),
      this.prisma.fixture.count({ where }),
    ]);

    return { fixtures, total, page, pages: Math.ceil(total / limit) };
  }

  async getFixtureDetail(leagueId: string, fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeClub: true,
        awayClub: true,
        assignedReferee: true,
        matchReport: true,
      },
    });

    if (!fixture || fixture.leagueId !== leagueId) {
      throw new Error('Fixture not found or access denied');
    }

    return fixture;
  }

  async editFixture(leagueId: string, fixtureId: string, data: Partial<FixtureEditRequest>, userId: string) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId } });

    if (!fixture || fixture.leagueId !== leagueId) {
      throw new Error('Fixture not found or access denied');
    }

    if (fixture.status === FIXTURE_STATUS.COMPLETED) {
      throw new Error('Cannot edit completed fixtures');
    }

    const errors = this.validateFixtureEdit(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const previousValues = { ...fixture };

    await this.prisma.$transaction([
      this.prisma.fixture.update({
        where: { id: fixtureId },
        data: {
          homeClubId: data.homeClubId || fixture.homeClubId,
          awayClubId: data.awayClubId || fixture.awayClubId,
          venue: data.venue || fixture.venue,
          kickoffTime: data.kickoffTime || fixture.kickoffTime,
          round: data.round || fixture.round,
          updatedBy: userId,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.FIXTURE_UPDATED,
          resourceType: 'Fixture',
          resourceId: fixtureId,
          details: `Fixture updated: ${fixture.matchNumber}`,
          previousValues: JSON.stringify(previousValues),
          newValues: JSON.stringify(data),
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Fixture updated successfully' };
  }

  async rescheduleFixture(leagueId: string, fixtureId: string, newKickoffTime: Date, userId: string) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId } });

    if (!fixture || fixture.leagueId !== leagueId) {
      throw new Error('Fixture not found or access denied');
    }

    if (fixture.status === FIXTURE_STATUS.COMPLETED || fixture.status === FIXTURE_STATUS.CANCELLED) {
      throw new Error(`Cannot reschedule ${fixture.status} fixtures`);
    }

    if (newKickoffTime <= new Date()) {
      throw new Error('Kickoff time must be in the future');
    }

    await this.prisma.$transaction([
      this.prisma.fixture.update({
        where: { id: fixtureId },
        data: { kickoffTime: newKickoffTime, updatedBy: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.FIXTURE_RESCHEDULED,
          resourceType: 'Fixture',
          resourceId: fixtureId,
          details: `Fixture rescheduled: ${fixture.matchNumber}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Fixture rescheduled successfully' };
  }

  async cancelFixture(leagueId: string, fixtureId: string, reason: string, userId: string) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId } });

    if (!fixture || fixture.leagueId !== leagueId) {
      throw new Error('Fixture not found or access denied');
    }

    if (fixture.status === FIXTURE_STATUS.COMPLETED) {
      throw new Error('Cannot cancel completed fixtures');
    }

    await this.prisma.$transaction([
      this.prisma.fixture.update({
        where: { id: fixtureId },
        data: { status: FIXTURE_STATUS.CANCELLED, updatedBy: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.FIXTURE_CANCELLED,
          resourceType: 'Fixture',
          resourceId: fixtureId,
          details: `Fixture cancelled: ${fixture.matchNumber} - ${reason}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Fixture cancelled successfully' };
  }

  async publishFixtures(leagueId: string, fixtureIds: string[], userId: string) {
    const fixtures = await this.prisma.fixture.findMany({
      where: { id: { in: fixtureIds }, leagueId },
    });

    if (fixtures.length !== fixtureIds.length) {
      throw new Error('Some fixtures not found or access denied');
    }

    await this.prisma.$transaction(
      fixtures.map((fixture) =>
        this.prisma.fixture.update({
          where: { id: fixture.id },
          data: { status: FIXTURE_STATUS.SCHEDULED, updatedBy: userId },
        }),
      ),
    );

    await this.prisma.auditLog.create({
      data: {
        leagueId,
        userId,
        action: AUDIT_ACTION_TYPES.FIXTURE_PUBLISHED,
        resourceType: 'Fixture',
        resourceId: 'bulk',
        details: `${fixtureIds.length} fixtures published`,
        timestamp: new Date(),
      },
    });

    return { success: true, message: `${fixtureIds.length} fixtures published successfully` };
  }

  async searchFixtures(leagueId: string, query: string) {
    return await this.prisma.fixture.findMany({
      where: {
        leagueId,
        deletedAt: null,
        OR: [{ matchNumber: { contains: query, mode: 'insensitive' } }],
      },
      take: 20,
      select: {
        id: true,
        matchNumber: true,
        homeClub: { select: { name: true } },
        awayClub: { select: { name: true } },
        kickoffTime: true,
        status: true,
      },
    });
  }

  private validateFixtureEdit(data: Partial<FixtureEditRequest>): string[] {
    const errors: string[] = [];

    if (data.kickoffTime && data.kickoffTime <= new Date()) {
      errors.push('Kickoff time must be in the future');
    }

    if (data.venue && data.venue.length > VALIDATION_RULES.MAX_FIXTURE_NAME_LENGTH) {
      errors.push(`Venue name exceeds maximum length of ${VALIDATION_RULES.MAX_FIXTURE_NAME_LENGTH}`);
    }

    if (data.homeClubId && data.awayClubId && data.homeClubId === data.awayClubId) {
      errors.push('Home and away clubs cannot be the same');
    }

    return errors;
  }
}
