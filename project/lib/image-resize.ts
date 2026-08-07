// Browser-side image downscaling. Runs before upload so we never ship a 4 MB
// phone photo to the server: a 256px WebP crest or headshot lands around
// 8–20 KB, which keeps pages fast and makes the zero-setup storage backend
// (inline data URLs) practical.

export const MAX_IMAGE_DIMENSION = 256;
const OUTPUT_TYPE = 'image/webp';
const OUTPUT_QUALITY = 0.8;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file could not be read as an image.'));
    };
    img.src = url;
  });
}

// Scales to fit within a square of MAX_IMAGE_DIMENSION, preserving aspect
// ratio, and never upscales a small source image.
export async function resizeImage(file: File): Promise<Blob> {
  const img = await loadImage(file);

  const scale = Math.min(MAX_IMAGE_DIMENSION / img.width, MAX_IMAGE_DIMENSION / img.height, 1);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not process this image.');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY));
  if (!blob) throw new Error('Your browser could not process this image.');
  return blob;
}
