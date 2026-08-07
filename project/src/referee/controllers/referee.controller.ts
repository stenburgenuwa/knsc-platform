// Referee Controller - 16 REST API endpoints
import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { FixtureService } from '../services/fixture.service';
import { MatchReportService } from '../services/matchreport.service';
import { ProfileService } from '../services/profile.service';
import { AnnouncementService } from '../services/announcements.service';

export class RefereeController {
  private dashboardService = new DashboardService();
  private fixtureService = new FixtureService();
  private matchReportService = new MatchReportService();
  private profileService = new ProfileService();
  private announcementService = new AnnouncementService();

  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const dashboard = await this.dashboardService.getDashboard(refereeId);
      res.json(dashboard);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getFixtures(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { limit = 20, offset = 0 } = req.query;
      const fixtures = await this.fixtureService.getAssignedFixtures(refereeId, parseInt(limit as string), parseInt(offset as string));
      res.json({ data: fixtures, limit, offset });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getTodayFixtures(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const fixtures = await this.fixtureService.getTodayFixtures(refereeId);
      res.json(fixtures);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getFixtureDetail(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { fixtureId } = req.params;
      const fixture = await this.fixtureService.getFixtureDetail(refereeId, fixtureId);
      if (!fixture) {
        res.status(404).json({ error: 'Fixture not found' });
        return;
      }
      res.json(fixture);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getTeamSheets(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { fixtureId } = req.params;
      const sheets = await this.fixtureService.getTeamSheets(refereeId, fixtureId);
      res.json(sheets);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async startMatchReport(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { fixtureId } = req.params;
      const report = await this.matchReportService.startMatchReport(refereeId, fixtureId);
      res.status(201).json(report);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async recordGoal(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { reportId } = req.params;
      const goal = await this.matchReportService.recordGoal(refereeId, reportId, req.body);
      res.status(201).json(goal);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async recordYellowCard(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { reportId } = req.params;
      const card = await this.matchReportService.recordYellowCard(refereeId, reportId, req.body);
      res.status(201).json(card);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async recordRedCard(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { reportId } = req.params;
      const card = await this.matchReportService.recordRedCard(refereeId, reportId, req.body);
      res.status(201).json(card);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async recordSubstitution(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { reportId } = req.params;
      const sub = await this.matchReportService.recordSubstitution(refereeId, reportId, req.body);
      res.status(201).json(sub);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async submitMatchReport(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { reportId } = req.params;
      const report = await this.matchReportService.submitMatchReport(refereeId, reportId, req.body);
      res.json(report);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getSubmittedReports(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { limit = 20, offset = 0 } = req.query;
      const reports = await this.matchReportService.getSubmittedReports(refereeId, parseInt(limit as string), parseInt(offset as string));
      res.json({ data: reports, limit, offset });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const profile = await this.profileService.getProfile(refereeId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      res.json(profile);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { status } = req.body;
      const availability = await this.profileService.updateAvailability(refereeId, status);
      res.json(availability);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { limit = 20, offset = 0 } = req.query;
      const announcements = await this.announcementService.getAnnouncements(refereeId, parseInt(limit as string), parseInt(offset as string));
      res.json({ data: announcements, limit, offset });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const refereeId = req.user?.id;
      const { limit = 20 } = req.query;
      const notifications = await this.announcementService.getNotifications(refereeId, parseInt(limit as string));
      res.json(notifications);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    const message = error?.message || 'Internal server error';
    if (message.includes('Unauthorized')) {
      res.status(403).json({ error: message });
    } else if (message.includes('not found')) {
      res.status(404).json({ error: message });
    } else if (message.includes('Invalid') || message.includes('already')) {
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
