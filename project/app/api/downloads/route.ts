import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const downloads = await prisma.download.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ success: true, data: downloads });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const { title, description, fileUrl, category, sortOrder } = await request.json();
    if (!title || !fileUrl) {
      return NextResponse.json({ success: false, error: 'title and fileUrl are required' }, { status: 400 });
    }

    const download = await prisma.download.create({
      data: {
        title,
        description: description || null,
        fileUrl,
        category: category || null,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });

    await logAudit({ userId: auth.user.sub, action: 'DOWNLOAD_CREATED', module: 'website', targetId: download.id, detail: download.title });
    return NextResponse.json({ success: true, data: download }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create download' },
      { status: 500 }
    );
  }
}
