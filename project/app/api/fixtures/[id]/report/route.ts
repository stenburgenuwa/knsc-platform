import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/*
  The submitted match report, assembled on read from the records that already
  exist — fixture, clubs, team sheets, match events, referee assignment. There
  is no separate report table: a snapshot would be a second copy of the same
  facts that could drift from them. What makes the report permanent is that
  every part of it is frozen once submitted — the team sheet locks at kickoff,
  and events lock the moment the referee files the report.

  Readable by the League Manager and the Referee Manager (plus the Platform
  Owner, and the referee who filed it) for verification and disputes, and it
  stays readable after approval.
*/
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'REFEREE_MANAGER', 'REFEREE']);
  if (!auth.ok) return auth.response;

  const fixture = await prisma.fixture.findUnique({
    where: { id: params.id },
    include: {
      homeClub: true,
      awayClub: true,
      venue: true,
      refereeAssignment: { include: { referee: { select: { id: true, firstName: true, lastName: true } } } },
      matchEvents: {
        include: { player: { select: { id: true, firstName: true, middleName: true, lastName: true, clubId: true, photoUrl: true, registrationNumber: true } } },
        orderBy: [{ minute: 'asc' }, { createdAt: 'asc' }],
      },
      teamSheets: { include: { entries: { include: { player: true } } } },
    },
  });

  if (!fixture) {
    return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
  }
  if (fixture.reportStatus === 'DRAFT') {
    return NextResponse.json({ success: false, error: 'No match report has been submitted for this fixture.' }, { status: 404 });
  }
  // A referee may read back only their own reports.
  if (auth.user.role === 'REFEREE' && fixture.refereeAssignment?.refereeId !== auth.user.sub) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const sheet = (clubId: string) => {
    const s = fixture.teamSheets.find((t) => t.clubId === clubId);
    if (!s) return null;
    const shape = (e: (typeof s.entries)[number]) => ({
      playerId: e.playerId,
      firstName: e.player.firstName,
      middleName: e.player.middleName,
      lastName: e.player.lastName,
      registrationNumber: e.player.registrationNumber,
      jerseyNumber: e.jerseyNumber ?? e.player.playerNumber,
      photoUrl: e.player.photoUrl,
      isCaptain: e.isCaptain,
    });
    return {
      submittedAt: s.submittedAt,
      starters: s.entries.filter((e) => e.role === 'STARTER').map(shape),
      substitutes: s.entries.filter((e) => e.role === 'SUBSTITUTE').map(shape),
    };
  };

  const events = fixture.matchEvents.map((e) => ({
    id: e.id,
    type: e.type,
    minute: e.minute,
    side: e.player.clubId === fixture.homeClubId ? ('HOME' as const) : ('AWAY' as const),
    player: {
      id: e.player.id,
      name: [e.player.firstName, e.player.middleName, e.player.lastName].filter(Boolean).join(' '),
      registrationNumber: e.player.registrationNumber,
      photoUrl: e.player.photoUrl,
    },
  }));

  return NextResponse.json({
    success: true,
    data: {
      fixtureId: fixture.id,
      fixtureDate: fixture.fixtureDate,
      kickoffTime: fixture.kickoffTime,
      round: fixture.round,
      venue: fixture.venue?.name || null,
      status: fixture.status,
      homeClub: { id: fixture.homeClub.id, name: fixture.homeClub.name, logoUrl: fixture.homeClub.logoUrl },
      awayClub: { id: fixture.awayClub.id, name: fixture.awayClub.name, logoUrl: fixture.awayClub.logoUrl },
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      teamSheets: { home: sheet(fixture.homeClubId), away: sheet(fixture.awayClubId) },
      events,
      goals: events.filter((e) => e.type === 'GOAL' || e.type === 'OWN_GOAL'),
      cards: events.filter((e) => e.type === 'YELLOW_CARD' || e.type === 'RED_CARD'),
      referee: fixture.refereeAssignment?.referee
        ? {
            id: fixture.refereeAssignment.referee.id,
            name: `${fixture.refereeAssignment.referee.firstName} ${fixture.refereeAssignment.referee.lastName}`,
          }
        : null,
      reportStatus: fixture.reportStatus,
      reportSubmittedAt: fixture.reportSubmittedAt,
      reportNotes: fixture.reportNotes,
    },
  });
}

// League Manager review of a referee-submitted match report. Approving locks
// it for good; returning it hands editing back to the referee so they can
// fix and resubmit through PATCH /api/fixtures/[id]/result.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  const fixture = await prisma.fixture.findUnique({ where: { id: params.id } });
  if (!fixture) {
    return NextResponse.json({ success: false, error: 'Fixture not found' }, { status: 404 });
  }
  if (fixture.reportStatus !== 'SUBMITTED') {
    return NextResponse.json({ success: false, error: 'This fixture has no match report awaiting review.' }, { status: 409 });
  }

  try {
    const { action, notes } = await request.json();
    if (action !== 'APPROVE' && action !== 'RETURN') {
      return NextResponse.json({ success: false, error: 'action must be APPROVE or RETURN' }, { status: 400 });
    }

    const updated = await prisma.fixture.update({
      where: { id: params.id },
      data: {
        reportStatus: action === 'APPROVE' ? 'APPROVED' : 'RETURNED',
        ...(notes !== undefined ? { reportNotes: notes } : {}),
      },
      include: { homeClub: true, awayClub: true, venue: true },
    });

    await logAudit({
      userId: auth.user.sub,
      action: action === 'APPROVE' ? 'MATCH_REPORT_APPROVED' : 'MATCH_REPORT_RETURNED',
      module: 'match-reports',
      targetId: params.id,
      detail: notes || null,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to review match report' },
      { status: 500 }
    );
  }
}
