// Match Report Service - Match event recording and submission
import { MatchReport, Goal, Card, Substitution, MatchStatus } from '../types';

export class MatchReportService {
  async startMatchReport(refereeId: string, fixtureId: string): Promise<MatchReport> {
    // Verify referee is assigned to fixture
    const isAssigned = await this.verifyAssignment(refereeId, fixtureId);
    if (!isAssigned) {
      throw new Error('Referee not assigned to this fixture');
    }

    // Get fixture details
    const fixture = await this.getFixtureDetails(fixtureId);
    if (!fixture) {
      throw new Error('Fixture not found');
    }

    const report: MatchReport = {
      id: `RPT-${Date.now()}`,
      refereeId,
      fixtureId,
      fixtureNumber: fixture.fixtureNumber,
      competition: fixture.league,
      venue: fixture.venue,
      kickoffTime: fixture.kickoffTime,
      endTime: '',
      finalScore: '',
      winningTeam: '',
      status: 'Completed',
      goals: [],
      yellowCards: [],
      redCards: [],
      substitutions: [],
      comments: '',
      submittedAt: new Date(),
      submittedBy: refereeId,
      locked: false,
    };

    return report;
  }

  async recordGoal(refereeId: string, reportId: string, goal: any): Promise<Goal> {
    // Verify ownership
    const report = await this.getReport(reportId);
    if (report?.submittedBy !== refereeId) {
      throw new Error('Unauthorized');
    }

    if (report?.locked) {
      throw new Error('Report is locked');
    }

    // Validate player is in team sheet
    await this.validatePlayerInTeamSheet(report.fixtureId, goal.goalScorer);

    const newGoal: Goal = {
      id: `GOAL-${Date.now()}`,
      goalScorer: goal.goalScorer,
      club: goal.club,
      minute: goal.minute,
      ownGoal: goal.ownGoal || false,
      penalty: goal.penalty || false,
      assist: goal.assist,
    };

    return newGoal;
  }

  async recordYellowCard(refereeId: string, reportId: string, card: any): Promise<Card> {
    const report = await this.getReport(reportId);
    if (report?.submittedBy !== refereeId || report?.locked) {
      throw new Error('Cannot modify locked report');
    }

    // Validate player
    await this.validatePlayerInTeamSheet(report.fixtureId, card.playerId);

    const newCard: Card = {
      id: `YC-${Date.now()}`,
      playerId: card.playerId,
      playerName: card.playerName,
      club: card.club,
      minute: card.minute,
      reason: card.reason,
    };

    return newCard;
  }

  async recordRedCard(refereeId: string, reportId: string, card: any): Promise<Card> {
    const report = await this.getReport(reportId);
    if (report?.submittedBy !== refereeId || report?.locked) {
      throw new Error('Cannot modify locked report');
    }

    await this.validatePlayerInTeamSheet(report.fixtureId, card.playerId);

    const newCard: Card = {
      id: `RC-${Date.now()}`,
      playerId: card.playerId,
      playerName: card.playerName,
      club: card.club,
      minute: card.minute,
      reason: card.reason,
      secondYellow: card.secondYellow || false,
    };

    return newCard;
  }

  async recordSubstitution(refereeId: string, reportId: string, sub: any): Promise<Substitution> {
    const report = await this.getReport(reportId);
    if (report?.submittedBy !== refereeId || report?.locked) {
      throw new Error('Cannot modify locked report');
    }

    await this.validatePlayerInTeamSheet(report.fixtureId, sub.playerOut);
    await this.validatePlayerInTeamSheet(report.fixtureId, sub.playerIn);

    const newSub: Substitution = {
      id: `SUB-${Date.now()}`,
      playerOut: sub.playerOut,
      playerIn: sub.playerIn,
      club: sub.club,
      minute: sub.minute,
    };

    return newSub;
  }

  async submitMatchReport(refereeId: string, reportId: string, reportData: any): Promise<MatchReport> {
    const report = await this.getReport(reportId);
    if (!report || report.submittedBy !== refereeId) {
      throw new Error('Unauthorized');
    }

    // Validate required fields
    if (!reportData.finalScore) {
      throw new Error('Final score is required');
    }

    if (!reportData.status || !['Completed', 'Abandoned', 'Postponed', 'Suspended', 'Walkover'].includes(reportData.status)) {
      throw new Error('Valid match status is required');
    }

    if (reportData.status === 'Abandoned') {
      if (!reportData.abandonedReason || !reportData.abandonedMinute) {
        throw new Error('Abandonment reason and minute required');
      }
    }

    // Check for duplicate submission
    const existing = await this.checkExistingSubmission(report.fixtureId);
    if (existing) {
      throw new Error('Report already submitted for this fixture');
    }

    const submitted: MatchReport = {
      ...report,
      finalScore: reportData.finalScore,
      winningTeam: reportData.winningTeam,
      status: reportData.status,
      endTime: reportData.endTime,
      comments: reportData.comments,
      locked: true,
      submittedAt: new Date(),
    };

    // Notify League Manager for review
    await this.notifyLeagueManager(submitted);

    // Trigger standings update after League Manager approves
    await this.scheduleStandingsUpdate(report.fixtureId);

    return submitted;
  }

  async getReport(reportId: string): Promise<MatchReport | null> {
    return null;
  }

  async getSubmittedReports(refereeId: string, limit: number = 20, offset: number = 0): Promise<MatchReport[]> {
    return [];
  }

  async searchReports(refereeId: string, query: string): Promise<MatchReport[]> {
    return [];
  }

  private async verifyAssignment(refereeId: string, fixtureId: string): Promise<boolean> {
    return false;
  }

  private async getFixtureDetails(fixtureId: string): Promise<any> {
    return null;
  }

  private async validatePlayerInTeamSheet(fixtureId: string, playerId: string): Promise<void> {
    // Verify player is in submitted team sheet for this fixture
  }

  private async checkExistingSubmission(fixtureId: string): Promise<boolean> {
    return false;
  }

  private async notifyLeagueManager(report: MatchReport): Promise<void> {
    // Send notification to League Manager for review
  }

  private async scheduleStandingsUpdate(fixtureId: string): Promise<void> {
    // Schedule automatic standings update after approval
  }
}
