// Team Manager Controller - 20 REST API endpoints
import { Request, Response } from 'express';
import { PlayerService } from '../services/player.service';
import { TeamSheetService } from '../services/teamsheet.service';
import { ClubService } from '../services/club.service';
import { FixtureService } from '../services/fixture.service';
import { DashboardService } from '../services/dashboard.service';
import { ReportsService } from '../services/reports.service';
import { AnnouncementService } from '../services/announcements.service';

export class TeamManagerController {
  private playerService = new PlayerService();
  private teamSheetService = new TeamSheetService();
  private clubService = new ClubService();
  private fixtureService = new FixtureService();
  private dashboardService = new DashboardService();
  private reportsService = new ReportsService();
  private announcementService = new AnnouncementService();

  // Dashboard
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { clubId } = req.params;
      const userId = req.user?.id;

      const dashboard = await this.dashboardService.getDashboard(clubId, userId);
      res.json(dashboard);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Club Profile
  async getClubProfile(req: Request, res: Response): Promise<void> {
    try {
      const { clubId } = req.params;
      const profile = await this.clubService.getClubProfile(clubId);

      if (!profile) {
        res.status(404).json({ error: 'Club not found' });
        return;
      }

      res.json(profile);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Players
  async registerPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { clubId } = req.params;
      const player = await this.playerService.registerPlayer(clubId, req.body);

      res.status(201).json(player);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getPlayers(req: Request, res: Response): Promise<void> {
    try {
      const { clubId } = req.params;
      const { limit = 20, offset = 0, status, position } = req.query;

      const players = await this.playerService.getPlayersByClub(clubId, { status, position });
      const paginated = players.slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));

      res.json({
        data: paginated,
        total: players.length,
        limit,
        offset,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getPlayerDetail(req: Request, res: Response): Promise<void> {
    try {
      const { clubId, playerId } = req.params;
      const player = await this.playerService.getPlayerById(clubId, playerId);

      if (!player) {
        res.status(404).json({ error: 'Player not found' });
        return;
      }

      res.json(player);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async editPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { clubId, playerId } = req.params;
      const updated = await this.playerService.editPlayer(clubId, playerId, req.body);

      res.json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async searchPlayers(req: Request, res: Response): Promise<void> {
    try {
      const { clubId } = req.params;
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Query parameter required' });
        return;
      }

      const results = await this.playerService.searchPlayers(clubId, q);
      res.json(results);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Team Sheets
  async createTeamSheet(req: Request, res: Response): Promise<void> {
    try {
      const { clubId, fixtureId } = req.params;
      const teamSheet = await this.teamSheetService.createTeamSheet(clubId, fixtureId);

      res.status(201).json(teamSheet);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateTeamSheet(req: Request, res: Response): Promise<void> {
    try {
      const { clubId, teamSheetId } = req.params;
      const { startingXI, substitutes, captain } = req.body;

      const updated = await this.teamSheetService.updateTeamSheet(clubId, teamSheetId, startingXI, substitutes, captain);

      res.json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async submitTeamSheet(req: Request, res: Response): Promise<void> {
    try {
      const { clubId, teamSheetId } = req.params;
      const submitted = await this.teamSheetService.submitTeamSheet(clubId, teamSheetId);

      res.json(submitted);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getTeamSheet(req: Request, res: Response): Promise<void> {
    try {
      const { clubId, teamSheetId } = req.params;
      const teamSheet = await this.teamSheetService.getTeamSheet(clubId, teamSheetId);

      if (!teamSheet) {
        res.status(404).json({ error: 'Team sheet not found' });
        return;
      }

      res.json(teamSheet);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Fixtures
  async getFixtures(req: Request, res: Response): Promise<void> {
    try {
      const { clubId } = req.params;
      const { leagueId } = req.query;

      if (!leagueId) {
        res.status(400).json({ error: 'League ID required' });
        return;
      }

      const fixtures = await this.fixtureService.getFixturesByClub(clubId, leagueId as string, '');

      res.json(fixtures);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getFixtureDetail(req: Request, res: Response): Promise<void> {
    try {
      const { fixtureId } = req.params;
      const fixture = await this.fixtureService.getFixtureDetail(fixtureId);

      if (!fixture) {
        res.status(404).json({ error: 'Fixture not found' });
        return;
      }

      res.json(fixture);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getLeagueTable(req: Request, res: Response): Promise<void> {
    try {
      const { leagueId } = req.params;
      const { seasonId } = req.query;

      const table = await this.clubService.getLeagueTable(leagueId, seasonId as string);

      res.json(table);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Announcements
  async getAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const { clubId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const announcements = await this.announcementService.getAnnouncementsForClub(
        clubId,
        parseInt(limit as string),
        parseInt(offset as string),
      );

      res.json({
        data: announcements,
        limit,
        offset,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { limit = 20 } = req.query;

      const notifications = await this.announcementService.getNotificationsForUser(userId, parseInt(limit as string));

      res.json(notifications);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Reports
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { clubId } = req.params;
      const { reportType, format } = req.body;

      const report = await this.reportsService.generateReport(clubId, { reportType, format });

      res.json(report);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // Club Statistics
  async getClubStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { clubId } = req.params;
      const { seasonId } = req.query;

      const stats = await this.clubService.getClubStatistics(clubId, seasonId as string);

      res.json(stats);
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
