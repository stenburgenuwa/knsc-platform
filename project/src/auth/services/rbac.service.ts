import { PrismaClient } from '@prisma/client';

/**
 * RBAC Service - Role-Based Access Control
 */

export class RbacService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!userRole) return false;

    return userRole.role.permissions.some(rp => rp.permission.permissionName === permissionName);
  }

  /**
   * Check if user has any of the given permissions
   */
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all given permissions
   */
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: { roleName },
        expiresAt: { gt: new Date() },
      },
    });

    return !!userRole;
  }

  /**
   * Check if user has any of the given roles
   */
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    for (const role of roles) {
      if (await this.hasRole(userId, role)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const roles = await this.prisma.userRole.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();
    roles.forEach(ur => {
      ur.role.permissions.forEach(rp => {
        permissions.add(rp.permission.permissionName);
      });
    });

    return Array.from(permissions);
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const roles = await this.prisma.userRole.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      include: { role: true },
    });

    return roles.map(ur => ur.role.roleName);
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleName: string, assignedBy: string, expiresAt?: Date): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { roleName },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    await this.prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
        assignedBy,
        expiresAt: expiresAt || undefined,
      },
    });
  }

  /**
   * Revoke role from user
   */
  async revokeRole(userId: string, roleName: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { roleName },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: role.id,
      },
    });
  }

  /**
   * Get all roles with their permissions
   */
  async getAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Get all permissions
   */
  async getAllPermissions() {
    return this.prisma.permission.findMany();
  }
}
