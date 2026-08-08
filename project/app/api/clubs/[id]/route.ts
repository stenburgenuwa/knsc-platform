import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { deleteClubCascade } from '@/lib/cascade';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const club = await prisma.club.findUnique({ where: { id: params.id } });
  if (!club) {
    return NextResponse.json({ success: false, error: 'Club not found' }, { status: 404 });
  }

  try {
    await deleteClubCascade(prisma, params.id);
    await logAudit({ userId: auth.user.sub, action: 'CLUB_DELETED', module: 'clubs', targetId: params.id, detail: club.name });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete club' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const { name, shortName, yearFounded, homeVenueId, email, phone, logoUrl } = await request.json();

    const club = await prisma.club.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(shortName !== undefined ? { shortName: shortName || null } : {}),
        ...(yearFounded !== undefined ? { yearFounded: yearFounded ? Number(yearFounded) : null } : {}),
        ...(homeVenueId !== undefined ? { homeVenueId: homeVenueId || null } : {}),
        ...(email !== undefined ? { email: email || null } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(logoUrl !== undefined ? { logoUrl: logoUrl || null } : {}),
      },
      include: { homeVenue: true },
    });

    await logAudit({ userId: auth.user.sub, action: 'CLUB_UPDATED', module: 'clubs', targetId: params.id, detail: club.name });

    return NextResponse.json({ success: true, data: club });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update club' },
      { status: 500 }
    );
  }
}

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
