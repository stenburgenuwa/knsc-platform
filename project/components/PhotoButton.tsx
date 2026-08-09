'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { resizeImage } from '@/lib/image-resize';
import { uploadImage } from '@/lib/admin-api';
import ImageCropper from '@/components/ImageCropper';

// Compact "set the image on this existing row" control for list views, where a
// full ImageUpload block with its own preview would be too heavy.
export default function PhotoButton({
  id,
  currentUrl,
  kind,
  onChange,
}: {
  id: string;
  currentUrl?: string | null;
  kind: 'player' | 'club';
  onChange: (id: string, url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const upload = async (blob: Blob) => {
    setBusy(true);
    try {
      const resized = await resizeImage(blob);
      const res = await uploadImage(resized, kind);
      onChange(id, res.data?.data?.url ?? null);
    } catch {
      // Parent reloads from the server on failure, so the row self-corrects.
      onChange(id, currentUrl ?? null);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  // Player photos are framed before saving; crests go straight up.
  const handleFile = async (file: File) => {
    if (kind === 'player') {
      setPendingFile(file);
      return;
    }
    await upload(file);
  };

  const noun = kind === 'club' ? 'crest' : 'photo';

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ fontSize: 12, flex: 'none' }}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        aria-label={currentUrl ? `Replace ${noun}` : `Add ${noun}`}
      >
        <Camera size={14} /> {busy ? 'Uploading…' : currentUrl ? 'Replace' : 'Upload'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {pendingFile && (
        <ImageCropper
          file={pendingFile}
          onCancel={() => {
            setPendingFile(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
          onCrop={async (blob) => {
            setPendingFile(null);
            await upload(blob);
          }}
        />
      )}
    </>
  );
}
