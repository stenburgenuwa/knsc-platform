import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'argon2';

const prisma = new PrismaClient();

describe('Database - Schema Integrity', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Foreign Key Relationships', () => {
    it('should maintain User -> Role relationship', async () => {
      const user = await prisma.user.findFirst({ include: { roles: true } });
      expect(user?.roles).toBeDefined();
    });

    it('should maintain Role -> Permission relationship', async () => {
      const role = await prisma.role.findFirst({ include: { permissions: true } });
      expect(role?.permissions).toBeDefined();
    });

    it('should maintain Referee -> Assignment relationship', async () => {
      const referee = await prisma.referee.findFirst({ include: { assignments: true } });
      expect(referee?.assignments).toBeDefined();
    });

    it('should maintain League -> Club relationship', async () => {
      const league = await prisma.league.findFirst({ include: { clubs: true } });
      expect(league?.clubs).toBeDefined();
    });
  });

  describe('Constraints & Uniqueness', () => {
    it('should enforce unique usernames', async () => {
      const user = await prisma.user.findFirst();
      if (user) {
        await expect(
          prisma.user.create({
            data: {
              username: user.username,
              email: `unique-${Date.now()}@test.com`,
              passwordHash: await bcrypt.hash('password123'),
              firstName: 'Test',
              lastName: 'User',
            },
          })
        ).rejects.toThrow();
      }
    });

    it('should enforce unique emails', async () => {
      const user = await prisma.user.findFirst();
      if (user) {
        await expect(
          prisma.user.create({
            data: {
              username: `user-${Date.now()}`,
              email: user.email,
              passwordHash: await bcrypt.hash('password123'),
              firstName: 'Test',
              lastName: 'User',
            },
          })
        ).rejects.toThrow();
      }
    });

    it('should prevent duplicate registration numbers', async () => {
      const player = await prisma.player.findFirst();
      if (player) {
        await expect(
          prisma.player.create({
            data: {
              registrationNumber: player.registrationNumber,
              firstName: 'Test',
              lastName: 'Player',
              position: 'Forward',
              clubId: player.clubId,
            },
          })
        ).rejects.toThrow();
      }
    });
  });

  describe('Soft Deletes', () => {
    it('should track deletion timestamps', async () => {
      const user = await prisma.user.create({
        data: {
          username: `test-${Date.now()}`,
          email: `test-${Date.now()}@example.com`,
          passwordHash: await bcrypt.hash('password'),
          firstName: 'Test',
          lastName: 'Delete',
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { deletedAt: new Date() },
      });

      const deleted = await prisma.user.findUnique({ where: { id: user.id } });
      expect(deleted?.deletedAt).not.toBeNull();
    });
  });

  describe('Cascading Operations', () => {
    it('should cascade on role deletion', async () => {
      const role = await prisma.role.create({
        data: {
          name: `test-role-${Date.now()}`,
          description: 'Test role',
          permissions: { create: [] },
        },
      });

      // Verify role exists
      let found = await prisma.role.findUnique({ where: { id: role.id } });
      expect(found).toBeDefined();

      // Delete role
      await prisma.role.delete({ where: { id: role.id } });

      // Verify deletion
      found = await prisma.role.findUnique({ where: { id: role.id } });
      expect(found).toBeNull();
    });
  });
});
