// Referee Manager Module Constants

export const REFEREE_MANAGER_PERMISSIONS = {
  VIEW_REFEREES: 'referees:view',
  REGISTER_REFEREE: 'referees:register',
  EDIT_REFEREE: 'referees:edit',
  SUSPEND_REFEREE: 'referees:suspend',
  ACTIVATE_REFEREE: 'referees:activate',
  ARCHIVE_REFEREE: 'referees:archive',
  RESET_PASSWORD: 'referees:reset_password',
  ASSIGN_REFEREE: 'assignments:create',
  VIEW_ASSIGNMENTS: 'assignments:view',
  UPDATE_ASSIGNMENTS: 'assignments:update',
  CANCEL_ASSIGNMENTS: 'assignments:cancel',
  VIEW_MATCH_REPORTS: 'match_reports:view',
  REVIEW_MATCH_REPORTS: 'match_reports:review',
  VIEW_PERFORMANCE: 'performance:view',
  MANAGE_AVAILABILITY: 'availability:manage',
  VIEW_AUDIT_LOGS: 'audit:view',
  GENERATE_REPORTS: 'reports:generate',
};

export const REFEREE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
};

export const ASSIGNMENT_STATUS = {
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  ON_LEAVE: 'on_leave',
  INJURED: 'injured',
};

export const MATCH_REPORT_STATUS = {
  SUBMITTED: 'submitted',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const SMS_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
};

export const REPORT_TYPES = {
  REFEREE_LIST: 'referee_list',
  ASSIGNMENT: 'assignment',
  AVAILABILITY: 'availability',
  PERFORMANCE: 'performance',
  MATCH_SUMMARY: 'match_summary',
  LATE_SUBMISSION: 'late_submission',
  INACTIVE_REFEREES: 'inactive_referees',
};

export const REPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
};

export const SMS_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
  TIMEOUT_MS: 30000,
};

export const VALIDATION_RULES = {
  MAX_PHONE_LENGTH: 15,
  MAX_NAME_LENGTH: 100,
  MIN_EXPERIENCE: 0,
  MAX_EXPERIENCE: 70,
  MIN_AGE: 21,
};

export const AUDIT_ACTION_TYPES = {
  REFEREE_CREATED: 'referee_created',
  REFEREE_UPDATED: 'referee_updated',
  REFEREE_SUSPENDED: 'referee_suspended',
  REFEREE_ACTIVATED: 'referee_activated',
  REFEREE_ARCHIVED: 'referee_archived',
  PASSWORD_RESET: 'password_reset',
  ASSIGNMENT_CREATED: 'assignment_created',
  ASSIGNMENT_UPDATED: 'assignment_updated',
  ASSIGNMENT_CANCELLED: 'assignment_cancelled',
  SMS_SENT: 'sms_sent',
  SMS_FAILED: 'sms_failed',
  MATCH_REPORT_SUBMITTED: 'match_report_submitted',
  MATCH_REPORT_APPROVED: 'match_report_approved',
  MATCH_REPORT_REJECTED: 'match_report_rejected',
};

export const DASHBOARD_CARDS = [
  { key: 'totalReferees', label: 'Total Referees' },
  { key: 'activeReferees', label: 'Active Referees' },
  { key: 'suspendedReferees', label: 'Suspended Referees' },
  { key: 'fixturesAwaitingAssignment', label: 'Fixtures Awaiting Assignment' },
  { key: 'fixturesAssigned', label: 'Fixtures Assigned' },
  { key: 'reportsAwaitingReview', label: 'Reports Awaiting Review' },
  { key: 'reportsSubmittedToday', label: 'Reports Submitted Today' },
  { key: 'upcomingMatches', label: 'Upcoming Matches' },
  { key: 'smsNotificationsSent', label: 'SMS Notifications Sent' },
];
