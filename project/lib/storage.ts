// Image storage for player photos and club crests.
//
// Two backends, picked automatically:
//   1. Vercel Blob — used when BLOB_READ_WRITE_TOKEN is present (created for
//      you automatically when you add a Blob store in the Vercel dashboard).
//      Images live on a CDN and the database only holds a short URL.
//   2. Inline data URL — the zero-setup default. The image bytes are stored
//      on the row itself. Viable only because uploads are resized and
//      re-encoded to WebP in the browser first (see components/ImageUpload),
//      which puts a typical crest or headshot in the 8–20 KB range.
//
// Switching to Blob later is safe: existing data-URL rows keep rendering,
// and new uploads start going to the CDN.

export const MAX_UPLOAD_BYTES = 1_500_000; // generous ceiling; real uploads are ~20 KB
export const ALLOWED_IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png'];

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export interface StoredImage {
  url: string;
  backend: 'blob' | 'data-url';
}

export async function storeImage(bytes: Buffer, contentType: string, pathname: string): Promise<StoredImage> {
  if (isBlobConfigured()) {
    const { put } = await import('@vercel/blob');
    const { url } = await put(pathname, bytes, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    });
    return { url, backend: 'blob' };
  }

  return {
    url: `data:${contentType};base64,${bytes.toString('base64')}`,
    backend: 'data-url',
  };
}

export interface UploadValidationError {
  error: string;
  status: number;
}

export function validateUpload(contentType: string | undefined, size: number): UploadValidationError | null {
  if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return { error: `Unsupported image type. Use one of: ${ALLOWED_IMAGE_TYPES.join(', ')}`, status: 415 };
  }
  if (size <= 0) {
    return { error: 'Empty file', status: 400 };
  }
  if (size > MAX_UPLOAD_BYTES) {
    return { error: `Image is too large (max ${Math.round(MAX_UPLOAD_BYTES / 1000)} KB after compression)`, status: 413 };
  }
  return null;
}
