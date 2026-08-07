import { describe, it, expect, beforeEach } from '@jest/globals';
import { RbacService } from '../../src/auth/services/rbac.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const rbacService = new RbacService(prisma);

describe('RBAC - Authorization & Permissions', () => {
  let adminUser: any;
  let platformOwnerUser: any;
  let leagueManagerUser: any;

  beforeEach(async () => {
    // Create admin user
    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    adminUser = await prisma.user.create({
      data: {
        username: `admin-${Date.now()}`,
        email: `admin-${Date.now()}@test.com`,
        passwordHash: 'hashed',
        firstName: 'Admin',
        lastName: 'User',
        roles: { connect: [{ id: adminRole?.id }] },
      },
    });

    // Create Platform Owner user
    const poRole = await prisma.role.findUnique({ where: { name: 'Platform Owner' } });
    platformOwnerUser = await prisma.user.create({
      data: {
        username: `po-${Date.now()}`,
        email: `po-${Date.now()}@test.com`,
        passwordHash: 'hashed',
        firstName: 'Platform',
        lastName: 'Owner',
        roles: { connect: [{ id: poRole?.id }] },
      },
    });

    // Create League Manager user
    const lmRole = await prisma.role.findUnique({ where: { name: 'League Manager' } });
    leagueManagerUser = await prisma.user.create({
      data: {
        username: `lm-${Date.now()}`,
        email: `lm-${Date.now()}@test.com`,
        passwordHash: 'hashed',
        firstName: 'League',
        lastName: 'Manager',
        roles: { connect: [{ id: lmRole?.id }] },
      },
    });
  });

  describe('Admin Role', () => {
    it('should have access to all modules', async () => {
      const canAccessAll = await rbacService.hasPermission(
        adminUser.id,
        'admin:all'
      );
      expect(canAccessAll).toBe(true);
    });
  });

  describe('Platform Owner Role', () => {
    it('should access platform owner functions', async () => {
      const canCreate = await rbacService.hasPermission(
        platformOwnerUser.id,
        'platform:create_league'
      );
      expect(canCreate).toBe(true);
    });

    it('should NOT access league manager functions', async () => {
      const canApprove = await rbacService.hasPermission(
        platformOwnerUser.id,
        'league:approve_player'
      );
      expect(canApprove).toBe(false);
    });
  });

  describe('League Manager Role', () => {
    it('should access league functions', async () => {
      const canApprove = await rbacService.hasPermission(
        leagueManagerUser.id,
        'league:approve_player'
      );
      expect(canApprove).toBe(true);
    });

    it('should NOT access admin functions', async () => {
      const canDelete = await rbacService.hasPermission(
        leagueManagerUser.id,
        'admin:delete_user'
      );
      expect(canDelete).toBe(false);
    });

    it('should NOT access platform owner functions', async () => {
      const canCreate = await rbacService.hasPermission(
        leagueManagerUser.id,
        'platform:create_league'
      );
      expect(canCreate).toBe(false);
    });
  });

  describe('Role Isolation', () => {
    it('should prevent unauthorized access to protected resources', async () => {
      const isAuthorized = await rbacService.authorize(
        leagueManagerUser.id,
        'platform:create_league'
      );
      expect(isAuthorized).toBe(false);
    });

    it('should allow authorized access to permitted resources', async () => {
      const isAuthorized = await rbacService.authorize(
        platformOwnerUser.id,
        'platform:create_league'
      );
      expect(isAuthorized).toBe(true);
    });
  });
});
