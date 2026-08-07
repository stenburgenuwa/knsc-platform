// Referee Manager Module Types
export interface RefereeDashboard {
  league: LeagueInfo;
  summary: RefereeDashboardSummary;
  recentActivity: ActivityLog[];
  unassignedFixtures: FixtureSummary[];
  upcomingMatches: UpcomingMatch[];
  pendingReports: PendingReportSummary;
}

export interface LeagueInfo {
  id: string;
  name: string;
  logo?: string;
  season: string;
  currentRound: number;
}

export interface RefereeDashboardSummary {
  totalReferees: number;
  activeReferees: number;
  suspendedReferees: number;
  fixturesAwaitingAssignment: number;
  fixturesAssigned: number;
  reportsAwaitingReview: number;
  reportsSubmittedToday: number;
  upcomingMatches: number;
  smsNotificationsSent: number;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
}

export interface FixtureSummary {
  id: string;
  matchNumber: string;
  homeClub: string;
  awayClub: string;
  kickoffTime: Date;
  venue: string;
  round: number;
  status: string;
}

export interface UpcomingMatch {
  id: string;
  matchNumber: string;
  homeClub: string;
  awayClub: string;
  kickoffTime: Date;
  assignedReferee?: string;
  status: string;
}

export interface PendingReportSummary {
  awaiting: number;
  submittedToday: number;
  late: number;
}

export interface RefereeRegistration {
  id: string;
  refereeNumber: string;
  fullName: string;
  nationalId: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  county: string;
  homeTown: string;
  physicalAddress: string;
  category: string;
  yearsOfExperience: number;
  preferredLanguage: string;
  emergencyContact: string;
  username: string;
  password: string;
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  photoPath?: string;
  createdDate: Date;
  lastLogin?: Date;
}

export interface RefereeProfile {
  id: string;
  refereeNumber: string;
  fullName: string;
  category: string;
  phone: string;
  email: string;
  county: string;
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  yearsOfExperience: number;
  matchesOfficiated: number;
  yellowCardsIssued: number;
  redCardsIssued: number;
  averageRating: number;
  lastAssignment?: Date;
  upcomingAssignments: Assignment[];
  photoPath?: string;
}

export interface Assignment {
  id: string;
  refereeId: string;
  fixtureId: string;
  matchNumber: string;
  homeClub: string;
  awayClub: string;
  kickoffTime: Date;
  venue: string;
  assignedDate: Date;
  status: 'assigned' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  homeTeamSheet?: TeamSheet;
  awayTeamSheet?: TeamSheet;
  matchReport?: MatchReport;
}

export interface TeamSheet {
  club: string;
  formation: string;
  startingXI: Player[];
  substitutes: Player[];
  coach: string;
  manager: string;
  captain: string;
}

export interface Player {
  name: string;
  registrationNumber: string;
  shirtNumber: number;
  position: string;
  photoPath?: string;
}

export interface MatchReport {
  id: string;
  assignmentId: string;
  fixtureId: string;
  homeScore: number;
  awayScore: number;
  goalscorers: Goalscorer[];
  yellowCards: CardIssuance[];
  redCards: CardIssuance[];
  substitutions: SubstitutionRecord[];
  matchComments: string;
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected';
  submittedDate: Date;
  timeStarted?: string;
  timeEnded?: string;
  abandonedReason?: string;
}

export interface Goalscorer {
  player: string;
  club: string;
  minute: number;
  assistBy?: string;
}

export interface CardIssuance {
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

export interface RefereeAvailability {
  refereeId: string;
  status: 'available' | 'unavailable' | 'on_leave' | 'injured';
  updatedDate: Date;
  notes?: string;
}

export interface RefereePerformance {
  refereeId: string;
  matchesOfficiated: number;
  reportsSubmitted: number;
  lateReports: number;
  averageRating: number;
  disciplinaryCases: number;
  appointmentsThisSeason: number;
  completedMatches: number;
  cancelledMatches: number;
  observerScores?: number[];
}

export interface RefereeReport {
  id: string;
  type: 'referee_list' | 'assignment' | 'availability' | 'performance' | 'match_summary' | 'late_submission' | 'inactive_referees';
  generatedDate: Date;
  generatedBy: string;
  data: Record<string, unknown>;
  format: 'pdf' | 'excel' | 'csv';
}

export interface SmsNotification {
  id: string;
  refereeId: string;
  phone: string;
  assignmentId: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentDate?: Date;
  failureReason?: string;
  retryCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
