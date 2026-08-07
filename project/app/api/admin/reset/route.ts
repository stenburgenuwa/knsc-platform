import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { resetAllData, RESET_CONFIRMATION } from '@/lib/cascade';

export const dynamic = 'force-dynamic';

// Clears every club, player, fixture, venue, news item and staff account so a
// real season can be entered from scratch. Irreversible, so it demands an
// exact typed confirmation on top of Platform Owner auth, and always keeps the
// caller's own account to avoid locking everyone out of the platform.
export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const { confirmation } = await request.json();

    if (confirmation !== RESET_CONFIRMATION) {
      return NextResponse.json(
        { success: false, error: `Type "${RESET_CONFIRMATION}" exactly to confirm.` },
        { status: 400 }
      );
    }

    const summary = await resetAllData(prisma, auth.user.sub);

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        note: 'All league data cleared. Your own account was kept so you can sign back in.',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Reset failed' },
      { status: 500 }
    );
  }
}
