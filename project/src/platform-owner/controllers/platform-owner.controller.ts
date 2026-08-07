import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { LeagueService } from '../services/league.service';
import { ClubService } from '../services/club.service';
import { UserManagementService } from '../services/user-management.service';
import { PlayerApprovalService } from '../services/player-approval.service';
import { FixtureService } from '../services/fixture.service';
import { ReportService } from '../services/report.service';
import { DashboardService } from '../services/dashboard.service';

const prisma = new PrismaClient();

/**
 * Platform Owner Controller - handles all admin endpoints
 */
export class PlatformOwnerController {
  private leagueService: LeagueService;
  private clubService: ClubService;
  private userService: UserManagementService;
  private playerService: PlayerApprovalService;
  private fixtureService: FixtureService;
  private reportService: ReportService;
  private dashboardService: DashboardService;

  constructor(userId: string) {
    this.leagueService = new LeagueService(prisma, userId);
    this.clubService = new ClubService(prisma, userId);
    this.userService = new UserManagementService(prisma, userId);
    this.playerService = new PlayerApprovalService(prisma, userId);
    this.fixtureService = new FixtureService(prisma, userId);
    this.reportService = new ReportService(prisma, userId);
    this.dashboardService = new DashboardService(prisma);
  }

  /**
   * GET /api/platform-owner/dashboard
   */
  async getDashboard(req: NextRequest): Promise<NextResponse> {
    try {
      const summary = await this.dashboardService.getDashboardSummary();
      return NextResponse.json(summary, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
    }
  }

  /**
   * POST /api/platform-owner/leagues
   */
  async createLeague(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const league = await this.leagueService.createLeague(data);
      return NextResponse.json(league, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  /**
   * GET /api/platform-owner/leagues
   */
  async listLeagues(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const result = await this.leagueService.listLeagues(limit, offset);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch leagues' }, { status: 500 });
    }
  }

  /**
   * POST /api/platform-owner/clubs
   */
  async createClub(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const club = await this.clubService.createClub(data);
      return NextResponse.json(club, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  /**
   * GET /api/platform-owner/clubs
   */
  async listClubs(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const leagueId = url.searchParams.get('leagueId') || undefined;
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const result = await this.clubService.listClubs(leagueId, limit, offset);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
    }
  }

  /**
   * POST /api/platform-owner/players/approve
   */
  async approvePlayer(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const result = await this.playerService.approvePlayer(data);
      return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  /**
   * POST /api/platform-owner/fixtures
   */
  async createFixture(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const fixture = await this.fixtureService.createFixture(data);
      return NextResponse.json(fixture, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  /**
   * GET /api/platform-owner/reports/players
   */
  async getPlayerReport(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const filters = Object.fromEntries(url.searchParams.entries());
      const report = await this.reportService.generatePlayerReport(filters);
      return NextResponse.json(report, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
  }

  /**
   * GET /api/platform-owner/audit-logs
   */
  async getAuditLogs(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const filters = {
        userId: url.searchParams.get('userId') || undefined,
        module: url.searchParams.get('module') || undefined,
        action: url.searchParams.get('action') || undefined,
        limit: parseInt(url.searchParams.get('limit') || '100'),
        offset: parseInt(url.searchParams.get('offset') || '0'),
      };

      const result = await this.reportService.getAuditLogs(filters);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
  }
}
