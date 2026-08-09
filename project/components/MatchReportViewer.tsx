'use client';

import { useEffect, useState } from 'react';
import { getMatchReport } from '@/lib/admin-api';
import Avatar from '@/components/Avatar';

/*
  The filed match report, as the League Manager and Referee Manager read it
  back — for verification, records and dispute resolution. Everything shown is
  the record itself, not a copy of it, so it cannot drift from what happened.
*/

const EVENT_LABELS: Record<string, string> = {
  GOAL: 'Goal',
  OWN_GOAL: 'Own goal',
  YELLOW_CARD: 'Yellow card',
  RED_CARD: 'Red card',
};

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function SheetTable({ title, sheet }: { title: string; sheet: any }) {
  if (!sheet) {
    return (
      <div>
        <p className="card-kicker">{title}</p>
        <p className="card-meta">No team sheet was submitted.</p>
      </div>
    );
  }
  const rows = [
    ...sheet.starters.map((p: any) => ({ ...p, role: 'Starting XI' })),
    ...sheet.substitutes.map((p: any) => ({ ...p, role: 'Substitute' })),
  ];
  return (
    <div>
      <p className="card-kicker">{title}</p>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th style={{ width: 48 }}>Photo</th>
              <th>Player name</th>
              <th>Registration number</th>
              <th>Jersey number</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p: any, i: number) => (
              <tr key={p.playerId}>
                <td>{i + 1}</td>
                <td><Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={32} rounded="square" /></td>
                <td>
                  {[p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ')}
                  {p.isCaptain && <span className="tag tag-accent-2" style={{ marginLeft: 6 }}>C</span>}
                  <span className="card-meta" style={{ display: 'block' }}>{p.role}</span>
                </td>
                <td>{p.registrationNumber || '—'}</td>
                <td>{p.jerseyNumber ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MatchReportViewer({ fixtureId, onClose }: { fixtureId: string; onClose: () => void }) {
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMatchReport(fixtureId)
      .then((res) => {
        if (!cancelled) setReport(res.data?.data ?? null);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.response?.data?.error || 'Could not load this match report.');
      });
    return () => {
      cancelled = true;
    };
  }, [fixtureId]);

  const eventsFor = (side: 'HOME' | 'AWAY') => (report?.events || []).filter((e: any) => e.side === side);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Match report"
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        background: 'rgba(12, 22, 19, 0.72)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'var(--space-4)', overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ maxWidth: 900, width: '100%', margin: 'var(--space-4) 0' }}>
        {error ? (
          <>
            <p className="card-meta" style={{ color: 'var(--color-accent-800)' }}>{error}</p>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </>
        ) : !report ? (
          <p className="card-meta">Loading match report&hellip;</p>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <div>
                <h3 className="card-title" style={{ marginBottom: 4 }}>
                  {report.homeClub.name} {report.homeScore ?? '–'} &ndash; {report.awayScore ?? '–'} {report.awayClub.name}
                </h3>
                <p className="card-meta">
                  {formatDate(report.fixtureDate)}
                  {report.kickoffTime ? ` · ${report.kickoffTime}` : ''} · {report.venue || 'Venue TBC'}
                </p>
              </div>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-3)', margin: 'var(--space-3) 0' }}>
              <div>
                <p className="card-kicker">Referee</p>
                <p style={{ margin: 0 }}>{report.referee?.name || 'Not recorded'}</p>
              </div>
              <div>
                <p className="card-kicker">Submitted</p>
                <p style={{ margin: 0 }}>{formatDateTime(report.reportSubmittedAt)}</p>
              </div>
              <div>
                <p className="card-kicker">Status</p>
                <p style={{ margin: 0 }}>
                  <span className={`tag ${report.reportStatus === 'APPROVED' ? 'tag-accent' : 'tag-neutral'}`}>{report.reportStatus}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
              {(['HOME', 'AWAY'] as const).map((side) => {
                const club = side === 'HOME' ? report.homeClub : report.awayClub;
                const list = eventsFor(side);
                return (
                  <div key={side}>
                    <p className="card-kicker">{side === 'HOME' ? 'Home' : 'Away'} &mdash; {club.name}</p>
                    {list.length === 0 ? (
                      <p className="card-meta">No events recorded.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {list.map((e: any) => (
                          <p key={e.id} className="card-meta" style={{ margin: 0 }}>
                            {e.minute ? `${e.minute}' ` : ''}
                            <strong>{EVENT_LABELS[e.type] || e.type}</strong> &mdash; {e.player.name}
                            {e.player.registrationNumber ? ` (${e.player.registrationNumber})` : ''}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {report.reportNotes && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <p className="card-kicker">Referee&rsquo;s comments</p>
                <p className="card-meta" style={{ margin: 0 }}>{report.reportNotes}</p>
              </div>
            )}

            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <SheetTable title={`${report.homeClub.name} team sheet`} sheet={report.teamSheets.home} />
              <SheetTable title={`${report.awayClub.name} team sheet`} sheet={report.teamSheets.away} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
