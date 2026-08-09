'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { resizeImage, resizeBlob } from '@/lib/image-resize';
import { uploadImage } from '@/lib/admin-api';
import Avatar from '@/components/Avatar';
import ImageCropper from '@/components/ImageCropper';

export default function ImageUpload({
  value,
  onChange,
  label,
  kind,
  name,
  rounded = 'circle',
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label: string;
  kind: 'player' | 'club' | 'announcement';
  name: string;
  rounded?: 'circle' | 'soft' | 'square';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Player photos are framed by hand before they are saved; crests and
  // announcement images keep the existing straight-to-upload path.
  const cropFirst = kind === 'player';

  const upload = async (blob: Blob) => {
    setError(null);
    setBusy(true);
    try {
      const res = await uploadImage(blob, kind);
      onChange(res.data?.data?.url ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Upload failed.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleFile = async (file: File) => {
    if (cropFirst) {
      setError(null);
      setPendingFile(file);
      return;
    }
    try {
      await upload(await resizeImage(file));
    } catch (err: any) {
      setError(err?.message || 'Upload failed.');
      setBusy(false);
    }
  };

  const handleCropped = async (blob: Blob) => {
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = '';
    try {
      await upload(await resizeBlob(blob));
    } catch (err: any) {
      setError(err?.message || 'Upload failed.');
      setBusy(false);
    }
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Avatar src={value} name={name || '?'} size={56} rounded={rounded} />

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Upload size={14} /> {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </button>
          {value && !busy && (
            <button type="button" className="btn btn-ghost" onClick={() => onChange(null)} aria-label="Remove image">
              <X size={14} /> Remove
            </button>
          )}
        </div>

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
      </div>
      {error && <p className="card-meta" style={{ color: 'var(--color-accent-800)' }}>{error}</p>}

      {pendingFile && (
        <ImageCropper
          file={pendingFile}
          onCancel={() => {
            setPendingFile(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
          onCrop={handleCropped}
        />
      )}
    </div>
  );
}
