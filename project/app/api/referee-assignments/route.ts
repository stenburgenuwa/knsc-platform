import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['REFEREE', 'REFEREE_MANAGER', 'PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const where = auth.user.role === 'REFEREE' ? { refereeId: auth.user.sub } : {};

  const assignments = await prisma.refereeAssignment.findMany({
    where,
    include: {
      referee: { select: { id: true, firstName: true, lastName: true, email: true } },
      fixture: { include: { homeClub: true, awayClub: true, venue: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: assignments });
}
