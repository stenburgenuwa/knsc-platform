// Standings Service - League Table Management & Calculations
import { PrismaClient } from '@prisma/client';
import { StandingsEntry } from '../types';
import { AUDIT_ACTION_TYPES } from '../constants';

export class StandingsService {
  constructor(private prisma: PrismaClient) {}

  async getStandings(leagueId: string): Promise<StandingsEntry[]> {
    const standings = await this.prisma.standing.findMany({
      where: { leagueId },
      orderBy: { points: 'desc' },
      include: { club: true },
    });

    return standings.map((s, idx) => ({
      position: idx + 1,
      club: s.club.name,
      clubId: s.clubId,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalDifference,
      points: s.points,
      form: this.calculateForm(s.clubId, leagueId),
    }));
  }

  async recalculateStandings(leagueId: string, userId: string) {
    const fixtures = await this.prisma.fixture.findMany({
      where: { leagueId, status: 'completed', deletedAt: null },
      include: { homeClub: true, awayClub: true, matchReport: true },
    });

    // Reset standings
    await this.prisma.standing.deleteMany({ where: { leagueId } });

    // Recalculate
    const standingsMap: Record<string, any> = {};

    fixtures.forEach((fixture) => {
      if (!fixture.matchReport) return;

      const homeId = fixture.homeClubId;
      const awayId = fixture.awayClubId;

      if (!standingsMap[homeId]) {
        standingsMap[homeId] = {
          clubId: homeId,
          leagueId,
          season: '',
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
      }

      if (!standingsMap[awayId]) {
        standingsMap[awayId] = {
          clubId: awayId,
          leagueId,
          season: '',
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
      }

      standingsMap[homeId].played += 1;
      standingsMap[awayId].played += 1;
      standingsMap[homeId].goalsFor += fixture.matchReport.homeScore;
      standingsMap[homeId].goalsAgainst += fixture.matchReport.awayScore;
      standingsMap[awayId].goalsFor += fixture.matchReport.awayScore;
      standingsMap[awayId].goalsAgainst += fixture.matchReport.homeScore;

      if (fixture.matchReport.homeScore > fixture.matchReport.awayScore) {
        standingsMap[homeId].won += 1;
        standingsMap[homeId].points += 3;
        standingsMap[awayId].lost += 1;
      } else if (fixture.matchReport.awayScore > fixture.matchReport.homeScore) {
        standingsMap[awayId].won += 1;
        standingsMap[awayId].points += 3;
        standingsMap[homeId].lost += 1;
      } else {
        standingsMap[homeId].drawn += 1;
        standingsMap[homeId].points += 1;
        standingsMap[awayId].drawn += 1;
        standingsMap[awayId].points += 1;
      }
    });

    // Update goal difference
    Object.values(standingsMap).forEach((entry: any) => {
      entry.goalDifference = entry.goalsFor - entry.goalsAgainst;
    });

    // Save all standings
    await Promise.all(
      Object.values(standingsMap).map((entry: any) =>
        this.prisma.standing.create({ data: entry }),
      ),
    );

    await this.prisma.auditLog.create({
      data: {
        leagueId,
        userId,
        action: 'standings_recalculated',
        resourceType: 'Standings',
        resourceId: leagueId,
        details: 'League standings recalculated',
        timestamp: new Date(),
      },
    });

    return { success: true, message: 'Standings recalculated successfully' };
  }

  async publishStandings(leagueId: string, userId: string) {
    const standings = await this.getStandings(leagueId);

    if (standings.length === 0) {
      throw new Error('No standings to publish');
    }

    await this.prisma.standingsPublish.create({
      data: {
        leagueId,
        publishedDate: new Date(),
        publishedBy: userId,
        standingsData: JSON.stringify(standings),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        leagueId,
        userId,
        action: AUDIT_ACTION_TYPES.STANDINGS_PUBLISHED,
        resourceType: 'Standings',
        resourceId: leagueId,
        details: 'League standings published',
        timestamp: new Date(),
      },
    });

    return { success: true, message: 'Standings published successfully' };
  }

  async applyPointsDeduction(leagueId: string, clubId: string, points: number, reason: string, userId: string) {
    const standing = await this.prisma.standing.findUnique({
      where: { leagueId_clubId_season: { leagueId, clubId, season: '' } },
    });

    if (!standing) {
      throw new Error('Club standing not found');
    }

    const newPoints = Math.max(0, standing.points - points);

    await this.prisma.$transaction([
      this.prisma.standing.update({
        where: { leagueId_clubId_season: { leagueId, clubId, season: '' } },
        data: { points: newPoints },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: 'points_deduction_applied',
          resourceType: 'Standings',
          resourceId: clubId,
          details: `${points} points deducted from club: ${reason}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: `${points} points deducted successfully` };
  }

  private async calculateForm(clubId: string, leagueId: string): Promise<string> {
    const recentMatches = await this.prisma.fixture.findMany({
      where: {
        leagueId,
        status: 'completed',
        OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
      },
      orderBy: { kickoffTime: 'desc' },
      take: 5,
      include: { matchReport: true },
    });

    return recentMatches
      .map((match) => {
        if (!match.matchReport) return '?';
        const isHome = match.homeClubId === clubId;
        const homeScore = match.matchReport.homeScore;
        const awayScore = match.matchReport.awayScore;

        if (isHome) {
          return homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
        } else {
          return awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';
        }
      })
      .reverse()
      .join('');
  }
}
