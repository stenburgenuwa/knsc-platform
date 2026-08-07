// Referee Performance Service
import { PrismaClient } from '@prisma/client';
import { RefereePerformance } from '../types';

export class PerformanceService {
  constructor(private prisma: PrismaClient) {}

  async getRefereePerformance(leagueId: string, refereeId: string): Promise<RefereePerformance> {
    const referee = await this.prisma.referee.findUnique({ where: { id: refereeId } });

    if (!referee || referee.leagueId !== leagueId) {
      throw new Error('Referee not found or access denied');
    }

    const [matchesOfficiated, reportsSubmitted, disciplinaryCases, completedMatches, cancelledMatches] = await Promise.all([
      this.prisma.assignment.count({
        where: { refereeId, status: { in: ['accepted', 'completed'] }, deletedAt: null },
      }),
      this.prisma.matchReport.count({
        where: { assignment: { refereeId }, deletedAt: null },
      }),
      this.prisma.disciplinaryCase.count({
        where: { playerOrClub: refereeId, leagueId, deletedAt: null },
      }),
      this.prisma.fixture.count({
        where: { assignedRefereeId: refereeId, status: 'completed', leagueId, deletedAt: null },
      }),
      this.prisma.fixture.count({
        where: { assignedRefereeId: refereeId, status: 'cancelled', leagueId, deletedAt: null },
      }),
    ]);

    const lateReports = await this.prisma.matchReport.count({
      where: {
        assignment: { refereeId },
        submittedDate: { gt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      },
    });

    const appointmentsThisSeason = await this.prisma.assignment.count({
      where: { refereeId, leagueId, deletedAt: null },
    });

    // Average rating calculation (placeholder)
    const averageRating = 4.5;

    return {
      refereeId,
      matchesOfficiated,
      reportsSubmitted,
      lateReports,
      averageRating,
      disciplinaryCases,
      appointmentsThisSeason,
      completedMatches,
      cancelledMatches,
    };
  }

  async getLeaguePerformanceStats(leagueId: string) {
    const referees = await this.prisma.referee.findMany({
      where: { leagueId, status: 'active', deletedAt: null },
    });

    const stats = await Promise.all(referees.map((ref) => this.getRefereePerformance(leagueId, ref.id)));

    return {
      totalReferees: referees.length,
      averagePerformance: stats.reduce((acc, s) => acc + s.averageRating, 0) / stats.length,
      stats,
    };
  }
}
