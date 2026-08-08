import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sponsors = await prisma.sponsor.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  return NextResponse.json({ success: true, data: sponsors });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const { name, description, logoUrl, websiteUrl, category, sortOrder } = await request.json();
    if (!name) return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 });

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        description: description || null,
        logoUrl: logoUrl || null,
        websiteUrl: websiteUrl || null,
        category: category || null,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });

    await logAudit({ userId: auth.user.sub, action: 'SPONSOR_CREATED', module: 'website', targetId: sponsor.id, detail: sponsor.name });
    return NextResponse.json({ success: true, data: sponsor }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create sponsor' },
      { status: 500 }
    );
  }
}
