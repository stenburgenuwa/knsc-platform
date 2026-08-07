// Team Manager module types and interfaces

export interface TeamManagerDashboard {
  clubId: string;
  clubName: string;
  clubLogo: string;
  league: string;
  season: string;
  registeredPlayers: number;
  pendingRegistrations: number;
  approvedPlayers: number;
  upcomingFixture: FixturePreview | null;
  matchesPlayed: number;
  teamSheetStatus: string;
  clubPosition: number;
  goalsScored: number;
  goalsConceded: number;
  recentActivity: AuditLogEntry[];
  notifications: Notification[];
}

export interface ClubProfile {
  id: string;
  name: string;
  logo: string;
  banner: string;
  colors: { primary: string; secondary: string };
  league: string;
  homeGround: string;
  foundedYear: number;
  motto: string;
  teamManager: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerRegistration {
  id: string;
  clubId: string;
  photo: string;
  fullName: string;
  registrationNumber: string;
  jerseyNumber: number;
  dateOfBirth: Date;
  nationalId: string;
  phoneNumber: string;
  position: PlayerPosition;
  height: number;
  weight: number;
  preferredFoot: 'Left' | 'Right' | 'Both';
  emergencyContact: string;
  medicalNotes?: string;
  status: PlayerStatus;
  approvalStatus: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerProfile {
  id: string;
  clubId: string;
  photo: string;
  fullName: string;
  registrationNumber: string;
  jerseyNumber: number;
  position: PlayerPosition;
  dateOfBirth: Date;
  phoneNumber: string;
  height: number;
  weight: number;
  preferredFoot: 'Left' | 'Right' | 'Both';
  emergencyContact: string;
  approvalStatus: ApprovalStatus;
  season: {
    matchesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    rating: number;
  };
}

export interface TeamSheet {
  id: string;
  clubId: string;
  fixtureId: string;
  startingXI: TeamSheetPlayer[];
  substitutes: TeamSheetPlayer[];
  captain: string;
  status: TeamSheetStatus;
  submittedAt: Date;
  lockedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamSheetPlayer {
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  position: PlayerPosition;
  photo: string;
  isCaptain: boolean;
}

export interface FixturePreview {
  id: string;
  fixtureNumber: string;
  homeTeam: string;
  awayTeam: string;
  date: Date;
  kickoffTime: string;
  venue: string;
  round: number;
  assignedReferee: string;
  status: FixtureStatus;
}

export interface FixtureDetail {
  id: string;
  fixtureNumber: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  kickoffTime: string;
  date: Date;
  round: number;
  assignedReferee: string;
  status: FixtureStatus;
  result?: MatchResult;
}

export interface MatchResult {
  finalScore: string;
  goalscorers: Goalscorer[];
  yellowCards: CardRecord[];
  redCards: CardRecord[];
  substitutions: Substitution[];
  matchReport: string;
  teamStats: TeamStats;
}

export interface Goalscorer {
  playerId: string;
  playerName: string;
  goals: number;
  team: string;
}

export interface CardRecord {
  playerId: string;
  playerName: string;
  team: string;
  minute: number;
}

export interface Substitution {
  playerOffId: string;
  playerOffName: string;
  playerOnId: string;
  playerOnName: string;
  team: string;
  minute: number;
}

export interface TeamStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  averageGoals: number;
  currentForm: string;
}

export interface LeagueTableRow {
  position: number;
  club: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  lastFiveMatches: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  sender: string;
  senderRole: string;
  date: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  attachments?: string[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  relatedResource?: {
    resourceType: string;
    resourceId: string;
  };
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface ReportGenerationRequest {
  reportType: ReportType;
  format: ExportFormat;
  dateRange?: { startDate: Date; endDate: Date };
  filters?: Record<string, any>;
}

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';
export type PlayerStatus = 'Pending Approval' | 'Approved' | 'Rejected' | 'Suspended' | 'Inactive' | 'Transferred' | 'Released';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Correction Requested';
export type TeamSheetStatus = 'Draft' | 'Submitted' | 'Locked' | 'Cancelled';
export type FixtureStatus = 'Scheduled' | 'Live' | 'Completed' | 'Postponed' | 'Cancelled';
export type NotificationType = 'PlayerApproved' | 'PlayerRejected' | 'FixturePublished' | 'FixtureRescheduled' | 'FixtureCancelled' | 'TeamSheetReminder' | 'Announcement' | 'Emergency';
export type ReportType = 'RegisteredPlayers' | 'PendingPlayers' | 'FixtureList' | 'Results' | 'ClubStatistics' | 'PlayerStatistics' | 'TeamSheets';
export type ExportFormat = 'PDF' | 'Excel' | 'CSV' | 'Print';
