import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const club = await prisma.club.findUnique({
    where: { id: params.id },
    include: {
      homeVenue: true,
      players: { where: { approved: true }, orderBy: { lastName: 'asc' } },
    },
  });

  if (!club) {
    return NextResponse.json({ success: false, error: 'Club not found' }, { status: 404 });
  }

  const [homeFixtures, awayFixtures] = await Promise.all([
    prisma.fixture.findMany({
      where: { homeClubId: club.id, status: 'COMPLETED' },
      include: { awayClub: true },
      orderBy: { fixtureDate: 'desc' },
      take: 5,
    }),
    prisma.fixture.findMany({
      where: { awayClubId: club.id, status: 'COMPLETED' },
      include: { homeClub: true },
      orderBy: { fixtureDate: 'desc' },
      take: 5,
    }),
  ]);

  const recentResults = [
    ...homeFixtures.map((f) => ({
      id: f.id,
      opponent: f.awayClub.name,
      home: true,
      forScore: f.homeScore,
      againstScore: f.awayScore,
      fixtureDate: f.fixtureDate,
    })),
    ...awayFixtures.map((f) => ({
      id: f.id,
      opponent: f.homeClub.name,
      home: false,
      forScore: f.awayScore,
      againstScore: f.homeScore,
      fixtureDate: f.fixtureDate,
    })),
  ]
    .sort((a, b) => new Date(b.fixtureDate).getTime() - new Date(a.fixtureDate).getTime())
    .slice(0, 5);

  return NextResponse.json({ success: true, data: { ...club, recentResults } });
}
