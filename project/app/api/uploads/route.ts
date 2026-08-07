import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { storeImage, validateUpload } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// Accepts a single already-compressed image (the browser resizes to 256px
// WebP before sending) and returns a URL to save on a player or club row.
export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['PLATFORM_OWNER', 'LEAGUE_MANAGER', 'TEAM_MANAGER']);
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const kind = String(formData.get('kind') || 'image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const invalid = validateUpload(file.type, file.size);
    if (invalid) {
      return NextResponse.json({ success: false, error: invalid.error }, { status: invalid.status });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const extension = file.type.split('/')[1] || 'webp';
    const stored = await storeImage(bytes, file.type, `${kind}/${Date.now()}.${extension}`);

    return NextResponse.json({ success: true, data: stored }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
