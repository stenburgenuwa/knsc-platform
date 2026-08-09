'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, X, ZoomIn } from 'lucide-react';

/*
  Passport-style square crop, done in the browser before upload.

  A player photo has one job: let a League Manager recognise the person in
  front of them. A phone photo is usually a wide landscape shot with the face
  somewhere in the middle, so it needs framing, not just downscaling. The
  manager drags to position the face and zooms to fill the frame; what is
  inside the square is exactly what gets saved.

  Built on canvas and pointer events rather than a cropping library — the
  interaction is a pan and a zoom, and a dependency for that would be heavier
  than the code it replaces.
*/

const OUTPUT_SIZE = 512;
const VIEWPORT = 300;
const OUTPUT_TYPE = 'image/webp';
const OUTPUT_QUALITY = 0.85;

export default function ImageCropper({
  file,
  onCancel,
  onCrop,
}: {
  file: File;
  onCancel: () => void;
  onCrop: (blob: Blob) => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    // The object URL has to outlive decoding: the preview below renders from
    // it, so revoking on load would leave the user dragging a blank frame.
    // It is released when the cropper unmounts.
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImage(img);
    img.onerror = () => setError('That file could not be read as an image.');
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Scale at which the image exactly covers the square frame — the floor, so
  // the crop can never contain empty space.
  const baseScale = image ? Math.max(VIEWPORT / image.width, VIEWPORT / image.height) : 1;
  const scale = baseScale * zoom;
  const drawnWidth = image ? image.width * scale : 0;
  const drawnHeight = image ? image.height * scale : 0;

  // Keep the frame covered no matter how far the drag went.
  const clamp = (value: number, drawn: number) => {
    const limit = Math.max(0, (drawn - VIEWPORT) / 2);
    return Math.min(limit, Math.max(-limit, value));
  };

  useEffect(() => {
    setOffset((o) => ({ x: clamp(o.x, drawnWidth), y: clamp(o.y, drawnHeight) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-clamps whenever the drawn size changes
  }, [drawnWidth, drawnHeight]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset({
      x: clamp(d.ox + (e.clientX - d.x), drawnWidth),
      y: clamp(d.oy + (e.clientY - d.y), drawnHeight),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const handleCrop = async () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Your browser could not process this image.');
      return;
    }

    // Map the on-screen frame back onto the source image.
    const ratio = OUTPUT_SIZE / VIEWPORT;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(
      image,
      (VIEWPORT / 2 - drawnWidth / 2 + offset.x) * ratio,
      (VIEWPORT / 2 - drawnHeight / 2 + offset.y) * ratio,
      drawnWidth * ratio,
      drawnHeight * ratio
    );

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY));
    if (!blob) {
      setError('Your browser could not process this image.');
      return;
    }
    onCrop(blob);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crop player photo"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(12, 22, 19, 0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="card" style={{ maxWidth: 380, width: '100%' }}>
        <h3 className="card-title">Crop photo</h3>
        <p className="card-meta" style={{ marginBottom: 'var(--space-3)' }}>
          Drag to position the face inside the frame, then zoom until the head fills most of it.
        </p>

        {error ? (
          <p className="card-meta" style={{ color: 'var(--color-accent-800)' }}>{error}</p>
        ) : !image ? (
          <p className="card-meta">Loading&hellip;</p>
        ) : (
          <>
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                width: VIEWPORT, height: VIEWPORT, maxWidth: '100%',
                margin: '0 auto',
                position: 'relative', overflow: 'hidden',
                border: '1px solid var(--color-divider)',
                background: 'var(--color-neutral-100)',
                cursor: dragRef.current ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- object URL, not a statically known source */}
              <img
                src={image.src}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  width: drawnWidth, height: drawnHeight,
                  left: VIEWPORT / 2 - drawnWidth / 2 + offset.x,
                  top: VIEWPORT / 2 - drawnHeight / 2 + offset.y,
                  maxWidth: 'none', userSelect: 'none', pointerEvents: 'none',
                }}
              />
            </div>

            <div className="field" style={{ marginTop: 'var(--space-3)' }}>
              <label htmlFor="crop-zoom" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ZoomIn size={14} /> Zoom
              </label>
              <input
                id="crop-zoom"
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button type="button" className="btn btn-primary" onClick={handleCrop}>
                <Check size={14} /> Use photo
              </button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                <X size={14} /> Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
