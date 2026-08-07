/**
 * Authentication Seed Data
 * Run with: npx ts-node database/seed-auth.ts
 */

import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../src/auth/utils/password';

const prisma = new PrismaClient();

async function seedAuthData() {
  console.log('🌱 Seeding authentication data...');

  try {
    // Clear existing auth data (for development only)
    await prisma.rolePermission.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.role.deleteMany({});

    // Create Roles
    console.log('📋 Creating roles...');
    const platformOwnerRole = await prisma.role.create({
      data: {
        roleName: 'Platform Owner',
        description: 'Full system access',
        isSystemRole: true,
      },
    });

    const leagueManagerRole = await prisma.role.create({
      data: {
        roleName: 'League Manager',
        description: 'Manage leagues and competitions',
        isSystemRole: true,
      },
    });

    const refereeManagerRole = await prisma.role.create({
      data: {
        roleName: 'Referee Manager',
        description: 'Manage referees and assignments',
        isSystemRole: true,
      },
    });

    const teamManagerRole = await prisma.role.create({
      data: {
        roleName: 'Team Manager',
        description: 'Manage club and players',
        isSystemRole: true,
      },
    });

    const refereeRole = await prisma.role.create({
      data: {
        roleName: 'Referee',
        description: 'Submit match reports',
        isSystemRole: true,
      },
    });

    // Create Permissions
    console.log('🔐 Creating permissions...');
    const permissions = [
      // Auth permissions
      { name: 'auth:login', module: 'auth', desc: 'Can log in' },
      { name: 'auth:logout', module: 'auth', desc: 'Can log out' },
      { name: 'auth:refresh', module: 'auth', desc: 'Can refresh tokens' },
      { name: 'auth:change_password', module: 'auth', desc: 'Can change password' },

      // User management
      { name: 'user:create', module: 'user', desc: 'Can create users' },
      { name: 'user:read', module: 'user', desc: 'Can read user details' },
      { name: 'user:update', module: 'user', desc: 'Can update users' },
      { name: 'user:delete', module: 'user', desc: 'Can delete users' },
      { name: 'user:lock', module: 'user', desc: 'Can lock users' },

      // League management
      { name: 'league:manage', module: 'league', desc: 'Can manage leagues' },
      { name: 'league:create', module: 'league', desc: 'Can create leagues' },
      { name: 'league:view', module: 'league', desc: 'Can view leagues' },

      // Referee management
      { name: 'referee:manage', module: 'referee', desc: 'Can manage referees' },
      { name: 'referee:assign', module: 'referee', desc: 'Can assign referees' },
      { name: 'referee:evaluate', module: 'referee', desc: 'Can evaluate referees' },
      { name: 'referee:pay', module: 'referee', desc: 'Can process referee payments' },

      // Club management
      { name: 'club:manage', module: 'club', desc: 'Can manage clubs' },
      { name: 'club:register', module: 'club', desc: 'Can register clubs' },
      { name: 'club:view', module: 'club', desc: 'Can view club details' },

      // Player management
      { name: 'player:register', module: 'player', desc: 'Can register players' },
      { name: 'player:manage', module: 'player', desc: 'Can manage players' },
      { name: 'player:approve', module: 'player', desc: 'Can approve player registrations' },

      // Fixture management
      { name: 'fixture:manage', module: 'fixture', desc: 'Can manage fixtures' },
      { name: 'fixture:create', module: 'fixture', desc: 'Can create fixtures' },
      { name: 'fixture:view', module: 'fixture', desc: 'Can view fixtures' },

      // Match operations
      { name: 'match:report', module: 'match', desc: 'Can submit match reports' },
      { name: 'match:view', module: 'match', desc: 'Can view match details' },
      { name: 'match:approve', module: 'match', desc: 'Can approve match reports' },

      // System administration
      { name: 'system:admin', module: 'system', desc: 'System Administrator' },
      { name: 'system:audit', module: 'system', desc: 'Can view audit logs' },
      { name: 'system:settings', module: 'system', desc: 'Can manage system settings' },
    ];

    const permissionMap: Record<string, any> = {};
    for (const perm of permissions) {
      const created = await prisma.permission.create({
        data: {
          permissionName: perm.name,
          module: perm.module,
          description: perm.desc,
        },
      });
      permissionMap[perm.name] = created;
    }

    // Assign permissions to roles
    console.log('🔗 Assigning permissions to roles...');

    // Platform Owner - all permissions
    const allPermissions = Object.values(permissionMap);
    for (const perm of allPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: platformOwnerRole.id,
          permissionId: perm.id,
        },
      });
    }

    // League Manager
    const leaguePermissions = ['league:manage', 'league:create', 'league:view', 'fixture:manage', 'fixture:create', 'fixture:view', 'match:view'];
    for (const permName of leaguePermissions) {
      if (permissionMap[permName]) {
        await prisma.rolePermission.create({
          data: {
            roleId: leagueManagerRole.id,
            permissionId: permissionMap[permName].id,
          },
        });
      }
    }

    // Referee Manager
    const refereeMgrPermissions = ['referee:manage', 'referee:assign', 'referee:evaluate', 'referee:pay'];
    for (const permName of refereeMgrPermissions) {
      if (permissionMap[permName]) {
        await prisma.rolePermission.create({
          data: {
            roleId: refereeManagerRole.id,
            permissionId: permissionMap[permName].id,
          },
        });
      }
    }

    // Team Manager
    const teamMgrPermissions = ['club:manage', 'club:view', 'player:register', 'player:manage', 'fixture:view', 'match:view'];
    for (const permName of teamMgrPermissions) {
      if (permissionMap[permName]) {
        await prisma.rolePermission.create({
          data: {
            roleId: teamManagerRole.id,
            permissionId: permissionMap[permName].id,
          },
        });
      }
    }

    // Referee
    const refereePermissions = ['match:report', 'match:view', 'fixture:view'];
    for (const permName of refereePermissions) {
      if (permissionMap[permName]) {
        await prisma.rolePermission.create({
          data: {
            roleId: refereeRole.id,
            permissionId: permissionMap[permName].id,
          },
        });
      }
    }

    // Create test users with roles
    console.log('👥 Creating test users...');

    const platformOwnerPassword = await PasswordService.hashPassword('PlatformOwner@123');
    const platformOwner = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Admin',
        email: 'admin@knscl.local',
        phoneNumber: '+254712345678',
        passwordHash: platformOwnerPassword,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: platformOwner.id,
        roleId: platformOwnerRole.id,
      },
    });

    const leaguePassword = await PasswordService.hashPassword('LeagueManager@123');
    const leagueManager = await prisma.user.create({
      data: {
        firstName: 'Jane',
        lastName: 'League',
        email: 'league@knscl.local',
        phoneNumber: '+254712345679',
        passwordHash: leaguePassword,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: leagueManager.id,
        roleId: leagueManagerRole.id,
      },
    });

    const refereePassword = await PasswordService.hashPassword('Referee@123');
    const referee = await prisma.user.create({
      data: {
        firstName: 'Peter',
        lastName: 'Ref',
        email: 'referee@knscl.local',
        phoneNumber: '+254712345680',
        passwordHash: refereePassword,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: referee.id,
        roleId: refereeRole.id,
      },
    });

    console.log('✅ Authentication seed data created successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('  Platform Owner: admin@knscl.local / PlatformOwner@123');
    console.log('  League Manager: league@knscl.local / LeagueManager@123');
    console.log('  Referee: referee@knscl.local / Referee@123');
  } catch (error) {
    console.error('❌ Error seeding auth data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAuthData();
