// Platform Owner Module - Types and Interfaces

export interface PlatformOwnerDashboard {
  totalLeagues: number;
  totalClubs: number;
  totalPlayers: number;
  totalTeamManagers: number;
  totalLeagueManagers: number;
  totalRefereeManagers: number;
  totalReferees: number;
  fixturesThisWeek: number;
  completedFixtures: number;
  pendingPlayerApprovals: number;
  pendingClubApprovals: number;
  unreadNotifications: number;
}

export interface LeagueCreateInput {
  leagueName: string;
  seasonId: string;
  countyId: string;
  competitionType: string;
  description?: string;
  logoUrl?: string;
  startDate: Date;
  endDate: Date;
  pointsWin?: number;
  pointsDraw?: number;
  pointsLoss?: number;
}

export interface LeagueUpdateInput {
  leagueName?: string;
  description?: string;
  logoUrl?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ClubCreateInput {
  clubName: string;
  leagueId: string;
  countyId: string;
  shortName?: string;
  registrationNumber?: string;
  yearFounded?: number;
  clubType: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
}

export interface ClubBrandingInput {
  clubId: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  xAccount?: string;
  youtube?: string;
  slogan?: string;
}

export interface TeamManagerCreateInput {
  userId: string;
  clubId: string;
  appointmentDate: Date;
}

export interface LeagueManagerCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  leagueId: string;
}

export interface RefereeManagerCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  leagueId?: string;
}

export interface PlayerApprovalInput {
  playerRegistrationId: string;
  approvalStatus: 'Approved' | 'Rejected' | 'PendingChanges';
  comments?: string;
}

export interface FixtureCreateInput {
  leagueId: string;
  seasonId: string;
  homeClubId: string;
  awayClubId: string;
  venueId: string;
  fixtureDate: Date;
  kickoffTime: string;
  matchday?: number;
}

export interface ReportGenerateInput {
  reportType: string;
  filters?: Record<string, any>;
  exportFormat: 'pdf' | 'excel' | 'csv';
}

export interface AuditLogFilter {
  userId?: string;
  module?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface DashboardStatistics {
  timestamp: Date;
  leagueCount: number;
  clubCount: number;
  playerCount: number;
  fixtureCount: number;
  matchReportCount: number;
}
