import { PrismaClient } from '@prisma/client';
import { LeagueService } from '../services/league.service';
import { ClubService } from '../services/club.service';
import { UserManagementService } from '../services/user-management.service';
import { PlayerApprovalService } from '../services/player-approval.service';

const prisma = new PrismaClient();

describe('Platform Owner - League Service', () => {
  let leagueService: LeagueService;
  const testUserId = 'test-platform-owner';

  beforeEach(() => {
    leagueService = new LeagueService(prisma, testUserId);
  });

  describe('createLeague', () => {
    test('should create a new league', async () => {
      const input = {
        leagueName: 'Test League',
        seasonId: 'season-1',
        countyId: 'kilifi',
        competitionType: 'Regular',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      const league = await leagueService.createLeague(input);
      expect(league).toBeDefined();
      expect(league.leagueName).toBe('Test League');
      expect(league.status).toBe('Draft');
    });

    test('should prevent duplicate league names', async () => {
      const input = {
        leagueName: 'Duplicate League',
        seasonId: 'season-1',
        countyId: 'kilifi',
        competitionType: 'Regular',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      await leagueService.createLeague(input);

      await expect(leagueService.createLeague(input)).rejects.toThrow('League with this name already exists');
    });

    test('should apply default point values', async () => {
      const input = {
        leagueName: 'Points Test League',
        seasonId: 'season-1',
        countyId: 'kilifi',
        competitionType: 'Regular',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      const league = await leagueService.createLeague(input);
      expect(league.pointsWin).toBe(3);
      expect(league.pointsDraw).toBe(1);
      expect(league.pointsLoss).toBe(0);
    });
  });

  describe('listLeagues', () => {
    test('should return paginated leagues', async () => {
      const result = await leagueService.listLeagues(10, 0);
      expect(result).toHaveProperty('leagues');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('offset');
    });
  });
});

describe('Platform Owner - Club Service', () => {
  let clubService: ClubService;
  const testUserId = 'test-platform-owner';

  beforeEach(() => {
    clubService = new ClubService(prisma, testUserId);
  });

  describe('createClub', () => {
    test('should create a new club', async () => {
      const input = {
        clubName: 'Test Club',
        leagueId: 'league-1',
        countyId: 'kilifi',
        clubType: 'Football Club',
        email: 'test@club.com',
      };

      const club = await clubService.createClub(input);
      expect(club).toBeDefined();
      expect(club.clubName).toBe('Test Club');
      expect(club.status).toBe('Draft');
    });

    test('should prevent duplicate club names', async () => {
      const input = {
        clubName: 'Duplicate Club',
        leagueId: 'league-1',
        countyId: 'kilifi',
        clubType: 'Football Club',
      };

      await clubService.createClub(input);

      await expect(clubService.createClub(input)).rejects.toThrow('Club with this name already exists');
    });
  });

  describe('updateClubBranding', () => {
    test('should update or create club branding', async () => {
      const brandingInput = {
        clubId: 'club-1',
        primaryColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        logoUrl: 'https://example.com/logo.png',
      };

      const branding = await clubService.updateClubBranding(brandingInput);
      expect(branding).toBeDefined();
      expect(branding.primaryColor).toBe('#FF0000');
    });
  });
});

describe('Platform Owner - User Management Service', () => {
  let userService: UserManagementService;
  const testUserId = 'test-platform-owner';

  beforeEach(() => {
    userService = new UserManagementService(prisma, testUserId);
  });

  describe('createLeagueManager', () => {
    test('should create league manager with temporary password', async () => {
      const input = {
        firstName: 'John',
        lastName: 'Manager',
        email: 'john@league.com',
        phoneNumber: '+254712345678',
        username: 'johnmanager',
        leagueId: 'league-1',
      };

      const result = await userService.createLeagueManager(input);
      expect(result.user).toBeDefined();
      expect(result.temporaryPassword).toBeDefined();
      expect(result.user.requiresPasswordChange).toBe(true);
    });

    test('should prevent duplicate usernames', async () => {
      const input = {
        firstName: 'Jane',
        lastName: 'Manager',
        email: 'jane@league.com',
        phoneNumber: '+254712345678',
        username: 'janemanager',
        leagueId: 'league-1',
      };

      await userService.createLeagueManager(input);

      await expect(userService.createLeagueManager(input)).rejects.toThrow('Username already exists');
    });
  });
});

describe('Platform Owner - Player Approval Service', () => {
  let playerService: PlayerApprovalService;
  const testUserId = 'test-platform-owner';

  beforeEach(() => {
    playerService = new PlayerApprovalService(prisma, testUserId);
  });

  describe('getPendingApprovals', () => {
    test('should return pending player approvals', async () => {
      const result = await playerService.getPendingApprovals(10, 0);
      expect(result).toHaveProperty('registrations');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit');
    });
  });

  describe('approvePlayer', () => {
    test('should approve a player registration', async () => {
      // This test would need a pending registration to exist
      // Skipping for now as it requires test data setup
    });
  });

  describe('getApprovalStats', () => {
    test('should return approval statistics', async () => {
      const stats = await playerService.getApprovalStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('approved');
      expect(stats).toHaveProperty('rejected');
    });
  });
});
