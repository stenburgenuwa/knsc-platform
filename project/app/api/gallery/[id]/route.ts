import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.galleryImage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 });

  await prisma.galleryImage.delete({ where: { id: params.id } });
  await logAudit({ userId: auth.user.sub, action: 'GALLERY_IMAGE_DELETED', module: 'website', targetId: params.id });
  return NextResponse.json({ success: true });
}
