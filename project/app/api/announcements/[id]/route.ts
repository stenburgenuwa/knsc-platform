import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'REFEREE_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.announcement.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Announcement not found' }, { status: 404 });
  }

  if (auth.user.role !== 'PLATFORM_OWNER' && existing.createdById !== auth.user.sub) {
    return NextResponse.json({ success: false, error: 'You can only remove announcements you created' }, { status: 403 });
  }

  await prisma.announcement.delete({ where: { id: params.id } });

  await logAudit({
    userId: auth.user.sub,
    action: 'ANNOUNCEMENT_DELETED',
    module: 'announcements',
    targetId: params.id,
    detail: existing.title,
  });

  return NextResponse.json({ success: true });
}
