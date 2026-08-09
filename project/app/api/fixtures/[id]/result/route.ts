import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { syncSuspensionCases } from '@/lib/suspensions';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['REFEREE', 'LEAGUE_MANAGER', 'PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const { homeScore, awayScore, reportNotes } = await request.json();
    if (homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ success: false, error: 'homeScore and awayScore are required' }, { status: 400 });
    }

    if (auth.user.role === 'REFEREE') {
      const assignment = await prisma.refereeAssignment.findUnique({ where: { fixtureId: params.id } });
      if (!assignment || assignment.refereeId !== auth.user.sub) {
        return NextResponse.json(
          { success: false, error: 'You are not the assigned referee for this fixture' },
          { status: 403 }
        );
      }
    }

    const existing = await prisma.fixture.findUnique({ where: { id: params.id } });
    if (existing?.reportStatus === 'APPROVED' && auth.user.role === 'REFEREE') {
      return NextResponse.json(
        { success: false, error: 'This match report has already been approved and can no longer be changed.' },
        { status: 409 }
      );
    }

    // A referee submitting a result files the official match report, which
    // then waits in the League Manager's review queue; the League Manager or
    // Platform Owner entering/correcting a score is treated as authoritative
    // and needs no further review.
    const isRefereeSubmission = auth.user.role === 'REFEREE';

    const fixture = await prisma.fixture.update({
      where: { id: params.id },
      data: {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        status: 'COMPLETED',
        reportStatus: isRefereeSubmission ? 'SUBMITTED' : 'APPROVED',
        reportSubmittedAt: isRefereeSubmission ? new Date() : existing?.reportSubmittedAt,
        ...(reportNotes !== undefined ? { reportNotes } : {}),
      },
      include: { homeClub: true, awayClub: true, venue: true },
    });

    if (auth.user.role === 'REFEREE') {
      await prisma.refereeAssignment.update({
        where: { fixtureId: params.id },
        data: { status: 'COMPLETED' },
      });
    }

    // Completing a match serves a match of every outstanding ban at both
    // clubs, so the disciplinary register is brought back in step here. The
    // suspension engine derives status on read regardless, but the stored
    // cases back the League Manager's register and the report archive.
    const affected = await prisma.player.findMany({
      where: { clubId: { in: [fixture.homeClubId, fixture.awayClubId] } },
      select: { id: true },
    });
    await syncSuspensionCases(affected.map((p) => p.id));

    return NextResponse.json({ success: true, data: fixture });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit result' },
      { status: 500 }
    );
  }
}
