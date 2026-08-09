import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { logAudit } from '@/lib/audit';
import { backfillRegistrationNumbers } from '@/lib/player-registration';

export const dynamic = 'force-dynamic';

/*
  Issues KNSCL numbers to players who were approved before official numbers
  existed. See backfillRegistrationNumbers for the rules — oldest first,
  existing numbers untouched, unapproved players skipped.

  Platform Owner only, and safe to call twice: a second run finds nothing left
  to do. GET reports what a run would find without changing anything, so the
  outcome can be checked before committing to it.
*/
export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const [withNumber, eligible, pending] = await Promise.all([
    prisma.player.count({ where: { registrationNumber: { not: null } } }),
    prisma.player.count({ where: { registrationNumber: null, approved: true } }),
    prisma.player.count({ where: { registrationNumber: null, approved: false } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      alreadyNumbered: withNumber,
      wouldBackfill: eligible,
      skippedAwaitingApproval: pending,
      note: 'Nothing has been changed. POST to this address to run the backfill.',
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  try {
    const result = await backfillRegistrationNumbers(prisma);

    if (result.backfilled.length > 0) {
      await logAudit({
        userId: auth.user.sub,
        action: 'REGISTRATION_NUMBERS_BACKFILLED',
        module: 'players',
        detail: `${result.backfilled.length} player(s): ${result.range?.from} – ${result.range?.to}`,
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to backfill registration numbers' },
      { status: 500 }
    );
  }
}
