import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['REFEREE', 'LEAGUE_MANAGER', 'PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const { homeScore, awayScore } = await request.json();
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

    const fixture = await prisma.fixture.update({
      where: { id: params.id },
      data: { homeScore: Number(homeScore), awayScore: Number(awayScore), status: 'COMPLETED' },
      include: { homeClub: true, awayClub: true, venue: true },
    });

    if (auth.user.role === 'REFEREE') {
      await prisma.refereeAssignment.update({
        where: { fixtureId: params.id },
        data: { status: 'COMPLETED' },
      });
    }

    return NextResponse.json({ success: true, data: fixture });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit result' },
      { status: 500 }
    );
  }
}
