import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const STARTERS_REQUIRED = 11;
const SUBSTITUTES_REQUIRED = 7;

async function canView(fixture: { homeClubId: string; awayClubId: string; id: string }, user: { sub: string; role: string; clubId?: string | null }) {
  if (user.role === 'PLATFORM_OWNER' || user.role === 'LEAGUE_MANAGER') return true;
  if (user.role === 'TEAM_MANAGER' && (user.clubId === fixture.homeClubId || user.clubId === fixture.awayClubId)) return true;
  if (user.role === 'REFEREE') {
    const assignment = await prisma.refereeAssignment.findUnique({ where: { fixtureId: fixture.id } });
    return !!assignment && assignment.refereeId === user.sub;
  }
  return false;
}

function shapeTeamSheet(sheet: any) {
  if (!sheet) return null;
  return {
    id: sheet.id,
    clubId: sheet.clubId,
    submittedAt: sheet.submittedAt,
    starters: sheet.entries.filter((e: any) => e.role === 'STARTER').map(shapeEntry),
    substitutes: sheet.entries.filter((e: any) => e.role === 'SUBSTITUTE').map(shapeEntry),
  };
}

function shapeEntry(e: any) {
  return {
    playerId: e.playerId,
    isCaptain: e.isCaptain,
    firstName: e.player.firstName,
    lastName: e.player.lastName,
    playerNumber: e.player.playerNumber,
    position: e.player.position,
    photoUrl: e.player.photoUrl,
  };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const fixture = await prisma.fixture.findUnique({ where: { id: params.id } });
  if (!fixture) {
    return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
  }

  if (!(await canView(fixture, auth.user))) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const sheets = await prisma.teamSheet.findMany({
    where: { fixtureId: params.id },
    include: { entries: { include: { player: true } } },
  });

  const home = sheets.find((s) => s.clubId === fixture.homeClubId) || null;
  const away = sheets.find((s) => s.clubId === fixture.awayClubId) || null;

  return NextResponse.json({
    success: true,
    data: { home: shapeTeamSheet(home), away: shapeTeamSheet(away) },
  });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['TEAM_MANAGER', 'PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const fixture = await prisma.fixture.findUnique({ where: { id: params.id } });
  if (!fixture) {
    return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
  }

  try {
    const { clubId, starters, substitutes, captainId } = await request.json();

    if (clubId !== fixture.homeClubId && clubId !== fixture.awayClubId) {
      return NextResponse.json({ success: false, error: 'That club is not in this fixture' }, { status: 400 });
    }
    if (auth.user.role === 'TEAM_MANAGER' && auth.user.clubId !== clubId) {
      return NextResponse.json({ success: false, error: 'You can only prepare your own club’s team sheet' }, { status: 403 });
    }
    if (!Array.isArray(starters) || !Array.isArray(substitutes)) {
      return NextResponse.json({ success: false, error: 'starters and substitutes must be arrays of player IDs' }, { status: 400 });
    }
    if (starters.length !== STARTERS_REQUIRED) {
      return NextResponse.json({ success: false, error: `Exactly ${STARTERS_REQUIRED} starting players are required` }, { status: 400 });
    }
    if (substitutes.length !== SUBSTITUTES_REQUIRED) {
      return NextResponse.json({ success: false, error: `Exactly ${SUBSTITUTES_REQUIRED} substitutes are required` }, { status: 400 });
    }
    const allIds = [...starters, ...substitutes];
    if (new Set(allIds).size !== allIds.length) {
      return NextResponse.json({ success: false, error: 'A player cannot appear twice on the team sheet' }, { status: 400 });
    }
    if (!captainId || !starters.includes(captainId)) {
      return NextResponse.json({ success: false, error: 'The captain must be one of the starting XI' }, { status: 400 });
    }

    // Kickoff lock — once matchtime has passed, the sheet can no longer change.
    const kickoff = new Date(fixture.fixtureDate);
    if (fixture.kickoffTime) {
      const [h, m] = fixture.kickoffTime.split(':').map(Number);
      if (!Number.isNaN(h)) kickoff.setHours(h, m || 0, 0, 0);
    }
    if (new Date() >= kickoff) {
      return NextResponse.json({ success: false, error: 'The team sheet is locked — kickoff has passed' }, { status: 409 });
    }

    const players = await prisma.player.findMany({ where: { id: { in: allIds } } });
    if (players.length !== allIds.length) {
      return NextResponse.json({ success: false, error: 'One or more selected players could not be found' }, { status: 400 });
    }
    if (players.some((p) => p.clubId !== clubId)) {
      return NextResponse.json({ success: false, error: 'Every player must belong to this club' }, { status: 400 });
    }
    if (players.some((p) => !p.approved)) {
      return NextResponse.json({ success: false, error: 'Only approved players can be selected' }, { status: 400 });
    }

    const sheet = await prisma.$transaction(async (tx) => {
      const existing = await tx.teamSheet.findUnique({ where: { fixtureId_clubId: { fixtureId: params.id, clubId } } });
      const teamSheet = existing
        ? await tx.teamSheet.update({ where: { id: existing.id }, data: { submittedAt: new Date() } })
        : await tx.teamSheet.create({ data: { fixtureId: params.id, clubId, submittedAt: new Date() } });

      await tx.teamSheetEntry.deleteMany({ where: { teamSheetId: teamSheet.id } });
      await tx.teamSheetEntry.createMany({
        data: [
          ...starters.map((playerId: string) => ({ teamSheetId: teamSheet.id, playerId, role: 'STARTER' as const, isCaptain: playerId === captainId })),
          ...substitutes.map((playerId: string) => ({ teamSheetId: teamSheet.id, playerId, role: 'SUBSTITUTE' as const, isCaptain: false })),
        ],
      });

      return teamSheet;
    });

    await logAudit({
      userId: auth.user.sub,
      action: 'TEAM_SHEET_SUBMITTED',
      module: 'team-sheets',
      targetId: sheet.id,
      detail: `Fixture ${params.id}, club ${clubId}`,
    });

    return NextResponse.json({ success: true, data: { id: sheet.id, submittedAt: sheet.submittedAt } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save team sheet' },
      { status: 500 }
    );
  }
}
