import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.download.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success: false, error: 'Download not found' }, { status: 404 });

  await prisma.download.delete({ where: { id: params.id } });
  await logAudit({ userId: auth.user.sub, action: 'DOWNLOAD_DELETED', module: 'website', targetId: params.id, detail: existing.title });
  return NextResponse.json({ success: true });
}
