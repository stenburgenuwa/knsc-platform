import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

const MAX_LENGTH = 4000;

// Public contact form. Stores the enquiry for the league office to read in
// the Platform Owner console — no mail transport is configured, so nothing
// leaves the platform.
export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email and message are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ success: false, error: 'Enter a valid email address.' }, { status: 400 });
    }
    if (String(message).length > MAX_LENGTH) {
      return NextResponse.json({ success: false, error: 'Message is too long.' }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name: String(name).slice(0, 120),
        email: String(email).slice(0, 200),
        subject: subject ? String(subject).slice(0, 200) : null,
        message: String(message),
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER']);
  if (!auth.ok) return auth.response;

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return NextResponse.json({ success: true, data: messages });
}
