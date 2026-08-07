import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { seedDatabase } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

// One-time production bootstrap: loads starter clubs/players/fixtures/news
// and 5 demo accounts (one per role) into a freshly-migrated, empty
// database, without requiring Node/npm on the operator's own machine.
//
// Guarded by SEED_SECRET (set it in Vercel env vars, call this once, then
// delete the env var — it's not needed again and this route becomes a
// permanent 401 without it). Idempotent: refuses to run if any club
// already exists, so it can't be used to wipe or duplicate real data.
export async function POST(request: NextRequest) {
  const configuredSecret = process.env.SEED_SECRET;
  if (!configuredSecret) {
    return NextResponse.json({ success: false, error: 'SEED_SECRET is not configured' }, { status: 501 });
  }

  const providedSecret = request.headers.get('x-seed-secret');
  if (providedSecret !== configuredSecret) {
    return NextResponse.json({ success: false, error: 'Invalid seed secret' }, { status: 401 });
  }

  const existingClubs = await prisma.club.count();
  if (existingClubs > 0) {
    return NextResponse.json(
      { success: false, error: 'Database already has data — refusing to reseed. Nothing was changed.' },
      { status: 409 }
    );
  }

  const password = crypto.randomBytes(9).toString('base64url') + 'A1!';
  const result = await seedDatabase(prisma, password);

  return NextResponse.json({
    success: true,
    data: {
      ...result,
      logins: [
        'owner@knscl.co.ke',
        'league.manager@knscl.co.ke',
        'team.manager@knscl.co.ke',
        'referee@knscl.co.ke',
        'referee.manager@knscl.co.ke',
      ],
      note: 'All 5 accounts share this password. Change them after first login. You can now remove the SEED_SECRET env var.',
    },
  });
}
