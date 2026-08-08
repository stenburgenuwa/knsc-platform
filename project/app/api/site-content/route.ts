import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';
import { EDITABLE_KEYS } from '@/lib/site-content-keys';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await prisma.siteContent.findMany();
  return NextResponse.json({ success: true, data: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const updates = await request.json();
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ success: false, error: 'Expected an object of key/value pairs' }, { status: 400 });
    }

    const unknown = Object.keys(updates).filter((k) => !(EDITABLE_KEYS as readonly string[]).includes(k));
    if (unknown.length > 0) {
      return NextResponse.json({ success: false, error: `Unknown content key(s): ${unknown.join(', ')}` }, { status: 400 });
    }

    await prisma.$transaction(
      Object.entries(updates).map(([key, value]) =>
        prisma.siteContent.upsert({
          where: { key },
          create: { key, value: String(value ?? '') },
          update: { value: String(value ?? '') },
        })
      )
    );

    await logAudit({
      userId: auth.user.sub,
      action: 'SITE_CONTENT_UPDATED',
      module: 'website',
      detail: Object.keys(updates).join(', '),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save content' },
      { status: 500 }
    );
  }
}
