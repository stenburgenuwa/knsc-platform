// Referee Reports Service
import { PrismaClient } from '@prisma/client';
import { RefereeReport } from '../types';
import { REPORT_TYPES, AUDIT_ACTION_TYPES } from '../constants';

export class ReportsService {
  constructor(private prisma: PrismaClient) {}

  async generateRefereeListReport(leagueId: string, userId: string): Promise<RefereeReport> {
    const referees = await this.prisma.referee.findMany({
      where: { leagueId, deletedAt: null },
      orderBy: { fullName: 'asc' },
    });

    const report: RefereeReport = {
      id: this.generateReportId(),
      type: 'referee_list',
      generatedDate: new Date(),
      generatedBy: userId,
      data: {
        referees: referees.map((r) => ({
          refereeNumber: r.refereeNumber,
          fullName: r.fullName,
          category: r.category,
          phone: r.phone,
          status: r.status,
        })),
      },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  async generateAssignmentReport(leagueId: string, userId: string): Promise<RefereeReport> {
    const assignments = await this.prisma.assignment.findMany({
      where: { leagueId, deletedAt: null },
      include: {
        fixture: { select: { matchNumber: true, homeClub: { select: { name: true } }, awayClub: { select: { name: true } }, kickoffTime: true } },
        referee: { select: { fullName: true } },
      },
      orderBy: { assignedDate: 'desc' },
    });

    const report: RefereeReport = {
      id: this.generateReportId(),
      type: 'assignment',
      generatedDate: new Date(),
      generatedBy: userId,
      data: {
        assignments: assignments.map((a) => ({
          matchNumber: a.fixture.matchNumber,
          referee: a.referee.fullName,
          home: a.fixture.homeClub.name,
          away: a.fixture.awayClub.name,
          kickoff: a.fixture.kickoffTime,
          status: a.status,
        })),
      },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  async generateAvailabilityReport(leagueId: string, userId: string): Promise<RefereeReport> {
    const referees = await this.prisma.referee.findMany({
      where: { leagueId, deletedAt: null },
      include: { availability: true },
    });

    const report: RefereeReport = {
      id: this.generateReportId(),
      type: 'availability',
      generatedDate: new Date(),
      generatedBy: userId,
      data: {
        referees: referees.map((r) => ({
          name: r.fullName,
          status: r.availability?.status || 'unknown',
          notes: r.availability?.notes,
        })),
      },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  async generatePerformanceReport(leagueId: string, userId: string): Promise<RefereeReport> {
    const referees = await this.prisma.referee.findMany({
      where: { leagueId, status: 'active', deletedAt: null },
    });

    const report: RefereeReport = {
      id: this.generateReportId(),
      type: 'performance',
      generatedDate: new Date(),
      generatedBy: userId,
      data: {
        referees: referees.map((r) => ({
          name: r.fullName,
          matchesOfficiated: 0, // Would calculate from assignments
          averageRating: 4.5,
        })),
      },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  private generateReportId(): string {
    return `REP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logReportGeneration(leagueId: string, report: RefereeReport, userId: string) {
    await this.prisma.auditLog.create({
      data: {
        leagueId,
        userId,
        action: 'report_generated',
        resourceType: 'Report',
        resourceId: report.id,
        details: `Report generated: ${report.type}`,
        timestamp: new Date(),
      },
    });
  }
}
