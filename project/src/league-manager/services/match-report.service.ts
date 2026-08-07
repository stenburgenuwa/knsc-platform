// Match Report Review Service - Match Report Approval & Standing Updates
import { PrismaClient } from '@prisma/client';
import { MATCH_REPORT_STATUS, FIXTURE_STATUS, AUDIT_ACTION_TYPES } from '../constants';

export class MatchReportService {
  constructor(private prisma: PrismaClient) {}

  async getPendingReports(leagueId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.prisma.matchReport.findMany({
        where: { fixture: { leagueId }, status: MATCH_REPORT_STATUS.PENDING, deletedAt: null },
        orderBy: { submittedDate: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          fixture: {
            select: {
              id: true,
              matchNumber: true,
              homeClub: { select: { name: true } },
              awayClub: { select: { name: true } },
              kickoffTime: true,
            },
          },
          homeScore: true,
          awayScore: true,
          submittedDate: true,
          submittedBy: true,
        },
      }),
      this.prisma.matchReport.count({
        where: { fixture: { leagueId }, status: MATCH_REPORT_STATUS.PENDING, deletedAt: null },
      }),
    ]);

    return { reports, total, page, pages: Math.ceil(total / limit) };
  }

  async getReportDetail(leagueId: string, reportId: string) {
    const report = await this.prisma.matchReport.findUnique({
      where: { id: reportId },
      include: {
        fixture: { include: { homeClub: true, awayClub: true } },
        goals: true,
        yellowCards: true,
        redCards: true,
        substitutions: true,
      },
    });

    if (!report || report.fixture.leagueId !== leagueId) {
      throw new Error('Report not found or access denied');
    }

    return report;
  }

  async approveReport(leagueId: string, reportId: string, userId: string, notes?: string) {
    const report = await this.prisma.matchReport.findUnique({
      where: { id: reportId },
      include: { fixture: true },
    });

    if (!report || report.fixture.leagueId !== leagueId) {
      throw new Error('Report not found or access denied');
    }

    if (report.status !== MATCH_REPORT_STATUS.PENDING) {
      throw new Error(`Cannot approve report with status: ${report.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.matchReport.update({
        where: { id: reportId },
        data: { status: MATCH_REPORT_STATUS.APPROVED, updatedBy: userId },
      }),
      this.prisma.fixture.update({
        where: { id: report.fixtureId },
        data: { status: FIXTURE_STATUS.COMPLETED },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.MATCH_REPORT_APPROVED,
          resourceType: 'MatchReport',
          resourceId: reportId,
          details: `Match report approved: ${report.fixture.matchNumber}`,
          timestamp: new Date(),
        },
      }),
    ]);

    // Trigger standings calculation
    await this.updateStandings(leagueId, report.fixture.round);

    return { success: true, message: 'Match report approved and standings updated' };
  }

  async rejectReport(leagueId: string, reportId: string, userId: string, reason: string) {
    const report = await this.prisma.matchReport.findUnique({
      where: { id: reportId },
      include: { fixture: true },
    });

    if (!report || report.fixture.leagueId !== leagueId) {
      throw new Error('Report not found or access denied');
    }

    if (report.status !== MATCH_REPORT_STATUS.PENDING) {
      throw new Error(`Cannot reject report with status: ${report.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.matchReport.update({
        where: { id: reportId },
        data: { status: MATCH_REPORT_STATUS.REJECTED, updatedBy: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.MATCH_REPORT_REJECTED,
          resourceType: 'MatchReport',
          resourceId: reportId,
          details: `Match report rejected: ${report.fixture.matchNumber} - ${reason}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Match report rejected' };
  }

  async returnForCorrection(leagueId: string, reportId: string, userId: string, requiredCorrections: string) {
    const report = await this.prisma.matchReport.findUnique({
      where: { id: reportId },
      include: { fixture: true },
    });

    if (!report || report.fixture.leagueId !== leagueId) {
      throw new Error('Report not found or access denied');
    }

    if (report.status !== MATCH_REPORT_STATUS.PENDING) {
      throw new Error(`Cannot return report with status: ${report.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.matchReport.update({
        where: { id: reportId },
        data: { status: MATCH_REPORT_STATUS.RETURNED_FOR_CORRECTION, updatedBy: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: 'match_report_returned',
          resourceType: 'MatchReport',
          resourceId: reportId,
          details: `Match report returned for correction: ${report.fixture.matchNumber}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Match report returned for correction' };
  }

  private async updateStandings(leagueId: string, round: number) {
    // Get all completed fixtures for this league up to this round
    const fixtures = await this.prisma.fixture.findMany({
      where: {
        leagueId,
        round: { lte: round },
        status: FIXTURE_STATUS.COMPLETED,
        deletedAt: null,
      },
      include: {
        matchReport: true,
        homeClub: true,
        awayClub: true,
      },
    });

    // Calculate standings
    const standings: Record<string, { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; points: number }> = {};

    fixtures.forEach((fixture) => {
      if (!fixture.matchReport) return;

      const homeId = fixture.homeClubId;
      const awayId = fixture.awayClubId;

      if (!standings[homeId])
        standings[homeId] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
      if (!standings[awayId])
        standings[awayId] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };

      standings[homeId].played += 1;
      standings[awayId].played += 1;
      standings[homeId].gf += fixture.matchReport.homeScore;
      standings[homeId].ga += fixture.matchReport.awayScore;
      standings[awayId].gf += fixture.matchReport.awayScore;
      standings[awayId].ga += fixture.matchReport.homeScore;

      if (fixture.matchReport.homeScore > fixture.matchReport.awayScore) {
        standings[homeId].won += 1;
        standings[homeId].points += 3;
        standings[awayId].lost += 1;
      } else if (fixture.matchReport.awayScore > fixture.matchReport.homeScore) {
        standings[awayId].won += 1;
        standings[awayId].points += 3;
        standings[homeId].lost += 1;
      } else {
        standings[homeId].drawn += 1;
        standings[homeId].points += 1;
        standings[awayId].drawn += 1;
        standings[awayId].points += 1;
      }
    });

    // Update standings in database
    await Promise.all(
      Object.entries(standings).map(([clubId, data]) =>
        this.prisma.standing.upsert({
          where: { leagueId_clubId_season: { leagueId, clubId, season: '' } },
          update: data,
          create: { leagueId, clubId, season: '', ...data },
        }),
      ),
    );
  }
}
