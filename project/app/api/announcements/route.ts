import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const CREATOR_ROLES = ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'REFEREE_MANAGER'];
const AUDIENCE_ROLES = ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'TEAM_MANAGER', 'REFEREE', 'REFEREE_MANAGER'];
const PRIORITIES = ['NORMAL', 'HIGH', 'EMERGENCY'];

// The signed-in user's announcement feed: anything sent to everyone, plus
// anything targeted at their own role. Platform Owners see everything, since
// they're the one role with no restricted view anywhere else in the app.
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const where =
    auth.user.role === 'PLATFORM_OWNER'
      ? {}
      : { OR: [{ audience: null }, { audience: auth.user.role as any }] };

  const announcements = await prisma.announcement.findMany({
    where,
    include: { createdBy: { select: { firstName: true, lastName: true, role: true } } },
    orderBy: [{ priority: 'desc' }, { startDate: 'desc' }],
    take: 30,
  });

  return NextResponse.json({ success: true, data: announcements });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, CREATOR_ROLES);
  if (!auth.ok) return auth.response;

  try {
    const { title, message, audience, priority } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'title and message are required' }, { status: 400 });
    }
    if (audience !== undefined && audience !== null && !AUDIENCE_ROLES.includes(audience)) {
      return NextResponse.json({ success: false, error: 'Unknown audience role' }, { status: 400 });
    }
    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      return NextResponse.json({ success: false, error: 'Unknown priority' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        audience: audience ?? null,
        priority: priority ?? 'NORMAL',
        createdById: auth.user.sub,
      },
    });

    await logAudit({
      userId: auth.user.sub,
      action: 'ANNOUNCEMENT_CREATED',
      module: 'announcements',
      targetId: announcement.id,
      detail: title,
    });

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
