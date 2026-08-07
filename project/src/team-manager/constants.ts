// Team Manager module constants and enums

export const TEAM_MANAGER_PERMISSIONS = {
  'players:register': 'Register new player',
  'players:edit': 'Edit player information',
  'players:view': 'View player profiles',
  'players:delete': 'Delete player registration',
  'teamsheets:create': 'Create team sheet',
  'teamsheets:edit': 'Edit team sheet',
  'teamsheets:submit': 'Submit team sheet',
  'teamsheets:view': 'View team sheets',
  'fixtures:view': 'View fixtures',
  'fixtures:download': 'Download fixture list',
  'results:view': 'View match results',
  'standings:view': 'View league standings',
  'statistics:view': 'View club statistics',
  'announcements:view': 'View announcements',
  'reports:generate': 'Generate reports',
  'reports:export': 'Export reports',
  'profile:edit': 'Edit club profile',
  'profile:view': 'View club profile',
} as const;

export const PLAYER_POSITIONS = ['GK', 'DF', 'MF', 'FW'] as const;

export const PLAYER_STATUSES = [
  'Pending Approval',
  'Approved',
  'Rejected',
  'Suspended',
  'Inactive',
  'Transferred',
  'Released',
] as const;

export const APPROVAL_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Correction Requested',
] as const;

export const FIXTURE_STATUSES = [
  'Scheduled',
  'Live',
  'Completed',
  'Postponed',
  'Cancelled',
] as const;

export const NOTIFICATION_TYPES = [
  'PlayerApproved',
  'PlayerRejected',
  'FixturePublished',
  'FixtureRescheduled',
  'FixtureCancelled',
  'TeamSheetReminder',
  'Announcement',
  'Emergency',
] as const;

export const REPORT_TYPES = [
  'RegisteredPlayers',
  'PendingPlayers',
  'FixtureList',
  'Results',
  'ClubStatistics',
  'PlayerStatistics',
  'TeamSheets',
] as const;

export const EXPORT_FORMATS = ['PDF', 'Excel', 'CSV', 'Print'] as const;

export const TEAM_SHEET_RULES = {
  STARTING_XI_COUNT: 11,
  SUBSTITUTES_COUNT: 7,
  TOTAL_PLAYERS: 18,
  MIN_PLAYERS: 7, // Minimum to field a team
} as const;

export const PAGINATION_DEFAULTS = {
  PLAYERS_PER_PAGE: 20,
  FIXTURES_PER_PAGE: 20,
  RESULTS_PER_PAGE: 20,
  ANNOUNCEMENTS_PER_PAGE: 20,
} as const;

export const VALIDATION_RULES = {
  REGISTRATION_NUMBER_LENGTH: 8,
  JERSEY_NUMBER_MIN: 1,
  JERSEY_NUMBER_MAX: 99,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  MIN_PLAYER_AGE: 16,
  MAX_PLAYER_AGE: 45,
  PHONE_LENGTH: 12, // Kenya format: 254xxxxxxxxx
} as const;
