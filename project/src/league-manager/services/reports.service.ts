// Reports Service - Report Generation & Export
import { PrismaClient } from '@prisma/client';
import { LeagueReport } from '../types';
import { REPORT_TYPES, REPORT_FORMATS, AUDIT_ACTION_TYPES } from '../constants';

export class ReportService {
  constructor(private prisma: PrismaClient) {}

  async generateLeagueSummaryReport(leagueId: string, userId: string): Promise<LeagueReport> {
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      throw new Error('League not found');
    }

    const [totalClubs, totalPlayers, completedFixtures, pendingFixtures, standings] = await Promise.all([
      this.prisma.club.count({ where: { leagueId, deletedAt: null } }),
      this.prisma.player.count({ where: { club: { leagueId }, deletedAt: null } }),
      this.prisma.fixture.count({ where: { leagueId, status: 'completed', deletedAt: null } }),
      this.prisma.fixture.count({ where: { leagueId, status: 'scheduled', deletedAt: null } }),
      this.prisma.standing.findMany({ where: { leagueId }, orderBy: { points: 'desc' }, take: 10 }),
    ]);

    const report: LeagueReport = {
      id: this.generateReportId(),
      title: `${league.name} - League Summary`,
      type: 'league_summary',
      generatedDate: new Date(),
      generatedBy: userId,
      data: {
        league: { id: league.id, name: league.name, season: league.season },
        statistics: { totalClubs, totalPlayers, completedFixtures, pendingFixtures },
        topStandings: standings,
      },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  async generateFixtureReport(leagueId: string, userId: string): Promise<LeagueReport> {
    const fixtures = await this.prisma.fixture.findMany({
      where: { leagueId, deletedAt: null },
      orderBy: { kickoffTime: 'asc' },
      include: { homeClub: true, awayClub: true },
    });

    const report: LeagueReport = {
      id: this.generateReportId(),
      title: `Fixture Report - ${new Date().toLocaleDateString()}`,
      type: 'fixture',
      generatedDate: new Date(),
      generatedBy: userId,
      data: { fixtures: fixtures.map((f) => ({ match: f.matchNumber, home: f.homeClub.name, away: f.awayClub.name, kickoff: f.kickoffTime, status: f.status })) },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  async generateResultsReport(leagueId: string, userId: string): Promise<LeagueReport> {
    const results = await this.prisma.fixture.findMany({
      where: { leagueId, status: 'completed', deletedAt: null },
      orderBy: { kickoffTime: 'desc' },
      include: { homeClub: true, awayClub: true, matchReport: true },
    });

    const report: LeagueReport = {
      id: this.generateReportId(),
      title: `Results Report - ${new Date().toLocaleDateString()}`,
      type: 'results',
      generatedDate: new Date(),
      generatedBy: userId,
      data: {
        results: results.map((f) => ({
          match: f.matchNumber,
          home: f.homeClub.name,
          away: f.awayClub.name,
          score: f.matchReport ? `${f.matchReport.homeScore}-${f.matchReport.awayScore}` : 'TBD',
          date: f.kickoffTime,
        })),
      },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  async generateStandingsReport(leagueId: string, userId: string): Promise<LeagueReport> {
    const standings = await this.prisma.standing.findMany({
      where: { leagueId },
      orderBy: { points: 'desc' },
      include: { club: true },
    });

    const report: LeagueReport = {
      id: this.generateReportId(),
      title: `League Standings - ${new Date().toLocaleDateString()}`,
      type: 'standings',
      generatedDate: new Date(),
      generatedBy: userId,
      data: {
        standings: standings.map((s, idx) => ({
          position: idx + 1,
          club: s.club.name,
          played: s.played,
          won: s.won,
          drawn: s.drawn,
          lost: s.lost,
          gf: s.goalsFor,
          ga: s.goalsAgainst,
          gd: s.goalDifference,
          points: s.points,
        })),
      },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  async generateTopScorersReport(leagueId: string, userId: string): Promise<LeagueReport> {
    const topScorers = await this.prisma.goal.findMany({
      where: { fixture: { leagueId } },
      include: { player: true, club: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Aggregate goals by player
    const scorerStats: Record<string, { name: string; club: string; goals: number }> = {};
    topScorers.forEach((goal) => {
      if (!scorerStats[goal.playerId]) {
        scorerStats[goal.playerId] = { name: goal.player.name, club: goal.club.name, goals: 0 };
      }
      scorerStats[goal.playerId].goals += 1;
    });

    const report: LeagueReport = {
      id: this.generateReportId(),
      title: `Top Scorers Report - ${new Date().toLocaleDateString()}`,
      type: 'top_scorers',
      generatedDate: new Date(),
      generatedBy: userId,
      data: {
        scorers: Object.values(scorerStats).sort((a, b) => b.goals - a.goals).slice(0, 20),
      },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  async generateDisciplinaryReport(leagueId: string, userId: string): Promise<LeagueReport> {
    const cases = await this.prisma.disciplinaryCase.findMany({
      where: { leagueId, deletedAt: null },
      orderBy: { createdDate: 'desc' },
    });

    const report: LeagueReport = {
      id: this.generateReportId(),
      title: `Disciplinary Report - ${new Date().toLocaleDateString()}`,
      type: 'disciplinary',
      generatedDate: new Date(),
      generatedBy: userId,
      data: {
        totalCases: cases.length,
        openCases: cases.filter((c) => c.status !== 'closed').length,
        cases: cases.map((c) => ({
          caseNumber: c.caseNumber,
          type: c.caseType,
          subject: c.playerOrClub,
          reason: c.reason,
          status: c.status,
          decision: c.decision,
        })),
      },
      format: 'pdf',
    };

    await this.logReportGeneration(leagueId, report, userId);
    return report;
  }

  async exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Buffer> {
    // In production, this would integrate with PDF/Excel libraries
    // For now, return a placeholder
    return Buffer.from(JSON.stringify({ reportId, format, exported: new Date() }));
  }

  private generateReportId(): string {
    return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logReportGeneration(leagueId: string, report: LeagueReport, userId: string) {
    await this.prisma.auditLog.create({
      data: {
        leagueId,
        userId,
        action: AUDIT_ACTION_TYPES.REPORT_GENERATED,
        resourceType: 'Report',
        resourceId: report.id,
        details: `Report generated: ${report.title}`,
        timestamp: new Date(),
      },
    });
  }
}
