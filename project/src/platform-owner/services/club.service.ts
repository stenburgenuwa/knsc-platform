import { PrismaClient } from '@prisma/client';
import { ClubCreateInput, ClubBrandingInput } from '../types';
import { PLATFORM_OWNER_CONSTANTS, AUDIT_ACTIONS } from '../constants';

export class ClubService {
  private prisma: PrismaClient;
  private userId: string;

  constructor(prisma: PrismaClient, userId: string) {
    this.prisma = prisma;
    this.userId = userId;
  }

  /**
   * Create a new club
   */
  async createClub(input: ClubCreateInput): Promise<any> {
    // Validate unique club name
    const existing = await this.prisma.club.findFirst({
      where: { clubName: input.clubName },
    });

    if (existing) {
      throw new Error(PLATFORM_OWNER_CONSTANTS.CLUB_EXISTS);
    }

    const club = await this.prisma.club.create({
      data: {
        clubName: input.clubName,
        leagueId: input.leagueId,
        countyId: input.countyId,
        shortName: input.shortName || input.clubName.substring(0, 20),
        registrationNumber: input.registrationNumber,
        yearFounded: input.yearFounded,
        clubType: input.clubType,
        email: input.email,
        phoneNumber: input.phoneNumber,
        website: input.website,
        status: PLATFORM_OWNER_CONSTANTS.CLUB_STATUS.DRAFT,
      },
    });

    // Audit log
    await this.auditLog(AUDIT_ACTIONS.CLUB_CREATED, 'Club', club.id, null, {
      clubName: club.clubName,
      leagueId: club.leagueId,
    });

    return club;
  }

  /**
   * Update club branding
   */
  async updateClubBranding(input: ClubBrandingInput): Promise<any> {
    // Check if branding exists
    const existing = await this.prisma.clubBranding.findUnique({
      where: { clubId: input.clubId },
    });

    const branding = existing
      ? await this.prisma.clubBranding.update({
          where: { clubId: input.clubId },
          data: {
            logoUrl: input.logoUrl || existing.logoUrl,
            primaryColor: input.primaryColor || existing.primaryColor,
            secondaryColor: input.secondaryColor || existing.secondaryColor,
            accentColor: input.accentColor || existing.accentColor,
            website: input.website || existing.website,
            facebook: input.facebook || existing.facebook,
            instagram: input.instagram || existing.instagram,
            xAccount: input.xAccount || existing.xAccount,
            youtube: input.youtube || existing.youtube,
            slogan: input.slogan || existing.slogan,
          },
        })
      : await this.prisma.clubBranding.create({
          data: {
            clubId: input.clubId,
            logoUrl: input.logoUrl,
            primaryColor: input.primaryColor,
            secondaryColor: input.secondaryColor,
            accentColor: input.accentColor,
            website: input.website,
            facebook: input.facebook,
            instagram: input.instagram,
            xAccount: input.xAccount,
            youtube: input.youtube,
            slogan: input.slogan,
          },
        });

    // Audit log
    await this.auditLog(AUDIT_ACTIONS.CLUB_UPDATED, 'Club', input.clubId, null, {
      branding: true,
    });

    return branding;
  }

  /**
   * Get club with players and fixtures
   */
  async getClubWithDetails(clubId: string): Promise<any> {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      include: {
        branding: true,
        players: true,
        homeFixtures: true,
        awayFixtures: true,
        teamManagers: true,
      },
    });

    if (!club) {
      throw new Error('Club not found');
    }

    return {
      ...club,
      playerCount: club.players.length,
      fixtureCount: club.homeFixtures.length + club.awayFixtures.length,
    };
  }

  /**
   * List all clubs
   */
  async listClubs(leagueId?: string, limit = 20, offset = 0): Promise<any> {
    const where = leagueId ? { leagueId } : {};

    const [clubs, total] = await Promise.all([
      this.prisma.club.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { clubName: 'asc' },
        include: { branding: true },
      }),
      this.prisma.club.count({ where }),
    ]);

    return { clubs, total, limit, offset };
  }

  /**
   * Assign team manager to club
   */
  async assignTeamManager(clubId: string, userId: string): Promise<any> {
    const teamManager = await this.prisma.teamManager.create({
      data: {
        userId,
        clubId,
        appointmentDate: new Date(),
        status: 'Active',
      },
    });

    // Audit log
    await this.auditLog(AUDIT_ACTIONS.CLUB_UPDATED, 'Club', clubId, null, {
      teamManagerAssigned: userId,
    });

    return teamManager;
  }

  /**
   * Archive club
   */
  async archiveClub(clubId: string): Promise<void> {
    await this.prisma.club.update({
      where: { id: clubId },
      data: { status: PLATFORM_OWNER_CONSTANTS.CLUB_STATUS.ARCHIVED },
    });

    await this.auditLog(AUDIT_ACTIONS.CLUB_DELETED, 'Club', clubId, null, null);
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
