// Referee Manager Controller - HTTP Endpoints
import { Router, Request, Response } from 'express';
import { RefereeRegistrationService } from '../services/registration.service';
import { AssignmentService } from '../services/assignment.service';
import { DashboardService } from '../services/dashboard.service';
import { AvailabilityService } from '../services/availability.service';
import { PerformanceService } from '../services/performance.service';
import { ReportsService } from '../services/reports.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new DashboardService(prisma);
    const dashboard = await service.getDashboard(leagueId as string, userId);
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Referees - Registration
router.post('/referees', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new RefereeRegistrationService(prisma);
    const referee = await service.registerReferee(leagueId as string, req.body, userId);
    res.json({ success: true, data: referee });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/referees', async (req: Request, res: Response) => {
  try {
    const { leagueId, page = 1, limit = 20 } = req.query;
    const referees = await prisma.referee.findMany({
      where: { leagueId: leagueId as string, deletedAt: null },
      skip: ((parseInt(page as string) - 1) * parseInt(limit as string)),
      take: parseInt(limit as string),
      orderBy: { fullName: 'asc' },
    });
    const total = await prisma.referee.count({ where: { leagueId: leagueId as string, deletedAt: null } });
    res.json({ success: true, data: { referees, total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/referees/:refereeId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { refereeId } = req.params;
    const referee = await prisma.referee.findUnique({
      where: { id: refereeId },
      include: { availability: true },
    });
    if (!referee || referee.leagueId !== leagueId) {
      return res.status(404).json({ success: false, error: 'Referee not found' });
    }
    res.json({ success: true, data: referee });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/referees/:refereeId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { refereeId } = req.params;
    const userId = (req as any).user?.id;
    const service = new RefereeRegistrationService(prisma);
    const result = await service.editReferee(leagueId as string, refereeId, req.body, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/referees/:refereeId/suspend', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { refereeId } = req.params;
    const userId = (req as any).user?.id;
    const service = new RefereeRegistrationService(prisma);
    const result = await service.suspendReferee(leagueId as string, refereeId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/referees/:refereeId/activate', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { refereeId } = req.params;
    const userId = (req as any).user?.id;
    const service = new RefereeRegistrationService(prisma);
    const result = await service.activateReferee(leagueId as string, refereeId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/referees/:refereeId/reset-password', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { refereeId } = req.params;
    const { newPassword } = req.body;
    const userId = (req as any).user?.id;
    const service = new RefereeRegistrationService(prisma);
    const result = await service.resetPassword(leagueId as string, refereeId, newPassword, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Assignments
router.post('/assignments', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { fixtureId, refereeId } = req.body;
    const userId = (req as any).user?.id;
    const assignmentService = new AssignmentService(prisma, new (require('../services/sms.service').SmsService)());
    const assignment = await assignmentService.assignReferee(leagueId as string, fixtureId, refereeId, userId);
    res.json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/assignments', async (req: Request, res: Response) => {
  try {
    const { leagueId, page = 1, limit = 20 } = req.query;
    const assignmentService = new AssignmentService(prisma, new (require('../services/sms.service').SmsService)());
    const result = await assignmentService.getAssignments(leagueId as string, parseInt(page as string), parseInt(limit as string));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/assignments/unassigned-fixtures', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const assignmentService = new AssignmentService(prisma, new (require('../services/sms.service').SmsService)());
    const fixtures = await assignmentService.getUnassignedFixtures(leagueId as string);
    res.json({ success: true, data: fixtures });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Availability
router.put('/availability/:refereeId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { refereeId } = req.params;
    const { status, notes } = req.body;
    const service = new AvailabilityService(prisma);
    const availability = await service.updateAvailability(leagueId as string, refereeId, status, notes);
    res.json({ success: true, data: availability });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/availability/available-referees', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const service = new AvailabilityService(prisma);
    const referees = await service.getAvailableReferees(leagueId as string);
    res.json({ success: true, data: referees });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Performance
router.get('/performance/:refereeId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { refereeId } = req.params;
    const service = new PerformanceService(prisma);
    const performance = await service.getRefereePerformance(leagueId as string, refereeId);
    res.json({ success: true, data: performance });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Reports
router.post('/reports/referee-list', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new ReportsService(prisma);
    const report = await service.generateRefereeListReport(leagueId as string, userId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/reports/assignment', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new ReportsService(prisma);
    const report = await service.generateAssignmentReport(leagueId as string, userId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
