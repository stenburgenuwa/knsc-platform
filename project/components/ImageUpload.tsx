'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { resizeImage } from '@/lib/image-resize';
import { uploadImage } from '@/lib/admin-api';
import Avatar from '@/components/Avatar';

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
  rounded?: 'circle' | 'soft';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const resized = await resizeImage(file);
      const res = await uploadImage(resized, kind);
      onChange(res.data?.data?.url ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Upload failed.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
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
    </div>
  );
}
