// League Manager Module Constants

export const LEAGUE_MANAGER_PERMISSIONS = {
  VIEW_LEAGUE: 'league:view',
  VIEW_CLUBS: 'clubs:view',
  VIEW_PLAYERS: 'players:view',
  APPROVE_PLAYER_REGISTRATION: 'players:approve_registration',
  MANAGE_FIXTURES: 'fixtures:manage',
  EDIT_FIXTURES: 'fixtures:edit',
  RESCHEDULE_FIXTURES: 'fixtures:reschedule',
  CANCEL_FIXTURES: 'fixtures:cancel',
  PUBLISH_FIXTURES: 'fixtures:publish',
  ARCHIVE_FIXTURES: 'fixtures:archive',
  REVIEW_MATCH_REPORTS: 'match_reports:review',
  MANAGE_STANDINGS: 'standings:manage',
  RECALCULATE_TABLE: 'standings:recalculate',
  PUBLISH_STANDINGS: 'standings:publish',
  MANAGE_DISCIPLINARY: 'disciplinary:manage',
  PUBLISH_ANNOUNCEMENTS: 'announcements:publish',
  GENERATE_REPORTS: 'reports:generate',
  VIEW_AUDIT_LOGS: 'audit:view',
  VIEW_REPORTS: 'reports:view',
};

export const PLAYER_APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CHANGES_REQUESTED: 'changes_requested',
};

export const FIXTURE_STATUS = {
  SCHEDULED: 'scheduled',
  POSTPONED: 'postponed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const MATCH_REPORT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RETURNED_FOR_CORRECTION: 'returned_for_correction',
};

export const DISCIPLINARY_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  DECIDED: 'decided',
  APPEALED: 'appealed',
  CLOSED: 'closed',
};

export const ANNOUNCEMENT_TYPES = {
  NOTICE: 'notice',
  FIXTURE_CHANGE: 'fixture_change',
  WEATHER_UPDATE: 'weather_update',
  RULE: 'rule',
  MEETING: 'meeting',
  EMERGENCY: 'emergency',
};

export const ANNOUNCEMENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const DELIVERY_CHANNELS = {
  WEBSITE: 'website',
  DASHBOARD: 'dashboard',
  SMS: 'sms',
  EMAIL: 'email',
  PUSH: 'push',
};

export const REPORT_TYPES = {
  LEAGUE_SUMMARY: 'league_summary',
  FIXTURE: 'fixture',
  RESULTS: 'results',
  STANDINGS: 'standings',
  TOP_SCORERS: 'top_scorers',
  BEST_DEFENCE: 'best_defence',
  FAIR_PLAY: 'fair_play',
  DISCIPLINARY: 'disciplinary',
  CLUB_PERFORMANCE: 'club_performance',
  PLAYER_REGISTRATION: 'player_registration',
  ATTENDANCE: 'attendance',
  REFEREE_PERFORMANCE: 'referee_performance',
};

export const REPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
};

export const VALIDATION_RULES = {
  MAX_FIXTURE_NAME_LENGTH: 255,
  MAX_ANNOUNCEMENT_TITLE_LENGTH: 255,
  MAX_ANNOUNCEMENT_CONTENT_LENGTH: 5000,
  MAX_MATCH_COMMENTS_LENGTH: 2000,
  MIN_FIXTURE_FUTURE_DAYS: 1,
  MAX_FIXTURE_FUTURE_DAYS: 365,
};

export const AUDIT_ACTION_TYPES = {
  FIXTURE_CREATED: 'fixture_created',
  FIXTURE_UPDATED: 'fixture_updated',
  FIXTURE_CANCELLED: 'fixture_cancelled',
  FIXTURE_RESCHEDULED: 'fixture_rescheduled',
  FIXTURE_PUBLISHED: 'fixture_published',
  PLAYER_APPROVED: 'player_approved',
  PLAYER_REJECTED: 'player_rejected',
  PLAYER_CHANGES_REQUESTED: 'player_changes_requested',
  MATCH_REPORT_APPROVED: 'match_report_approved',
  MATCH_REPORT_REJECTED: 'match_report_rejected',
  STANDINGS_PUBLISHED: 'standings_published',
  DISCIPLINARY_CASE_CREATED: 'disciplinary_case_created',
  DISCIPLINARY_DECISION_MADE: 'disciplinary_decision_made',
  ANNOUNCEMENT_PUBLISHED: 'announcement_published',
  REPORT_GENERATED: 'report_generated',
};

export const DASHBOARD_CARDS = [
  { key: 'totalClubs', label: 'Total Clubs' },
  { key: 'totalPlayers', label: 'Total Players' },
  { key: 'upcomingFixtures', label: 'Upcoming Fixtures' },
  { key: 'fixturesThisWeek', label: 'Fixtures This Week' },
  { key: 'matchesPlayed', label: 'Matches Played' },
  { key: 'pendingPlayerApprovals', label: 'Pending Player Approvals' },
  { key: 'pendingMatchReports', label: 'Pending Match Reports' },
  { key: 'activeReferees', label: 'Active Referees' },
  { key: 'disciplinaryCases', label: 'Disciplinary Cases' },
];
