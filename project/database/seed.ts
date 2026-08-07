import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // ========================================================================
    // SEED: System Roles
    // ========================================================================
    const roles = await Promise.all([
      prisma.role.upsert({
        where: { roleName: 'Platform Owner' },
        update: {},
        create: {
          roleName: 'Platform Owner',
          description: 'Full system administration across all leagues',
          isSystemRole: true,
        },
      }),
      prisma.role.upsert({
        where: { roleName: 'League Manager' },
        update: {},
        create: {
          roleName: 'League Manager',
          description: 'Manages one or more leagues',
          isSystemRole: true,
        },
      }),
      prisma.role.upsert({
        where: { roleName: 'Referee Manager' },
        update: {},
        create: {
          roleName: 'Referee Manager',
          description: 'Registers referees and assigns officials to fixtures',
          isSystemRole: true,
        },
      }),
      prisma.role.upsert({
        where: { roleName: 'Team Manager' },
        update: {},
        create: {
          roleName: 'Team Manager',
          description: 'Manages club information, players, and team sheets',
          isSystemRole: true,
        },
      }),
      prisma.role.upsert({
        where: { roleName: 'Referee' },
        update: {},
        create: {
          roleName: 'Referee',
          description: 'Views assigned fixtures and submits match reports',
          isSystemRole: true,
        },
      }),
      prisma.role.upsert({
        where: { roleName: 'Public User' },
        update: {},
        create: {
          roleName: 'Public User',
          description: 'Read-only access to public website',
          isSystemRole: true,
        },
      }),
    ]);

    console.log('✅ Roles seeded:', roles.length);

    // ========================================================================
    // SEED: System Permissions
    // ========================================================================
    const permissions = await Promise.all([
      // User Management
      ...['users.create', 'users.read', 'users.update', 'users.delete'].map(
        (perm) =>
          prisma.permission.upsert({
            where: { permissionName: perm },
            update: {},
            create: {
              permissionName: perm,
              module: 'Users',
              description: `Permission to ${perm}`,
            },
          })
      ),
      // League Management
      ...['leagues.create', 'leagues.approve', 'leagues.publish'].map(
        (perm) =>
          prisma.permission.upsert({
            where: { permissionName: perm },
            update: {},
            create: {
              permissionName: perm,
              module: 'Competitions',
              description: `Permission to ${perm}`,
            },
          })
      ),
      // Club Management
      ...['clubs.create', 'clubs.approve', 'clubs.edit'].map((perm) =>
        prisma.permission.upsert({
          where: { permissionName: perm },
          update: {},
          create: {
            permissionName: perm,
            module: 'Clubs',
            description: `Permission to ${perm}`,
          },
        })
      ),
      // Fixture Management
      ...['fixtures.create', 'fixtures.edit', 'fixtures.publish'].map(
        (perm) =>
          prisma.permission.upsert({
            where: { permissionName: perm },
            update: {},
            create: {
              permissionName: perm,
              module: 'Fixtures',
              description: `Permission to ${perm}`,
            },
          })
      ),
      // Player Management
      ...['players.register', 'players.approve', 'players.edit'].map(
        (perm) =>
          prisma.permission.upsert({
            where: { permissionName: perm },
            update: {},
            create: {
              permissionName: perm,
              module: 'Players',
              description: `Permission to ${perm}`,
            },
          })
      ),
      // Referee Management
      ...['referees.assign', 'referees.evaluate', 'referees.pay'].map(
        (perm) =>
          prisma.permission.upsert({
            where: { permissionName: perm },
            update: {},
            create: {
              permissionName: perm,
              module: 'Referees',
              description: `Permission to ${perm}`,
            },
          })
      ),
      // Match Reports
      ...['reports.submit', 'reports.approve', 'reports.export'].map(
        (perm) =>
          prisma.permission.upsert({
            where: { permissionName: perm },
            update: {},
            create: {
              permissionName: perm,
              module: 'Reports',
              description: `Permission to ${perm}`,
            },
          })
      ),
      // Finance
      ...['finance.approve', 'finance.reconcile', 'finance.export'].map(
        (perm) =>
          prisma.permission.upsert({
            where: { permissionName: perm },
            update: {},
            create: {
              permissionName: perm,
              module: 'Finance',
              description: `Permission to ${perm}`,
            },
          })
      ),
      // System
      ...['system.manage', 'system.configure', 'audit.view'].map((perm) =>
        prisma.permission.upsert({
          where: { permissionName: perm },
          update: {},
          create: {
            permissionName: perm,
            module: 'Administration',
            description: `Permission to ${perm}`,
          },
        })
      ),
    ]);

    console.log('✅ Permissions seeded:', permissions.length);

    // ========================================================================
    // SEED: System Settings
    // ========================================================================
    const settings = await Promise.all([
      prisma.systemSetting.upsert({
        where: { settingKey: 'league_points_win' },
        update: { settingValue: '3' },
        create: {
          settingKey: 'league_points_win',
          settingValue: '3',
          description: 'Points awarded for a win',
        },
      }),
      prisma.systemSetting.upsert({
        where: { settingKey: 'league_points_draw' },
        update: { settingValue: '1' },
        create: {
          settingKey: 'league_points_draw',
          settingValue: '1',
          description: 'Points awarded for a draw',
        },
      }),
      prisma.systemSetting.upsert({
        where: { settingKey: 'league_points_loss' },
        update: { settingValue: '0' },
        create: {
          settingKey: 'league_points_loss',
          settingValue: '0',
          description: 'Points awarded for a loss',
        },
      }),
      prisma.systemSetting.upsert({
        where: { settingKey: 'max_squad_size' },
        update: { settingValue: '23' },
        create: {
          settingKey: 'max_squad_size',
          settingValue: '23',
          description: 'Maximum number of players in squad',
        },
      }),
      prisma.systemSetting.upsert({
        where: { settingKey: 'max_starting_players' },
        update: { settingValue: '11' },
        create: {
          settingKey: 'max_starting_players',
          settingValue: '11',
          description: 'Maximum number of starting players',
        },
      }),
      prisma.systemSetting.upsert({
        where: { settingKey: 'max_bench_players' },
        update: { settingValue: '12' },
        create: {
          settingKey: 'max_bench_players',
          settingValue: '12',
          description: 'Maximum number of bench players',
        },
      }),
      prisma.systemSetting.upsert({
        where: { settingKey: 'default_timezone' },
        update: { settingValue: 'Africa/Nairobi' },
        create: {
          settingKey: 'default_timezone',
          settingValue: 'Africa/Nairobi',
          description: 'Default timezone for the platform',
        },
      }),
      prisma.systemSetting.upsert({
        where: { settingKey: 'currency' },
        update: { settingValue: 'KES' },
        create: {
          settingKey: 'currency',
          settingValue: 'KES',
          description: 'Default currency',
        },
      }),
    ]);

    console.log('✅ System Settings seeded:', settings.length);

    // ========================================================================
    // SEED: Player Positions
    // ========================================================================
    const positions = await Promise.all([
      prisma.playerPosition.upsert({
        where: { positionName: 'Goalkeeper' },
        update: {},
        create: {
          positionName: 'Goalkeeper',
          abbreviation: 'GK',
        },
      }),
      prisma.playerPosition.upsert({
        where: { positionName: 'Right Back' },
        update: {},
        create: {
          positionName: 'Right Back',
          abbreviation: 'RB',
        },
      }),
      prisma.playerPosition.upsert({
        where: { positionName: 'Left Back' },
        update: {},
        create: {
          positionName: 'Left Back',
          abbreviation: 'LB',
        },
      }),
      prisma.playerPosition.upsert({
        where: { positionName: 'Centre Back' },
        update: {},
        create: {
          positionName: 'Centre Back',
          abbreviation: 'CB',
        },
      }),
      prisma.playerPosition.upsert({
        where: { positionName: 'Defensive Midfielder' },
        update: {},
        create: {
          positionName: 'Defensive Midfielder',
          abbreviation: 'DM',
        },
      }),
      prisma.playerPosition.upsert({
        where: { positionName: 'Central Midfielder' },
        update: {},
        create: {
          positionName: 'Central Midfielder',
          abbreviation: 'CM',
        },
      }),
      prisma.playerPosition.upsert({
        where: { positionName: 'Attacking Midfielder' },
        update: {},
        create: {
          positionName: 'Attacking Midfielder',
          abbreviation: 'AM',
        },
      }),
      prisma.playerPosition.upsert({
        where: { positionName: 'Right Winger' },
        update: {},
        create: {
          positionName: 'Right Winger',
          abbreviation: 'RW',
        },
      }),
      prisma.playerPosition.upsert({
        where: { positionName: 'Left Winger' },
        update: {},
        create: {
          positionName: 'Left Winger',
          abbreviation: 'LW',
        },
      }),
      prisma.playerPosition.upsert({
        where: { positionName: 'Striker' },
        update: {},
        create: {
          positionName: 'Striker',
          abbreviation: 'ST',
        },
      }),
    ]);

    console.log('✅ Player Positions seeded:', positions.length);

    // ========================================================================
    // SEED: News Categories
    // ========================================================================
    const newsCategories = await Promise.all([
      prisma.newsCategory.upsert({
        where: { categoryName: 'Match Reports' },
        update: {},
        create: {
          categoryName: 'Match Reports',
          slug: 'match-reports',
        },
      }),
      prisma.newsCategory.upsert({
        where: { categoryName: 'Transfers' },
        update: {},
        create: {
          categoryName: 'Transfers',
          slug: 'transfers',
        },
      }),
      prisma.newsCategory.upsert({
        where: { categoryName: 'League News' },
        update: {},
        create: {
          categoryName: 'League News',
          slug: 'league-news',
        },
      }),
      prisma.newsCategory.upsert({
        where: { categoryName: 'Club News' },
        update: {},
        create: {
          categoryName: 'Club News',
          slug: 'club-news',
        },
      }),
      prisma.newsCategory.upsert({
        where: { categoryName: 'Announcements' },
        update: {},
        create: {
          categoryName: 'Announcements',
          slug: 'announcements',
        },
      }),
    ]);

    console.log('✅ News Categories seeded:', newsCategories.length);

    // ========================================================================
    // SEED: Payment Methods
    // ========================================================================
    const paymentMethods = await Promise.all([
      prisma.paymentMethod.upsert({
        where: { methodName: 'M-Pesa' },
        update: {},
        create: {
          methodName: 'M-Pesa',
          provider: 'Safaricom',
          active: true,
        },
      }),
      prisma.paymentMethod.upsert({
        where: { methodName: 'Airtel Money' },
        update: {},
        create: {
          methodName: 'Airtel Money',
          provider: 'Airtel',
          active: true,
        },
      }),
      prisma.paymentMethod.upsert({
        where: { methodName: 'Bank Transfer' },
        update: {},
        create: {
          methodName: 'Bank Transfer',
          provider: 'Banking System',
          active: true,
        },
      }),
      prisma.paymentMethod.upsert({
        where: { methodName: 'Cash' },
        update: {},
        create: {
          methodName: 'Cash',
          provider: 'Manual',
          active: true,
        },
      }),
    ]);

    console.log('✅ Payment Methods seeded:', paymentMethods.length);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
