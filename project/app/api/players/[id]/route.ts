import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { verifyAccessToken } from '@/lib/jwt';
import { deletePlayerCascade } from '@/lib/cascade';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function optionalAuth(request: NextRequest) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  return token ? verifyAccessToken(token) : null;
}

// Public player profile: goals reuse the denormalised Player.goals counter;
// cards and match history are derived from existing MatchEvent rows rather
// than kept in any new table. Unapproved players are hidden from the public
// the same way the players list already hides them.
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: { club: true },
  });

  if (!player) {
    return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
  }

  const user = optionalAuth(request);
  const isAdministrator = Boolean(
    user && (user.role === 'PLATFORM_OWNER' || user.role === 'LEAGUE_MANAGER' || (user.role === 'TEAM_MANAGER' && user.clubId === player.clubId))
  );

  if (!player.approved && !isAdministrator) {
    return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
  }

  // The National ID / passport number is administrative data — it is stripped
  // for anyone who isn't administering this player.
  if (!isAdministrator) {
    delete (player as Partial<typeof player>).idNumber;
  }

  const events = await prisma.matchEvent.findMany({
    where: { playerId: params.id },
    include: { fixture: { include: { homeClub: true, awayClub: true } } },
    orderBy: { fixture: { fixtureDate: 'desc' } },
  });

  const yellowCards = events.filter((e) => e.type === 'YELLOW_CARD').length;
  const redCards = events.filter((e) => e.type === 'RED_CARD').length;

  const matchesById = new Map<string, any>();
  for (const e of events) {
    const f = e.fixture;
    if (!matchesById.has(f.id)) {
      const isHome = f.homeClubId === player.clubId;
      matchesById.set(f.id, {
        fixtureId: f.id,
        fixtureDate: f.fixtureDate,
        opponent: isHome ? f.awayClub.name : f.homeClub.name,
        home: isHome,
        forScore: isHome ? f.homeScore : f.awayScore,
        againstScore: isHome ? f.awayScore : f.homeScore,
        events: [] as { type: string; minute: number | null }[],
      });
    }
    matchesById.get(f.id).events.push({ type: e.type, minute: e.minute });
  }

  return NextResponse.json({
    success: true,
    data: {
      ...player,
      stats: { goals: player.goals, yellowCards, redCards },
      matchHistory: Array.from(matchesById.values()),
    },
  });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'TEAM_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.player.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
  }
  if (auth.user.role === 'TEAM_MANAGER' && auth.user.clubId !== existing.clubId) {
    return NextResponse.json(
      { success: false, error: 'Team Managers can only remove players from their own club' },
      { status: 403 }
    );
  }

  try {
    await deletePlayerCascade(prisma, params.id);
    await logAudit({
      userId: auth.user.sub,
      action: 'PLAYER_DELETED',
      module: 'players',
      targetId: params.id,
      detail: `${existing.firstName} ${existing.lastName}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete player' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'TEAM_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.player.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
  }
  if (auth.user.role === 'TEAM_MANAGER' && auth.user.clubId !== existing.clubId) {
    return NextResponse.json(
      { success: false, error: 'Team Managers can only edit players in their own club' },
      { status: 403 }
    );
  }

  try {
    const { firstName, middleName, lastName, playerNumber, position, dateOfBirth, photoUrl, idNumber, height, weight, county, preferredFoot, featured, resubmit } =
      await request.json();

    // Resubmission after a rejection: the correction clears the reason and
    // sends the record back to the League Manager's queue. An already-issued
    // registration number is deliberately left alone — numbers are permanent.
    const resubmitting = resubmit === true && Boolean(existing.rejectedAt);
    if (resubmitting) {
      const nowFirst = firstName ?? existing.firstName;
      const nowLast = lastName ?? existing.lastName;
      const nowId = idNumber ?? existing.idNumber;
      const nowDob = dateOfBirth !== undefined ? dateOfBirth : existing.dateOfBirth;
      const nowPhoto = photoUrl !== undefined ? photoUrl : existing.photoUrl;
      if (!nowFirst?.trim() || !nowLast?.trim() || !nowId?.trim() || !nowDob || !nowPhoto?.trim()) {
        return NextResponse.json(
          { success: false, error: 'First name, last name, ID / passport number, date of birth and a player photo are required before resubmitting.' },
          { status: 400 }
        );
      }
    }

    const player = await prisma.player.update({
      where: { id: params.id },
      data: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(middleName !== undefined ? { middleName: middleName || null } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(playerNumber !== undefined ? { playerNumber: playerNumber ? Number(playerNumber) : null } : {}),
        ...(position !== undefined ? { position: position || null } : {}),
        ...(dateOfBirth !== undefined ? { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null } : {}),
        ...(photoUrl !== undefined ? { photoUrl: photoUrl || null } : {}),
        ...(idNumber !== undefined ? { idNumber: idNumber || null } : {}),
        ...(height !== undefined ? { height: height ? Number(height) : null } : {}),
        ...(weight !== undefined ? { weight: weight ? Number(weight) : null } : {}),
        ...(county !== undefined ? { county: county || null } : {}),
        ...(preferredFoot !== undefined ? { preferredFoot: preferredFoot || null } : {}),
        ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
        ...(resubmitting ? { rejectionReason: null, rejectedAt: null, leagueManagerApproved: false } : {}),
      },
      include: { club: true },
    });

    await logAudit({
      userId: auth.user.sub,
      action: resubmitting ? 'PLAYER_RESUBMITTED' : 'PLAYER_UPDATED',
      module: 'players',
      targetId: player.id,
      detail: `${player.firstName} ${player.lastName}`,
    });

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update player' },
      { status: 500 }
    );
  }
}
