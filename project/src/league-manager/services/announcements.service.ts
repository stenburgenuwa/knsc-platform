// Announcements Service - League Announcements & Communications
import { PrismaClient } from '@prisma/client';
import { Announcement } from '../types';
import { ANNOUNCEMENT_STATUS, ANNOUNCEMENT_TYPES, AUDIT_ACTION_TYPES, VALIDATION_RULES } from '../constants';

export class AnnouncementService {
  constructor(private prisma: PrismaClient) {}

  async getAnnouncements(leagueId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where: { leagueId, deletedAt: null },
        orderBy: { publishedDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.announcement.count({ where: { leagueId, deletedAt: null } }),
    ]);

    return { announcements, total, page, pages: Math.ceil(total / limit) };
  }

  async createAnnouncement(
    leagueId: string,
    data: {
      title: string;
      content: string;
      type: string;
      deliveryChannels: string[];
      targetAudience: 'all' | 'clubs' | 'team_managers' | 'referees';
      expiryDate?: Date;
    },
    userId: string,
  ) {
    const errors = this.validateAnnouncement(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const announcement = await this.prisma.announcement.create({
      data: {
        leagueId,
        title: data.title,
        content: data.content,
        type: data.type,
        deliveryChannels: data.deliveryChannels,
        targetAudience: data.targetAudience,
        status: ANNOUNCEMENT_STATUS.DRAFT,
        expiryDate: data.expiryDate,
        createdBy: userId,
      },
    });

    return announcement;
  }

  async publishAnnouncement(leagueId: string, announcementId: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement || announcement.leagueId !== leagueId) {
      throw new Error('Announcement not found or access denied');
    }

    if (announcement.status !== ANNOUNCEMENT_STATUS.DRAFT) {
      throw new Error(`Cannot publish announcement with status: ${announcement.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.announcement.update({
        where: { id: announcementId },
        data: { status: ANNOUNCEMENT_STATUS.PUBLISHED, publishedDate: new Date(), updatedBy: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.ANNOUNCEMENT_PUBLISHED,
          resourceType: 'Announcement',
          resourceId: announcementId,
          details: `Announcement published: ${announcement.title}`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Announcement published successfully' };
  }

  async archiveAnnouncement(leagueId: string, announcementId: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement || announcement.leagueId !== leagueId) {
      throw new Error('Announcement not found or access denied');
    }

    await this.prisma.announcement.update({
      where: { id: announcementId },
      data: { status: ANNOUNCEMENT_STATUS.ARCHIVED, updatedBy: userId },
    });

    return { success: true, message: 'Announcement archived' };
  }

  private validateAnnouncement(data: {
    title: string;
    content: string;
    type: string;
    deliveryChannels: string[];
  }): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.length === 0) {
      errors.push('Title is required');
    }

    if (data.title.length > VALIDATION_RULES.MAX_ANNOUNCEMENT_TITLE_LENGTH) {
      errors.push(`Title exceeds maximum length of ${VALIDATION_RULES.MAX_ANNOUNCEMENT_TITLE_LENGTH}`);
    }

    if (!data.content || data.content.length === 0) {
      errors.push('Content is required');
    }

    if (data.content.length > VALIDATION_RULES.MAX_ANNOUNCEMENT_CONTENT_LENGTH) {
      errors.push(`Content exceeds maximum length of ${VALIDATION_RULES.MAX_ANNOUNCEMENT_CONTENT_LENGTH}`);
    }

    if (!Object.values(ANNOUNCEMENT_TYPES).includes(data.type)) {
      errors.push('Invalid announcement type');
    }

    if (data.deliveryChannels.length === 0) {
      errors.push('At least one delivery channel is required');
    }

    return errors;
  }
}
