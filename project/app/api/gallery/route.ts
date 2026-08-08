import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const images = await prisma.galleryImage.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ success: true, data: images });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const { title, caption, imageUrl, category, sortOrder } = await request.json();
    if (!imageUrl) return NextResponse.json({ success: false, error: 'imageUrl is required' }, { status: 400 });

    const image = await prisma.galleryImage.create({
      data: {
        title: title || null,
        caption: caption || null,
        imageUrl,
        category: category || null,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });

    await logAudit({ userId: auth.user.sub, action: 'GALLERY_IMAGE_ADDED', module: 'website', targetId: image.id, detail: image.title || image.category });
    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add image' },
      { status: 500 }
    );
  }
}
