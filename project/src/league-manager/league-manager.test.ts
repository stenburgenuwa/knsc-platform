// League Manager Module Unit Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { DashboardService } from '../services/dashboard.service';
import { PlayerApprovalService } from '../services/player-approval.service';
import { FixtureService } from '../services/fixture.service';
import { StandingsService } from '../services/standings.service';

// Mock Prisma
const mockPrisma = {
  leagueManager: { findUnique: vi.fn() },
  league: { findUnique: vi.fn() },
  club: { count: vi.fn(), findMany: vi.fn() },
  player: { count: vi.fn(), findMany: vi.fn() },
  playerRegistration: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  fixture: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  matchReport: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  referee: { count: vi.fn() },
  disciplinaryCase: { count: vi.fn() },
  standing: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
  standingsPublish: { findFirst: vi.fn(), create: vi.fn() },
  auditLog: { findMany: vi.fn(), create: vi.fn() },
  playerApprovalHistory: { findMany: vi.fn(), create: vi.fn() },
  $transaction: vi.fn((cb) => Promise.resolve(cb)),
} as any;

describe('Dashboard Service', () => {
  let service: DashboardService;

  beforeEach(() => {
    service = new DashboardService(mockPrisma);
    vi.clearAllMocks();
  });

  it('should retrieve league manager dashboard', async () => {
    const mockLeagueId = 'league-1';
    const mockUserId = 'user-1';

    mockPrisma.leagueManager.findUnique.mockResolvedValue({ leagueId: mockLeagueId, userId: mockUserId });
    mockPrisma.league.findUnique.mockResolvedValue({
      id: mockLeagueId,
      name: 'Test League',
      season: '2024',
      county: 'Kilifi',
      status: 'active',
    });

    mockPrisma.club.count.mockResolvedValue(10);
    mockPrisma.player.count.mockResolvedValue(150);
    mockPrisma.playerRegistration.count.mockResolvedValue(5);
    mockPrisma.matchReport.count.mockResolvedValue(3);
    mockPrisma.referee.count.mockResolvedValue(8);
    mockPrisma.disciplinaryCase.count.mockResolvedValue(2);
    mockPrisma.fixture.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    mockPrisma.standingsPublish.findFirst.mockResolvedValue(null);

    const dashboard = await service.getDashboard(mockLeagueId, mockUserId);

    expect(dashboard).toBeDefined();
    expect(dashboard.league.name).toBe('Test League');
    expect(dashboard.summary.totalClubs).toBe(10);
    expect(mockPrisma.leagueManager.findUnique).toHaveBeenCalled();
  });

  it('should reject unauthorized access', async () => {
    mockPrisma.leagueManager.findUnique.mockResolvedValue(null);

    await expect(service.getDashboard('league-1', 'user-1')).rejects.toThrow('Unauthorized');
  });
});

describe('Player Approval Service', () => {
  let service: PlayerApprovalService;

  beforeEach(() => {
    service = new PlayerApprovalService(mockPrisma);
    vi.clearAllMocks();
  });

  it('should retrieve pending player approvals', async () => {
    mockPrisma.playerRegistration.findMany.mockResolvedValue([
      {
        id: 'reg-1',
        playerId: 'player-1',
        status: 'pending',
        submittedDate: new Date(),
      },
    ]);
    mockPrisma.playerRegistration.count.mockResolvedValue(1);

    const result = await service.getPendingApprovals('league-1');

    expect(result.approvals).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockPrisma.playerRegistration.findMany).toHaveBeenCalled();
  });

  it('should approve player registration', async () => {
    mockPrisma.playerRegistration.findUnique.mockResolvedValue({
      id: 'reg-1',
      leagueId: 'league-1',
      status: 'pending',
    });

    mockPrisma.$transaction.mockResolvedValue([null, null, null]);

    const result = await service.approveRegistration('league-1', 'reg-1', 'user-1');

    expect(result.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should reject duplicate registration', async () => {
    mockPrisma.playerRegistration.findUnique.mockResolvedValue({
      id: 'reg-1',
      leagueId: 'league-1',
      status: 'pending',
      registrationNumber: 'REG-001',
    });

    const validation = await service.validateRegistration('reg-1');

    expect(validation).toBeDefined();
  });
});

describe('Fixture Service', () => {
  let service: FixtureService;

  beforeEach(() => {
    service = new FixtureService(mockPrisma);
    vi.clearAllMocks();
  });

  it('should retrieve league fixtures', async () => {
    mockPrisma.fixture.findMany.mockResolvedValue([
      {
        id: 'fix-1',
        matchNumber: 'M-001',
        status: 'scheduled',
      },
    ]);
    mockPrisma.fixture.count.mockResolvedValue(1);

    const result = await service.getFixtures('league-1');

    expect(result.fixtures).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should edit fixture successfully', async () => {
    mockPrisma.fixture.findUnique.mockResolvedValue({
      id: 'fix-1',
      leagueId: 'league-1',
      status: 'scheduled',
      matchNumber: 'M-001',
    });

    mockPrisma.$transaction.mockResolvedValue([null, null]);

    const result = await service.editFixture('league-1', 'fix-1', { venue: 'New Venue' }, 'user-1');

    expect(result.success).toBe(true);
  });

  it('should not edit completed fixture', async () => {
    mockPrisma.fixture.findUnique.mockResolvedValue({
      id: 'fix-1',
      leagueId: 'league-1',
      status: 'completed',
    });

    await expect(service.editFixture('league-1', 'fix-1', {}, 'user-1')).rejects.toThrow('Cannot edit completed fixtures');
  });
});

describe('Standings Service', () => {
  let service: StandingsService;

  beforeEach(() => {
    service = new StandingsService(mockPrisma);
    vi.clearAllMocks();
  });

  it('should retrieve league standings', async () => {
    mockPrisma.standing.findMany.mockResolvedValue([
      {
        clubId: 'club-1',
        points: 12,
        played: 4,
        won: 4,
        drawn: 0,
        lost: 0,
        club: { name: 'Team A' },
      },
    ]);

    const standings = await service.getStandings('league-1');

    expect(standings).toHaveLength(1);
    expect(standings[0].position).toBe(1);
  });

  it('should recalculate standings', async () => {
    mockPrisma.fixture.findMany.mockResolvedValue([]);
    mockPrisma.standing.deleteMany.mockResolvedValue({ count: 0 });

    const result = await service.recalculateStandings('league-1', 'user-1');

    expect(result.success).toBe(true);
  });

  it('should publish standings', async () => {
    mockPrisma.standing.findMany.mockResolvedValue([
      {
        clubId: 'club-1',
        points: 12,
        club: { name: 'Team A' },
      },
    ]);
    mockPrisma.standingsPublish.create.mockResolvedValue({});

    const result = await service.publishStandings('league-1', 'user-1');

    expect(result.success).toBe(true);
  });
});
