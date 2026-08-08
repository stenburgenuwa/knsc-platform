import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const module_ = searchParams.get('module') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

  const logs = await prisma.auditLog.findMany({
    where: module_ ? { module: module_ } : undefined,
    include: { user: { select: { firstName: true, lastName: true, role: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ success: true, data: logs });
}
