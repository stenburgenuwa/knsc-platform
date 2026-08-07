// Referee Assignment Service
import { PrismaClient } from '@prisma/client';
import { Assignment } from '../types';
import { ASSIGNMENT_STATUS, AUDIT_ACTION_TYPES } from '../constants';

export class AssignmentService {
  constructor(private prisma: PrismaClient, private smsService: SmsService) {}

  async assignReferee(leagueId: string, fixtureId: string, refereeId: string, userId: string) {
    // Validate fixture exists and belongs to league
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId } });
    if (!fixture || fixture.leagueId !== leagueId) {
      throw new Error('Fixture not found or access denied');
    }

    // Validate referee exists and is active
    const referee = await this.prisma.referee.findUnique({ where: { id: refereeId } });
    if (!referee || referee.leagueId !== leagueId || referee.status !== 'active') {
      throw new Error('Referee not found, access denied, or not active');
    }

    // Check for existing assignment
    const existingAssignment = await this.prisma.assignment.findFirst({
      where: { fixtureId, refereeId, status: { not: 'cancelled' }, deletedAt: null },
    });

    if (existingAssignment) {
      throw new Error('Referee already assigned to this fixture');
    }

    // Check for availability
    const availability = await this.prisma.refereeAvailability.findUnique({
      where: { refereeId },
    });

    if (availability && availability.status !== 'available') {
      throw new Error(`Referee is currently ${availability.status}`);
    }

    // Create assignment
    const assignment = await this.prisma.assignment.create({
      data: {
        leagueId,
        fixtureId,
        refereeId,
        status: ASSIGNMENT_STATUS.ASSIGNED,
        assignedDate: new Date(),
        createdBy: userId,
      },
    });

    // Send SMS notification
    await this.smsService.sendAssignmentSms(fixtureId, referee.phone, referee.fullName);

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        leagueId,
        userId,
        action: AUDIT_ACTION_TYPES.ASSIGNMENT_CREATED,
        resourceType: 'Assignment',
        resourceId: assignment.id,
        details: `Referee assigned: ${referee.fullName} to fixture ${fixture.matchNumber}`,
        timestamp: new Date(),
      },
    });

    return assignment;
  }

  async getAssignments(leagueId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where: { leagueId, deletedAt: null },
        orderBy: { assignedDate: 'desc' },
        skip,
        take: limit,
        include: {
          fixture: { select: { matchNumber: true, homeClub: { select: { name: true } }, awayClub: { select: { name: true } }, kickoffTime: true } },
          referee: { select: { fullName: true, refereeNumber: true } },
        },
      }),
      this.prisma.assignment.count({ where: { leagueId, deletedAt: null } }),
    ]);

    return { assignments, total, page, pages: Math.ceil(total / limit) };
  }

  async getUnassignedFixtures(leagueId: string) {
    return await this.prisma.fixture.findMany({
      where: { leagueId, assignedReferee: null, status: 'scheduled', deletedAt: null },
      orderBy: { kickoffTime: 'asc' },
      select: {
        id: true,
        matchNumber: true,
        homeClub: { select: { name: true } },
        awayClub: { select: { name: true } },
        kickoffTime: true,
        venue: true,
        round: true,
      },
    });
  }

  async cancelAssignment(leagueId: string, assignmentId: string, userId: string) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId } });

    if (!assignment || assignment.leagueId !== leagueId) {
      throw new Error('Assignment not found or access denied');
    }

    await this.prisma.$transaction([
      this.prisma.assignment.update({
        where: { id: assignmentId },
        data: { status: ASSIGNMENT_STATUS.CANCELLED, updatedBy: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          leagueId,
          userId,
          action: AUDIT_ACTION_TYPES.ASSIGNMENT_CANCELLED,
          resourceType: 'Assignment',
          resourceId: assignmentId,
          details: `Assignment cancelled`,
          timestamp: new Date(),
        },
      }),
    ]);

    return { success: true, message: 'Assignment cancelled' };
  }
}

class SmsService {
  async sendAssignmentSms(fixtureId: string, phone: string, refereeName: string) {
    // SMS implementation in Task 08
    // For now, log the request
    console.log(`SMS to send to ${phone}: Assignment for ${refereeName}`);
  }
}
