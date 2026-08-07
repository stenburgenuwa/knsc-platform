// Referee module constants

export const REFEREE_PERMISSIONS = {
  'fixtures:view': 'View assigned fixtures',
  'teamsheets:view': 'View team sheets',
  'reports:submit': 'Submit match reports',
  'reports:view': 'View own reports',
  'availability:manage': 'Manage availability',
  'profile:edit': 'Edit profile',
  'announcements:view': 'View announcements',
} as const;

export const FIXTURE_STATUSES = ['Scheduled', 'Live', 'Completed', 'Postponed', 'Cancelled'] as const;
export const MATCH_STATUSES = ['Completed', 'Abandoned', 'Postponed', 'Suspended', 'Walkover'] as const;
export const AVAILABILITY_STATUSES = ['Available', 'Unavailable', 'On Leave', 'Injured', 'Busy'] as const;
export const NOTIFICATION_TYPES = ['NewAssignment', 'FixtureRescheduled', 'FixtureCancelled', 'MatchReminder', 'ReportReminder', 'Announcement', 'Emergency'] as const;

export const PAGINATION_DEFAULTS = {
  FIXTURES_PER_PAGE: 20,
  REPORTS_PER_PAGE: 20,
  NOTIFICATIONS_PER_PAGE: 20,
} as const;

export const TEAM_SHEET_DISPLAY_MINUTES = 60; // Display team sheets 60 minutes before kickoff

export const REPORT_SUBMISSION_RULES = {
  REQUIRE_FINAL_SCORE: true,
  REQUIRE_MATCH_STATUS: true,
  PREVENT_DUPLICATE_SUBMISSION: true,
  LOCK_AFTER_SUBMISSION: true,
} as const;
