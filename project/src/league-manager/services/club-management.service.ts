// Club Management Service - Club Overview & Statistics
import { PrismaClient } from '@prisma/client';

export class ClubManagementService {
  constructor(private prisma: PrismaClient) {}

  async getClubs(leagueId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [clubs, total] = await Promise.all([
      this.prisma.club.findMany({
        where: { leagueId, deletedAt: null },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          county: true,
          coach: true,
          _count: { select: { players: true, teamManagers: true } },
        },
      }),
      this.prisma.club.count({ where: { leagueId, deletedAt: null } }),
    ]);

    return { clubs, total, page, pages: Math.ceil(total / limit) };
  }

  async getClubDetail(leagueId: string, clubId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      include: {
        players: { where: { deletedAt: null } },
        teamManagers: { where: { deletedAt: null } },
        standing: { where: { leagueId } },
      },
    });

    if (!club || club.leagueId !== leagueId) {
      throw new Error('Club not found or access denied');
    }

    return club;
  }

  async getClubPlayers(leagueId: string, clubId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [players, total] = await Promise.all([
      this.prisma.player.findMany({
        where: { clubId, club: { leagueId }, deletedAt: null },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.player.count({ where: { clubId, club: { leagueId }, deletedAt: null } }),
    ]);

    return { players, total, page, pages: Math.ceil(total / limit) };
  }

  async getClubFixtures(leagueId: string, clubId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [fixtures, total] = await Promise.all([
      this.prisma.fixture.findMany({
        where: {
          leagueId,
          OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { kickoffTime: 'asc' },
        include: { homeClub: true, awayClub: true, matchReport: true },
      }),
      this.prisma.fixture.count({
        where: {
          leagueId,
          OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
          deletedAt: null,
        },
      }),
    ]);

    return { fixtures, total, page, pages: Math.ceil(total / limit) };
  }

  async getClubPerformance(leagueId: string, clubId: string) {
    const standing = await this.prisma.standing.findUnique({
      where: { leagueId_clubId_season: { leagueId, clubId, season: '' } },
    });

    const fixtures = await this.prisma.fixture.findMany({
      where: {
        leagueId,
        OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
        status: 'completed',
        deletedAt: null,
      },
      include: { matchReport: true },
    });

    return {
      standing: standing || { played: 0, won: 0, drawn: 0, lost: 0, points: 0 },
      recentMatches: fixtures.slice(-5),
      totalMatches: fixtures.length,
    };
  }

  async searchClubs(leagueId: string, query: string) {
    return await this.prisma.club.findMany({
      where: {
        leagueId,
        deletedAt: null,
        name: { contains: query, mode: 'insensitive' },
      },
      take: 20,
      select: { id: true, name: true, county: true },
    });
  }
}
