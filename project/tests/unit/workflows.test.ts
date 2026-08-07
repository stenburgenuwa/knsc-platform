import { describe, it, expect, beforeEach } from '@jest/globals';
import { PlayerService } from '../../src/platform-owner/services/player-approval.service';
import { TeamSheetService } from '../../src/team-manager/services/teamsheet.service';
import { FixtureService } from '../../src/league-manager/services/fixture.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Player Registration - Workflows', () => {
  let testClub: any;

  beforeEach(async () => {
    const league = await prisma.league.findFirst();
    testClub = await prisma.club.create({
      data: {
        name: `Test Club ${Date.now()}`,
        leagueId: league?.id,
        homeGround: 'Test Stadium',
        founded: 2024,
      },
    });
  });

  describe('Player Registration', () => {
    it('should register new player', async () => {
      const player = await prisma.player.create({
        data: {
          registrationNumber: `REG-${Date.now()}`,
          firstName: 'John',
          lastName: 'Doe',
          position: 'Forward',
          clubId: testClub.id,
          isApproved: false,
        },
      });

      expect(player).toBeDefined();
      expect(player.isApproved).toBe(false);
    });

    it('should prevent duplicate registration numbers', async () => {
      const regNum = `REG-${Date.now()}`;

      await prisma.player.create({
        data: {
          registrationNumber: regNum,
          firstName: 'John',
          lastName: 'Doe',
          position: 'Forward',
          clubId: testClub.id,
        },
      });

      await expect(
        prisma.player.create({
          data: {
            registrationNumber: regNum,
            firstName: 'Jane',
            lastName: 'Smith',
            position: 'Midfielder',
            clubId: testClub.id,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Approval Workflow', () => {
    it('should approve pending player', async () => {
      const player = await prisma.player.create({
        data: {
          registrationNumber: `REG-${Date.now()}`,
          firstName: 'John',
          lastName: 'Doe',
          position: 'Forward',
          clubId: testClub.id,
          isApproved: false,
        },
      });

      const approved = await prisma.player.update({
        where: { id: player.id },
        data: { isApproved: true, approvedAt: new Date() },
      });

      expect(approved.isApproved).toBe(true);
      expect(approved.approvedAt).not.toBeNull();
    });

    it('should reject player with reason', async () => {
      const player = await prisma.player.create({
        data: {
          registrationNumber: `REG-${Date.now()}`,
          firstName: 'John',
          lastName: 'Doe',
          position: 'Forward',
          clubId: testClub.id,
          isApproved: false,
        },
      });

      const rejected = await prisma.player.update({
        where: { id: player.id },
        data: { 
          isApproved: false,
          rejectionReason: 'Documentation incomplete',
          rejectedAt: new Date(),
        },
      });

      expect(rejected.rejectionReason).toBe('Documentation incomplete');
    });
  });
});

describe('Team Sheet - Submission & Validation', () => {
  let testFixture: any;
  let testClub: any;
  let testPlayers: any[] = [];

  beforeEach(async () => {
    const league = await prisma.league.findFirst();
    testClub = await prisma.club.create({
      data: {
        name: `Club ${Date.now()}`,
        leagueId: league?.id,
        homeGround: 'Stadium',
        founded: 2024,
      },
    });

    // Create 18 approved players
    for (let i = 0; i < 18; i++) {
      const player = await prisma.player.create({
        data: {
          registrationNumber: `REG-${Date.now()}-${i}`,
          firstName: `Player${i}`,
          lastName: 'Test',
          position: i < 11 ? 'Forward' : 'Midfielder',
          clubId: testClub.id,
          isApproved: true,
          approvedAt: new Date(),
        },
      });
      testPlayers.push(player);
    }

    // Create fixture
    const homeClub = testClub;
    const awayClub = await prisma.club.create({
      data: {
        name: `Away Club ${Date.now()}`,
        leagueId: league?.id,
        homeGround: 'Away Stadium',
        founded: 2024,
      },
    });

    testFixture = await prisma.fixture.create({
      data: {
        homeClubId: homeClub.id,
        awayClubId: awayClub.id,
        leagueId: league?.id,
        venue: 'Test Venue',
        kickoffTime: new Date(Date.now() + 86400000),
        status: 'scheduled',
      },
    });
  });

  describe('Team Sheet Creation', () => {
    it('should create team sheet with 11 starters and 7 substitutes', async () => {
      const starters = testPlayers.slice(0, 11).map(p => p.id);
      const substitutes = testPlayers.slice(11, 18).map(p => p.id);

      const teamSheet = await prisma.teamSheet.create({
        data: {
          fixtureId: testFixture.id,
          clubId: testClub.id,
          starterPlayerIds: starters,
          substitutePlayerIds: substitutes,
          submittedAt: new Date(),
          status: 'submitted',
        },
      });

      expect(teamSheet.starterPlayerIds.length).toBe(11);
      expect(teamSheet.substitutePlayerIds.length).toBe(7);
    });

    it('should reject team sheet with wrong number of starters', async () => {
      const starters = testPlayers.slice(0, 10).map(p => p.id);
      const substitutes = testPlayers.slice(10, 18).map(p => p.id);

      await expect(
        prisma.teamSheet.create({
          data: {
            fixtureId: testFixture.id,
            clubId: testClub.id,
            starterPlayerIds: starters,
            substitutePlayerIds: substitutes,
            submittedAt: new Date(),
            status: 'submitted',
          },
        })
      ).rejects.toThrow('Must have exactly 11 starters');
    });

    it('should reject team sheet with duplicate players', async () => {
      const playerId = testPlayers[0].id;
      const starters = Array(11).fill(playerId);
      const substitutes = testPlayers.slice(1, 8).map(p => p.id);

      await expect(
        prisma.teamSheet.create({
          data: {
            fixtureId: testFixture.id,
            clubId: testClub.id,
            starterPlayerIds: starters,
            substitutePlayerIds: substitutes,
            submittedAt: new Date(),
            status: 'submitted',
          },
        })
      ).rejects.toThrow('Duplicate players not allowed');
    });

    it('should reject team sheet with unapproved players', async () => {
      const unapprovedPlayer = await prisma.player.create({
        data: {
          registrationNumber: `UNAPPROVED-${Date.now()}`,
          firstName: 'Unapproved',
          lastName: 'Player',
          position: 'Forward',
          clubId: testClub.id,
          isApproved: false,
        },
      });

      const starters = [unapprovedPlayer.id, ...testPlayers.slice(0, 10).map(p => p.id)];
      const substitutes = testPlayers.slice(10, 17).map(p => p.id);

      await expect(
        prisma.teamSheet.create({
          data: {
            fixtureId: testFixture.id,
            clubId: testClub.id,
            starterPlayerIds: starters,
            substitutePlayerIds: substitutes,
            submittedAt: new Date(),
            status: 'submitted',
          },
        })
      ).rejects.toThrow('All players must be approved');
    });
  });
});
