// League Manager Module Types
// Defines all types and interfaces for league management operations

export interface LeagueManagerDashboard {
  league: LeagueInfo;
  summary: DashboardSummary;
  recentActivity: ActivityLog[];
  upcomingFixtures: FixturePreview[];
  pendingApprovals: PendingApprovalsSummary;
}

export interface LeagueInfo {
  id: string;
  name: string;
  logo?: string;
  competitionType: string;
  season: string;
  county: string;
  currentRound: number;
  status: 'active' | 'inactive' | 'archived';
  startDate: Date;
  endDate: Date;
}

export interface DashboardSummary {
  totalClubs: number;
  totalPlayers: number;
  upcomingFixtures: number;
  fixturesThisWeek: number;
  matchesPlayed: number;
  pendingPlayerApprovals: number;
  pendingMatchReports: number;
  activeReferees: number;
  leagueTablePublishedDate?: Date;
  disciplinaryCases: number;
}

export interface PendingApprovalsSummary {
  playerRegistrations: number;
  matchReports: number;
  fixtureChanges: number;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  details: string;
}

export interface FixturePreview {
  id: string;
  homeClub: string;
  awayClub: string;
  kickoffTime: Date;
  venue: string;
  status: string;
  round: number;
}

export interface PlayerApprovalRequest {
  id: string;
  playerId: string;
  playerName: string;
  club: string;
  position: string;
  dateOfBirth: Date;
  registrationNumber: string;
  photo?: string;
  nationalIdPath?: string;
  birthCertificatePath?: string;
  emergencyContact: string;
  phone: string;
  preferredFoot: 'left' | 'right' | 'both';
  height?: number;
  weight?: number;
  submittedDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  approvalHistory: ApprovalHistoryEntry[];
}

export interface ApprovalHistoryEntry {
  date: Date;
  action: 'submitted' | 'approved' | 'rejected' | 'changes_requested';
  reviewedBy?: string;
  notes?: string;
}

export interface FixtureEditRequest {
  id: string;
  homeClubId: string;
  awayClubId: string;
  venue: string;
  kickoffTime: Date;
  round: number;
  status: 'scheduled' | 'postponed' | 'cancelled' | 'completed';
  assignedRefereeId?: string;
  matchNumber: string;
}

export interface MatchReportReview {
  id: string;
  matchId: string;
  fixtureDetails: FixturePreview;
  homeScore: number;
  awayScore: number;
  goals: GoalRecord[];
  yellowCards: CardRecord[];
  redCards: CardRecord[];
  substitutions: SubstitutionRecord[];
  matchComments: string;
  refereeNotes: string;
  teamSheets: TeamSheet[];
  submittedDate: Date;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned_for_correction';
  reviewNotes?: string;
}

export interface GoalRecord {
  player: string;
  club: string;
  minute: number;
  assistBy?: string;
}

export interface CardRecord {
  player: string;
  club: string;
  minute: number;
  reason: string;
}

export interface SubstitutionRecord {
  minute: number;
  playerOut: string;
  playerIn: string;
  club: string;
}

export interface TeamSheet {
  club: string;
  formation: string;
  startingLineup: PlayerLineup[];
  substitutes: PlayerLineup[];
}

export interface PlayerLineup {
  name: string;
  shirtNumber: number;
  position: string;
}

export interface StandingsEntry {
  position: number;
  club: string;
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string;
}

export interface DisciplinaryCase {
  id: string;
  caseNumber: string;
  competition: string;
  playerOrClub: string;
  caseType: 'player' | 'club' | 'official';
  reason: string;
  evidence?: string;
  decision?: string;
  decisionDate?: Date;
  status: 'open' | 'under_review' | 'decided' | 'appealed' | 'closed';
  createdDate: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'notice' | 'fixture_change' | 'weather_update' | 'rule' | 'meeting' | 'emergency';
  deliveryChannels: ('website' | 'dashboard' | 'sms' | 'email' | 'push')[];
  targetAudience: 'all' | 'clubs' | 'team_managers' | 'referees';
  publishedDate: Date;
  expiryDate?: Date;
  status: 'draft' | 'published' | 'archived';
}

export interface LeagueReport {
  id: string;
  title: string;
  type: 'league_summary' | 'fixture' | 'results' | 'standings' | 'top_scorers' | 'best_defence' | 'fair_play' | 'disciplinary' | 'club_performance' | 'player_registration' | 'attendance' | 'referee_performance';
  generatedDate: Date;
  generatedBy: string;
  data: Record<string, unknown>;
  format: 'pdf' | 'excel' | 'csv';
}

export interface LeagueManagerPermissions {
  canViewLeague: boolean;
  canViewClubs: boolean;
  canViewPlayers: boolean;
  canApprovePlayerRegistrations: boolean;
  canManageFixtures: boolean;
  canEditFixtures: boolean;
  canRescheduleFixtures: boolean;
  canCancelFixtures: boolean;
  canPublishFixtures: boolean;
  canArchiveFixtures: boolean;
  canReviewMatchReports: boolean;
  canManageStandings: boolean;
  canRecalculateTable: boolean;
  canPublishStandings: boolean;
  canManageDisciplinary: boolean;
  canPublishAnnouncements: boolean;
  canGenerateReports: boolean;
  canViewAuditLogs: boolean;
  canViewReports: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
  timestamp: Date;
}
