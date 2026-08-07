// League Manager Controller - HTTP Endpoint Handlers
import { Router, Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { PlayerApprovalService } from '../services/player-approval.service';
import { FixtureService } from '../services/fixture.service';
import { MatchReportService } from '../services/match-report.service';
import { DisciplinaryService } from '../services/disciplinary.service';
import { AnnouncementService } from '../services/announcements.service';
import { ReportService } from '../services/reports.service';
import { StandingsService } from '../services/standings.service';
import { ClubManagementService } from '../services/club-management.service';
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

// Player Approvals
router.get('/players/pending', async (req: Request, res: Response) => {
  try {
    const { leagueId, page = 1, limit = 20 } = req.query;
    const service = new PlayerApprovalService(prisma);
    const result = await service.getPendingApprovals(leagueId as string, parseInt(page as string), parseInt(limit as string));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/players/approval/:registrationId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { registrationId } = req.params;
    const service = new PlayerApprovalService(prisma);
    const result = await service.getApprovalDetail(leagueId as string, registrationId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/players/approve/:registrationId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { registrationId } = req.params;
    const { notes } = req.body;
    const userId = (req as any).user?.id;

    const service = new PlayerApprovalService(prisma);
    const result = await service.approveRegistration(leagueId as string, registrationId, userId, notes);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/players/reject/:registrationId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { registrationId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.id;

    const service = new PlayerApprovalService(prisma);
    const result = await service.rejectRegistration(leagueId as string, registrationId, userId, reason);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/players/request-changes/:registrationId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { registrationId } = req.params;
    const { requiredChanges } = req.body;
    const userId = (req as any).user?.id;

    const service = new PlayerApprovalService(prisma);
    const result = await service.requestChanges(leagueId as string, registrationId, userId, requiredChanges);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Fixtures
router.get('/fixtures', async (req: Request, res: Response) => {
  try {
    const { leagueId, page = 1, limit = 20, status, round } = req.query;
    const service = new FixtureService(prisma);
    const result = await service.getFixtures(leagueId as string, parseInt(page as string), parseInt(limit as string), { status, round });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/fixtures/:fixtureId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { fixtureId } = req.params;
    const service = new FixtureService(prisma);
    const fixture = await service.getFixtureDetail(leagueId as string, fixtureId);
    res.json({ success: true, data: fixture });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/fixtures/:fixtureId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { fixtureId } = req.params;
    const userId = (req as any).user?.id;
    const service = new FixtureService(prisma);
    const result = await service.editFixture(leagueId as string, fixtureId, req.body, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/fixtures/:fixtureId/reschedule', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { fixtureId } = req.params;
    const { newKickoffTime } = req.body;
    const userId = (req as any).user?.id;
    const service = new FixtureService(prisma);
    const result = await service.rescheduleFixture(leagueId as string, fixtureId, new Date(newKickoffTime), userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/fixtures/:fixtureId/cancel', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { fixtureId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.id;
    const service = new FixtureService(prisma);
    const result = await service.cancelFixture(leagueId as string, fixtureId, reason, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/fixtures/publish', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { fixtureIds } = req.body;
    const userId = (req as any).user?.id;
    const service = new FixtureService(prisma);
    const result = await service.publishFixtures(leagueId as string, fixtureIds, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Match Reports
router.get('/match-reports/pending', async (req: Request, res: Response) => {
  try {
    const { leagueId, page = 1, limit = 20 } = req.query;
    const service = new MatchReportService(prisma);
    const result = await service.getPendingReports(leagueId as string, parseInt(page as string), parseInt(limit as string));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/match-reports/:reportId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { reportId } = req.params;
    const service = new MatchReportService(prisma);
    const report = await service.getReportDetail(leagueId as string, reportId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/match-reports/:reportId/approve', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { reportId } = req.params;
    const { notes } = req.body;
    const userId = (req as any).user?.id;
    const service = new MatchReportService(prisma);
    const result = await service.approveReport(leagueId as string, reportId, userId, notes);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/match-reports/:reportId/reject', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { reportId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.id;
    const service = new MatchReportService(prisma);
    const result = await service.rejectReport(leagueId as string, reportId, userId, reason);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Standings
router.get('/standings', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const service = new StandingsService(prisma);
    const standings = await service.getStandings(leagueId as string);
    res.json({ success: true, data: standings });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/standings/recalculate', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new StandingsService(prisma);
    const result = await service.recalculateStandings(leagueId as string, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/standings/publish', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new StandingsService(prisma);
    const result = await service.publishStandings(leagueId as string, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Disciplinary
router.get('/disciplinary', async (req: Request, res: Response) => {
  try {
    const { leagueId, page = 1, limit = 20 } = req.query;
    const service = new DisciplinaryService(prisma);
    const result = await service.getCases(leagueId as string, parseInt(page as string), parseInt(limit as string));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/disciplinary', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new DisciplinaryService(prisma);
    const caseData = await service.createCase(leagueId as string, req.body, userId);
    res.json({ success: true, data: caseData });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/disciplinary/:caseId/decision', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { caseId } = req.params;
    const { decision } = req.body;
    const userId = (req as any).user?.id;
    const service = new DisciplinaryService(prisma);
    const result = await service.recordDecision(leagueId as string, caseId, decision, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Announcements
router.get('/announcements', async (req: Request, res: Response) => {
  try {
    const { leagueId, page = 1, limit = 20 } = req.query;
    const service = new AnnouncementService(prisma);
    const result = await service.getAnnouncements(leagueId as string, parseInt(page as string), parseInt(limit as string));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/announcements', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new AnnouncementService(prisma);
    const announcement = await service.createAnnouncement(leagueId as string, req.body, userId);
    res.json({ success: true, data: announcement });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/announcements/:announcementId/publish', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { announcementId } = req.params;
    const userId = (req as any).user?.id;
    const service = new AnnouncementService(prisma);
    const result = await service.publishAnnouncement(leagueId as string, announcementId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Reports
router.post('/reports/league-summary', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new ReportService(prisma);
    const report = await service.generateLeagueSummaryReport(leagueId as string, userId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/reports/standings', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new ReportService(prisma);
    const report = await service.generateStandingsReport(leagueId as string, userId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/reports/top-scorers', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const userId = (req as any).user?.id;
    const service = new ReportService(prisma);
    const report = await service.generateTopScorersReport(leagueId as string, userId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Clubs
router.get('/clubs', async (req: Request, res: Response) => {
  try {
    const { leagueId, page = 1, limit = 20 } = req.query;
    const service = new ClubManagementService(prisma);
    const result = await service.getClubs(leagueId as string, parseInt(page as string), parseInt(limit as string));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/clubs/:clubId', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;
    const { clubId } = req.params;
    const service = new ClubManagementService(prisma);
    const club = await service.getClubDetail(leagueId as string, clubId);
    res.json({ success: true, data: club });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/clubs/:clubId/players', async (req: Request, res: Response) => {
  try {
    const { leagueId, page = 1, limit = 20 } = req.query;
    const { clubId } = req.params;
    const service = new ClubManagementService(prisma);
    const result = await service.getClubPlayers(leagueId as string, clubId, parseInt(page as string), parseInt(limit as string));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
