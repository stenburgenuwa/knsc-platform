import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const { name, description, logoUrl, websiteUrl, category, sortOrder, active } = await request.json();
    const sponsor = await prisma.sponsor.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(logoUrl !== undefined ? { logoUrl: logoUrl || null } : {}),
        ...(websiteUrl !== undefined ? { websiteUrl: websiteUrl || null } : {}),
        ...(category !== undefined ? { category: category || null } : {}),
        ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) || 0 } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
      },
    });
    await logAudit({ userId: auth.user.sub, action: 'SPONSOR_UPDATED', module: 'website', targetId: params.id, detail: sponsor.name });
    return NextResponse.json({ success: true, data: sponsor });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update sponsor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const existing = await prisma.sponsor.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ success: false, error: 'Sponsor not found' }, { status: 404 });

  await prisma.sponsor.delete({ where: { id: params.id } });
  await logAudit({ userId: auth.user.sub, action: 'SPONSOR_DELETED', module: 'website', targetId: params.id, detail: existing.name });
  return NextResponse.json({ success: true });
}
