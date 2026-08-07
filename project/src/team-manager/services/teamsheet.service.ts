// Team Sheet Management Service
import { TeamSheet, TeamSheetPlayer, TeamSheetStatus } from '../types';
import { TEAM_SHEET_RULES } from '../constants';

export class TeamSheetService {
  async createTeamSheet(clubId: string, fixtureId: string): Promise<TeamSheet> {
    // Create empty team sheet for fixture
    const teamSheet: TeamSheet = {
      id: `TS-${Date.now()}`,
      clubId,
      fixtureId,
      startingXI: [],
      substitutes: [],
      captain: '',
      status: 'Draft',
      submittedAt: new Date(),
      lockedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return teamSheet;
  }

  async updateTeamSheet(
    clubId: string,
    teamSheetId: string,
    startingXI: TeamSheetPlayer[],
    substitutes: TeamSheetPlayer[],
    captain: string,
  ): Promise<TeamSheet> {
    // Validation
    this.validateTeamSheetRules(startingXI, substitutes, captain);

    // Check if team sheet is locked
    const teamSheet = await this.getTeamSheet(clubId, teamSheetId);
    if (!teamSheet) {
      throw new Error('Team sheet not found');
    }

    if (teamSheet.status === 'Locked' || teamSheet.status === 'Submitted') {
      throw new Error('Cannot edit locked or submitted team sheet');
    }

    // Check if fixture time has passed (kickoff time)
    const isLocked = await this.isFixtureLocked(teamSheet.fixtureId);
    if (isLocked) {
      throw new Error('Cannot edit team sheet after kickoff');
    }

    // Validate all players are approved
    await this.validatePlayersApproved(clubId, startingXI, substitutes);

    // Check for suspended players
    await this.validateNoSuspendedPlayers(clubId, startingXI, substitutes);

    const updated: TeamSheet = {
      ...teamSheet,
      startingXI,
      substitutes,
      captain,
      status: 'Draft',
      updatedAt: new Date(),
    };

    return updated;
  }

  async submitTeamSheet(clubId: string, teamSheetId: string): Promise<TeamSheet> {
    const teamSheet = await this.getTeamSheet(clubId, teamSheetId);
    if (!teamSheet) {
      throw new Error('Team sheet not found');
    }

    // Validate team sheet has players
    if (teamSheet.startingXI.length !== TEAM_SHEET_RULES.STARTING_XI_COUNT) {
      throw new Error(`Team sheet must have exactly ${TEAM_SHEET_RULES.STARTING_XI_COUNT} starting players`);
    }

    if (teamSheet.substitutes.length !== TEAM_SHEET_RULES.SUBSTITUTES_COUNT) {
      throw new Error(`Team sheet must have exactly ${TEAM_SHEET_RULES.SUBSTITUTES_COUNT} substitutes`);
    }

    if (!teamSheet.captain) {
      throw new Error('Captain must be assigned');
    }

    // Check fixture not locked
    const isLocked = await this.isFixtureLocked(teamSheet.fixtureId);
    if (isLocked) {
      throw new Error('Cannot submit team sheet after kickoff');
    }

    const updated: TeamSheet = {
      ...teamSheet,
      status: 'Submitted',
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    // Notify assigned referee that team sheet is ready
    await this.notifyReferee(teamSheet.fixtureId);

    return updated;
  }

  async getTeamSheet(clubId: string, teamSheetId: string): Promise<TeamSheet | null> {
    // Fetch from database with club isolation
    return null;
  }

  async getTeamSheetByFixture(clubId: string, fixtureId: string): Promise<TeamSheet | null> {
    // Fetch team sheet for specific fixture
    return null;
  }

  async lockTeamSheetAtKickoff(fixtureId: string): Promise<void> {
    // Called automatically when fixture reaches kickoff time
    // Update all team sheets for fixture to Locked status
  }

  async getTeamSheetsForRefereeDashboard(refereeId: string): Promise<TeamSheet[]> {
    // Get team sheets from assigned fixtures for referee dashboard
    return [];
  }

  private validateTeamSheetRules(
    startingXI: TeamSheetPlayer[],
    substitutes: TeamSheetPlayer[],
    captain: string,
  ): void {
    if (startingXI.length !== TEAM_SHEET_RULES.STARTING_XI_COUNT) {
      throw new Error(`Must have exactly ${TEAM_SHEET_RULES.STARTING_XI_COUNT} starting players`);
    }

    if (substitutes.length !== TEAM_SHEET_RULES.SUBSTITUTES_COUNT) {
      throw new Error(`Must have exactly ${TEAM_SHEET_RULES.SUBSTITUTES_COUNT} substitutes`);
    }

    const allPlayers = [...startingXI, ...substitutes];
    const playerIds = allPlayers.map((p) => p.playerId);
    const uniqueIds = new Set(playerIds);

    if (uniqueIds.size !== playerIds.length) {
      throw new Error('Cannot have duplicate players in team sheet');
    }

    if (!captain) {
      throw new Error('Captain must be assigned');
    }

    const captainExists = allPlayers.some((p) => p.playerId === captain);
    if (!captainExists) {
      throw new Error('Captain must be in the team sheet');
    }
  }

  private async validatePlayersApproved(
    clubId: string,
    startingXI: TeamSheetPlayer[],
    substitutes: TeamSheetPlayer[],
  ): Promise<void> {
    const allPlayers = [...startingXI, ...substitutes];
    for (const player of allPlayers) {
      const playerRecord = await this.getPlayerApprovalStatus(clubId, player.playerId);
      if (playerRecord?.approvalStatus !== 'Approved') {
        throw new Error(`Player ${player.playerName} is not approved for competition`);
      }
    }
  }

  private async validateNoSuspendedPlayers(
    clubId: string,
    startingXI: TeamSheetPlayer[],
    substitutes: TeamSheetPlayer[],
  ): Promise<void> {
    const allPlayers = [...startingXI, ...substitutes];
    for (const player of allPlayers) {
      const playerRecord = await this.getPlayerStatus(clubId, player.playerId);
      if (playerRecord?.status === 'Suspended') {
        throw new Error(`Player ${player.playerName} is suspended`);
      }
    }
  }

  private async isFixtureLocked(fixtureId: string): Promise<boolean> {
    // Check if fixture kickoff time has passed
    return false;
  }

  private async getPlayerApprovalStatus(clubId: string, playerId: string): Promise<any> {
    // Get player approval status
    return null;
  }

  private async getPlayerStatus(clubId: string, playerId: string): Promise<any> {
    // Get player current status
    return null;
  }

  private async notifyReferee(fixtureId: string): Promise<void> {
    // Send notification to assigned referee about team sheet submission
  }
}
