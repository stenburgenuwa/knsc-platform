// Referee module types and interfaces

export interface RefereeDashboard {
  refereeId: string;
  refereeName: string;
  refereeNumber: string;
  upcomingAssignments: number;
  todayMatches: number;
  completedMatches: number;
  pendingReports: number;
  reportsSubmitted: number;
  averageSubmissionTime: string;
  unreadNotifications: number;
  nextAssignment: FixtureAssignment | null;
  recentActivity: AuditLogEntry[];
  notifications: Notification[];
}

export interface FixtureAssignment {
  id: string;
  fixtureNumber: string;
  league: string;
  round: number;
  homeClub: string;
  awayClub: string;
  venue: string;
  kickoffTime: string;
  date: Date;
  status: AssignmentStatus;
  teamSheetsReady: boolean;
}

export interface AssignedFixture {
  id: string;
  fixtureNumber: string;
  league: string;
  round: number;
  homeClub: string;
  awayClub: string;
  venue: string;
  kickoffTime: string;
  date: Date;
  status: FixtureStatus;
  homeTeamSheet: TeamSheetView | null;
  awayTeamSheet: TeamSheetView | null;
}

export interface TeamSheetView {
  clubId: string;
  clubName: string;
  clubLogo: string;
  startingXI: PlayerInSheet[];
  substitutes: PlayerInSheet[];
  captain: PlayerInSheet;
  coach: string;
  teamManager: string;
}

export interface PlayerInSheet {
  playerId: string;
  name: string;
  jerseyNumber: number;
  position: string;
  photo: string;
}

export interface MatchReport {
  id: string;
  refereeId: string;
  fixtureId: string;
  fixtureNumber: string;
  competition: string;
  venue: string;
  kickoffTime: string;
  endTime: string;
  finalScore: string;
  winningTeam: string;
  status: MatchStatus;
  goals: Goal[];
  yellowCards: Card[];
  redCards: Card[];
  substitutions: Substitution[];
  comments: string;
  submittedAt: Date;
  submittedBy: string;
  locked: boolean;
}

export interface Goal {
  id: string;
  goalScorer: string;
  club: string;
  minute: number;
  ownGoal: boolean;
  penalty: boolean;
  assist?: string;
}

export interface Card {
  id: string;
  playerId: string;
  playerName: string;
  club: string;
  minute: number;
  reason: string;
  secondYellow?: boolean;
}

export interface Substitution {
  id: string;
  playerOut: string;
  playerIn: string;
  club: string;
  minute: number;
}

export interface RefereeProfile {
  id: string;
  name: string;
  number: string;
  photo: string;
  phone: string;
  email: string;
  county: string;
  category: string;
  experience: number;
  status: RefereeStatus;
  statistics: RefereeStatistics;
}

export interface RefereeStatistics {
  matchesOfficiated: number;
  reportsSubmitted: number;
  yellowCardsIssued: number;
  redCardsIssued: number;
  lateReports: number;
  upcomingAssignments: number;
}

export interface RefereeAvailability {
  refereeId: string;
  status: AvailabilityStatus;
  lastUpdated: Date;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  relatedFixture?: string;
}

export interface AuditLogEntry {
  id: string;
  refereeId: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
}

export type AssignmentStatus = 'Upcoming' | 'Today' | 'Completed' | 'Cancelled' | 'Postponed';
export type FixtureStatus = 'Scheduled' | 'Live' | 'Completed' | 'Postponed' | 'Cancelled';
export type MatchStatus = 'Completed' | 'Abandoned' | 'Postponed' | 'Suspended' | 'Walkover';
export type RefereeStatus = 'Active' | 'Inactive' | 'Suspended' | 'On Leave';
export type AvailabilityStatus = 'Available' | 'Unavailable' | 'On Leave' | 'Injured' | 'Busy';
export type NotificationType = 'NewAssignment' | 'FixtureRescheduled' | 'FixtureCancelled' | 'MatchReminder' | 'ReportReminder' | 'Announcement' | 'Emergency';
