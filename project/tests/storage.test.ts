import { afterEach, describe, expect, it } from 'vitest';
import { validateUpload, storeImage, isBlobConfigured, MAX_UPLOAD_BYTES } from '../lib/storage';

const ORIGINAL_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

afterEach(() => {
  if (ORIGINAL_TOKEN === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = ORIGINAL_TOKEN;
});

describe('validateUpload', () => {
  it('accepts a normal-sized webp', () => {
    expect(validateUpload('image/webp', 20_000)).toBeNull();
  });

  it('accepts jpeg and png too', () => {
    expect(validateUpload('image/jpeg', 20_000)).toBeNull();
    expect(validateUpload('image/png', 20_000)).toBeNull();
  });

  it('rejects non-image content types', () => {
    expect(validateUpload('application/pdf', 20_000)?.status).toBe(415);
    expect(validateUpload('text/html', 20_000)?.status).toBe(415);
  });

  it('rejects a missing content type', () => {
    expect(validateUpload(undefined, 20_000)?.status).toBe(415);
  });

  it('rejects an empty file', () => {
    expect(validateUpload('image/webp', 0)?.status).toBe(400);
  });

  it('rejects a file over the size ceiling', () => {
    expect(validateUpload('image/webp', MAX_UPLOAD_BYTES + 1)?.status).toBe(413);
  });
});

describe('storeImage without a Blob token', () => {
  it('reports Blob as unconfigured', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    expect(isBlobConfigured()).toBe(false);
  });

  it('falls back to an inline data URL that round-trips the bytes', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const bytes = Buffer.from([1, 2, 3, 4, 5]);

    const stored = await storeImage(bytes, 'image/webp', 'player/test.webp');

    expect(stored.backend).toBe('data-url');
    expect(stored.url.startsWith('data:image/webp;base64,')).toBe(true);
    const decoded = Buffer.from(stored.url.split(',')[1], 'base64');
    expect(decoded.equals(bytes)).toBe(true);
  });
});
