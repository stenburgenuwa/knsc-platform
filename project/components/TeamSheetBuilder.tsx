'use client';

import { useEffect, useState } from 'react';
import { getTeamSheets, saveTeamSheet } from '@/lib/admin-api';
import Avatar from '@/components/Avatar';

type Slot = 'NONE' | 'STARTER' | 'SUBSTITUTE';

const STARTERS_REQUIRED = 11;
const SUBSTITUTES_REQUIRED = 7;

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Lets a Team Manager pick a Starting XI + 7 substitutes + captain for one
// fixture, and shows whether it's already locked because kickoff has passed.
export default function TeamSheetBuilder({ fixture, clubId, squad }: { fixture: any; clubId: string; squad: any[] }) {
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [captainId, setCaptainId] = useState<string>('');
  // The shirt each selected player wears in this match. Separate from their
  // squad number, which is only the default.
  const [jerseys, setJerseys] = useState<Record<string, string>>({});
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const kickoff = new Date(fixture.fixtureDate);
  if (fixture.kickoffTime) {
    const [h, m] = fixture.kickoffTime.split(':').map(Number);
    if (!Number.isNaN(h)) kickoff.setHours(h, m || 0, 0, 0);
  }
  const locked = new Date() >= kickoff;

  const load = async () => {
    try {
      const res = await getTeamSheets(fixture.id);
      const sheet = clubId === fixture.homeClubId ? res.data?.data?.home : res.data?.data?.away;
      if (sheet) {
        const next: Record<string, Slot> = {};
        for (const p of sheet.starters) next[p.playerId] = 'STARTER';
        for (const p of sheet.substitutes) next[p.playerId] = 'SUBSTITUTE';
        setSlots(next);
        const captain = sheet.starters.find((p: any) => p.isCaptain);
        setCaptainId(captain?.playerId || '');
        const shirts: Record<string, string> = {};
        for (const p of [...sheet.starters, ...sheet.substitutes]) {
          if (p.jerseyNumber != null) shirts[p.playerId] = String(p.jerseyNumber);
        }
        setJerseys(shirts);
        setSubmittedAt(sheet.submittedAt);
      }
    } catch (error) {
      console.error('Error loading team sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const counts = Object.values(slots).reduce(
    (acc, s) => {
      if (s === 'STARTER') acc.starters += 1;
      if (s === 'SUBSTITUTE') acc.substitutes += 1;
      return acc;
    },
    { starters: 0, substitutes: 0 }
  );

  const cycleSlot = (playerId: string) => {
    if (locked) return;
    setSlots((prev) => {
      const current = prev[playerId] || 'NONE';
      const next = current === 'NONE' ? 'STARTER' : current === 'STARTER' ? 'SUBSTITUTE' : 'NONE';
      if (next !== 'STARTER' && captainId === playerId) setCaptainId('');
      return { ...prev, [playerId]: next };
    });
  };

  const handleSave = async () => {
    const starters = Object.entries(slots).filter(([, s]) => s === 'STARTER').map(([id]) => id);
    const substitutes = Object.entries(slots).filter(([, s]) => s === 'SUBSTITUTE').map(([id]) => id);

    if (starters.length !== STARTERS_REQUIRED) {
      setStatus(`Select exactly ${STARTERS_REQUIRED} starters (currently ${starters.length}).`);
      return;
    }
    if (substitutes.length !== SUBSTITUTES_REQUIRED) {
      setStatus(`Select exactly ${SUBSTITUTES_REQUIRED} substitutes (currently ${substitutes.length}).`);
      return;
    }
    if (!captainId) {
      setStatus('Pick a captain from the starting XI.');
      return;
    }

    const selectedIds = [...starters, ...substitutes];
    const jerseyNumbers: Record<string, number> = {};
    for (const id of selectedIds) {
      const raw = jerseys[id] ?? (squad.find((p) => p.id === id)?.playerNumber ?? '');
      if (raw === '' || raw === null || raw === undefined) continue;
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 1 || n > 99) {
        setStatus('Jersey numbers must be whole numbers between 1 and 99.');
        return;
      }
      jerseyNumbers[id] = n;
    }
    const shirts = Object.values(jerseyNumbers);
    if (new Set(shirts).size !== shirts.length) {
      setStatus('Two players cannot wear the same jersey number.');
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const res = await saveTeamSheet(fixture.id, { clubId, starters, substitutes, captainId, jerseyNumbers });
      setSubmittedAt(res.data?.data?.submittedAt || new Date().toISOString());
      setStatus('Team sheet saved.');
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to save team sheet.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>
            {fixture.homeClub.name} vs {fixture.awayClub.name}
          </p>
          <p className="card-meta">{formatDate(fixture.fixtureDate)} &bull; {fixture.kickoffTime || 'Kickoff TBC'}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {submittedAt && <span className="tag tag-accent">Submitted</span>}
          {locked && <span className="tag tag-neutral">Locked</span>}
          <button className="btn btn-secondary" onClick={() => setOpen((o) => !o)}>
            {open ? 'Close' : submittedAt ? 'Edit Team Sheet' : 'Prepare Team Sheet'}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          {loading ? (
            <p className="card-meta">Loading&hellip;</p>
          ) : locked ? (
            <p className="card-meta">Kickoff has passed &mdash; this team sheet is locked and can no longer be edited.</p>
          ) : (
            <>
              <p className="card-meta" style={{ marginBottom: 'var(--space-2)' }}>
                Starters: {counts.starters}/{STARTERS_REQUIRED} &bull; Substitutes: {counts.substitutes}/{SUBSTITUTES_REQUIRED} &bull; Click a player to cycle Starter → Substitute → None
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 360, overflowY: 'auto' }}>
                {squad.map((p) => {
                  const slot = slots[p.id] || 'NONE';
                  return (
                    <div
                      key={p.id}
                      onClick={() => cycleSlot(p.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-1) var(--space-2)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        background: slot !== 'NONE' ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                        <Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={28} rounded="square" />
                        {p.playerNumber ? `#${p.playerNumber} ` : ''}{p.firstName} {p.lastName}
                        {captainId === p.id && <span className="tag tag-accent-2">C</span>}
                      </span>
                      <span
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {slot !== 'NONE' && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                            <span className="text-muted">Shirt</span>
                            <input
                              type="number"
                              className="input"
                              style={{ width: 64, padding: '2px 6px' }}
                              min={1}
                              max={99}
                              aria-label={`Jersey number for ${p.firstName} ${p.lastName}`}
                              value={jerseys[p.id] ?? (p.playerNumber != null ? String(p.playerNumber) : '')}
                              onChange={(e) => setJerseys({ ...jerseys, [p.id]: e.target.value })}
                            />
                          </label>
                        )}
                        <span className="tag tag-neutral">
                          {slot === 'NONE' ? 'Not selected' : slot === 'STARTER' ? 'Starting XI' : 'Substitute'}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="field" style={{ marginTop: 'var(--space-3)' }}>
                <label htmlFor={`captain-${fixture.id}`}>Captain</label>
                <select
                  id={`captain-${fixture.id}`}
                  className="input"
                  value={captainId}
                  onChange={(e) => setCaptainId(e.target.value)}
                >
                  <option value="">Select captain&hellip;</option>
                  {squad
                    .filter((p) => slots[p.id] === 'STARTER')
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                    ))}
                </select>
              </div>

              <button className="btn btn-primary" disabled={saving} onClick={handleSave} style={{ marginTop: 'var(--space-2)' }}>
                {saving ? 'Saving…' : 'Save Team Sheet'}
              </button>
              {status && <p className="card-meta" style={{ marginTop: 'var(--space-1)' }}>{status}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
