import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;
  const { role, sub, clubId } = auth.user;

  if (role === 'PLATFORM_OWNER') {
    const [totalClubs, totalPlayers, totalFixtures, pendingApprovals] = await Promise.all([
      prisma.club.count(),
      prisma.player.count({ where: { approved: true } }),
      prisma.fixture.count(),
      prisma.player.count({ where: { approved: false } }),
    ]);
    return NextResponse.json({ success: true, data: { totalClubs, totalPlayers, totalFixtures, pendingApprovals } });
  }

  if (role === 'LEAGUE_MANAGER') {
    const [upcomingFixtures, pendingApprovals, registeredPlayers] = await Promise.all([
      prisma.fixture.count({ where: { status: 'UPCOMING' } }),
      prisma.player.count({ where: { approved: false } }),
      prisma.player.count({ where: { approved: true } }),
    ]);
    return NextResponse.json({
      success: true,
      data: { upcomingFixtures, pendingReports: pendingApprovals, registeredPlayers, disciplinaryCases: 0 },
    });
  }

  if (role === 'TEAM_MANAGER') {
    if (!clubId) {
      return NextResponse.json({ success: true, data: { squadSize: 0, nextFixture: 'No club assigned', wins: 0, points: 0 } });
    }
    const [squadSize, nextFixture, completed] = await Promise.all([
      prisma.player.count({ where: { clubId, approved: true } }),
      prisma.fixture.findFirst({
        where: { status: 'UPCOMING', OR: [{ homeClubId: clubId }, { awayClubId: clubId }] },
        orderBy: { fixtureDate: 'asc' },
        include: { homeClub: true, awayClub: true },
      }),
      prisma.fixture.findMany({
        where: { status: 'COMPLETED', OR: [{ homeClubId: clubId }, { awayClubId: clubId }] },
      }),
    ]);
    let wins = 0;
    let points = 0;
    for (const f of completed) {
      const isHome = f.homeClubId === clubId;
      const forGoals = isHome ? f.homeScore ?? 0 : f.awayScore ?? 0;
      const againstGoals = isHome ? f.awayScore ?? 0 : f.homeScore ?? 0;
      if (forGoals > againstGoals) {
        wins += 1;
        points += 3;
      } else if (forGoals === againstGoals) {
        points += 1;
      }
    }
    return NextResponse.json({
      success: true,
      data: {
        squadSize,
        nextFixture: nextFixture ? `${nextFixture.homeClub.name} vs ${nextFixture.awayClub.name}` : 'TBD',
        wins,
        points,
      },
    });
  }

  if (role === 'REFEREE') {
    const [assignedMatches, matchesOfficiated, pendingReports] = await Promise.all([
      prisma.refereeAssignment.count({ where: { refereeId: sub, status: { in: ['ASSIGNED', 'ACCEPTED'] } } }),
      prisma.refereeAssignment.count({ where: { refereeId: sub, status: 'COMPLETED' } }),
      prisma.refereeAssignment.count({
        where: { refereeId: sub, status: 'ACCEPTED', fixture: { fixtureDate: { lt: new Date() }, status: 'UPCOMING' } },
      }),
    ]);
    return NextResponse.json({ success: true, data: { assignedMatches, pendingReports, avgRating: '4.5', matchesOfficiated } });
  }

  if (role === 'REFEREE_MANAGER') {
    const [activeReferees, upcomingFixtures] = await Promise.all([
      prisma.user.count({ where: { role: 'REFEREE' } }),
      prisma.fixture.findMany({ where: { status: 'UPCOMING' }, include: { refereeAssignment: true } }),
    ]);
    const unassignedFixtures = upcomingFixtures.filter((f) => !f.refereeAssignment).length;
    return NextResponse.json({
      success: true,
      data: { activeReferees, unassignedFixtures, availabilitySubmitted: activeReferees, avgRating: '4.5' },
    });
  }

  return NextResponse.json({ success: true, data: {} });
}
