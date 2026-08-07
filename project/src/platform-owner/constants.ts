// Platform Owner Constants

export const PLATFORM_OWNER_CONSTANTS = {
  ROLE_NAME: 'Platform Owner',
  DASHBOARD_ROUTE: '/dashboard/platform-owner',
  
  // Default values
  DEFAULT_POINTS_WIN: 3,
  DEFAULT_POINTS_DRAW: 1,
  DEFAULT_POINTS_LOSS: 0,
  
  // Status values
  LEAGUE_STATUS: {
    DRAFT: 'Draft',
    ACTIVE: 'Active',
    ARCHIVED: 'Archived',
    COMPLETED: 'Completed',
  },
  
  CLUB_STATUS: {
    DRAFT: 'Draft',
    ACTIVE: 'Active',
    ARCHIVED: 'Archived',
    SUSPENDED: 'Suspended',
  },
  
  PLAYER_APPROVAL_STATUS: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PENDING_CHANGES: 'PendingChanges',
  },
  
  FIXTURE_STATUS: {
    DRAFT: 'Draft',
    SCHEDULED: 'Scheduled',
    POSTPONED: 'Postponed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },
  
  // Error messages
  UNAUTHORIZED: 'Only Platform Owner can perform this action',
  LEAGUE_EXISTS: 'League with this name already exists',
  CLUB_EXISTS: 'Club with this name already exists',
  DUPLICATE_USERNAME: 'Username already exists',
  INVALID_DATE: 'Invalid date provided',
  MISSING_REQUIRED_FIELD: 'Missing required field',
  
  // Validation rules
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_LEAGUE_NAME_LENGTH: 3,
  MAX_LEAGUE_NAME_LENGTH: 100,
  MIN_CLUB_NAME_LENGTH: 3,
  MAX_CLUB_NAME_LENGTH: 100,
};

export const PLATFORM_OWNER_PERMISSIONS = [
  'league:create',
  'league:edit',
  'league:delete',
  'league:manage',
  'club:create',
  'club:edit',
  'club:delete',
  'club:manage',
  'user:create',
  'user:edit',
  'user:delete',
  'user:lock',
  'user:unlock',
  'player:approve',
  'fixture:create',
  'fixture:edit',
  'fixture:delete',
  'system:admin',
  'system:settings',
  'system:audit',
];

export const AUDIT_ACTIONS = {
  LEAGUE_CREATED: 'league_created',
  LEAGUE_UPDATED: 'league_updated',
  LEAGUE_DELETED: 'league_deleted',
  CLUB_CREATED: 'club_created',
  CLUB_UPDATED: 'club_updated',
  CLUB_DELETED: 'club_deleted',
  TEAM_MANAGER_CREATED: 'team_manager_created',
  LEAGUE_MANAGER_CREATED: 'league_manager_created',
  REFEREE_MANAGER_CREATED: 'referee_manager_created',
  PLAYER_APPROVED: 'player_approved',
  PLAYER_REJECTED: 'player_rejected',
  FIXTURE_CREATED: 'fixture_created',
  FIXTURE_UPDATED: 'fixture_updated',
  FIXTURE_DELETED: 'fixture_deleted',
  SETTINGS_UPDATED: 'settings_updated',
};
