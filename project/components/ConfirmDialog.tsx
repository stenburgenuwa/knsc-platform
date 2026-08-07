'use client';

import { useState } from 'react';

// Modal confirmation for destructive actions. When `requirePhrase` is set the
// confirm button stays disabled until the operator types it exactly — used for
// the wipe-everything action, where a misclick would be unrecoverable.
export default function ConfirmDialog({
  title,
  body,
  confirmLabel = 'Delete',
  requirePhrase,
  onConfirm,
  onCancel,
  busy,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  requirePhrase?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [typed, setTyped] = useState('');
  const unlocked = !requirePhrase || typed === requirePhrase;

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog-title">{title}</h2>
        <div className="dialog-body">{body}</div>

        {requirePhrase && (
          <div className="field">
            <label htmlFor="confirm-phrase">
              Type <strong>{requirePhrase}</strong> to confirm
            </label>
            <input
              id="confirm-phrase"
              className="input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}

        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={!unlocked || busy}
            style={unlocked ? { color: 'var(--color-accent-800)', borderColor: 'var(--color-accent-800)' } : undefined}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
