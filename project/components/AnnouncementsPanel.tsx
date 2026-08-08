'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/admin-api';
import { useAuthStore } from '@/store/auth';
import ImageUpload from '@/components/ImageUpload';

const PRIORITY_TAG: Record<string, string> = {
  NORMAL: 'tag-neutral',
  HIGH: 'tag-accent',
  EMERGENCY: 'tag-accent-2',
};

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY_FORM = {
  title: '',
  message: '',
  audience: '',
  priority: 'NORMAL',
  featuredImageUrl: null as string | null,
  category: '',
  author: '',
};

// Mirrors NEWS_CATEGORIES in lib/public-data (kept literal here so this client
// component doesn't pull in the server-only data module).
const NEWS_CATEGORIES = ['League News', 'Club News', 'Transfers', 'Announcements', 'Events', 'Community'];

// Drop-in announcements feed for any dashboard. Pass `canCompose` + a role
// list to let that dashboard's role also publish new announcements.
export default function AnnouncementsPanel({
  canCompose = false,
  audienceOptions = [],
}: {
  canCompose?: boolean;
  audienceOptions?: { value: string; label: string }[];
}) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isPlatformOwner = useAuthStore((s) => s.user?.roles?.includes('Platform Owner'));
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await getAnnouncements();
      setItems(res.data?.data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      await createAnnouncement({
        title: form.title,
        message: form.message,
        audience: form.audience || null,
        priority: form.priority,
        featuredImageUrl: form.featuredImageUrl,
        category: form.category || undefined,
        author: form.author || undefined,
      });
      setForm(EMPTY_FORM);
      setStatus('Announcement published.');
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to publish announcement.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to remove announcement.');
    }
  };

  return (
    <div className="card elev-sm">
      <h3 className="card-title">Announcements</h3>

      {canCompose && (
        <form onSubmit={handleCreate} style={{ marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-divider)' }}>
          <div className="field">
            <label htmlFor="ann-title">Title</label>
            <input id="ann-title" className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="ann-message">Message</label>
            <textarea id="ann-message" className="input" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <ImageUpload
            label="Featured image (shown on the homepage for public news)"
            kind="announcement"
            rounded="soft"
            name={form.title}
            value={form.featuredImageUrl}
            onChange={(url) => setForm({ ...form, featuredImageUrl: url })}
          />
          {/* Only audience-less announcements reach the public news pages, so
              the newsroom fields appear when "Everyone" is selected. */}
          {!form.audience && (
            <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
              <div className="field">
                <label htmlFor="ann-category">News category</label>
                <select id="ann-category" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Uncategorised</option>
                  {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="ann-author">Author (optional)</label>
                <input id="ann-author" className="input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
            {audienceOptions.length > 0 && (
              <div className="field">
                <label htmlFor="ann-audience">Send to</label>
                <select id="ann-audience" className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  <option value="">Everyone</option>
                  {audienceOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor="ann-priority">Priority</label>
              <select id="ann-priority" className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Publish Announcement</button>
        </form>
      )}

      {status && <p className="card-meta">{status}</p>}

      {loading ? (
        <p className="card-meta">Loading&hellip;</p>
      ) : items.length === 0 ? (
        <p className="card-meta">No announcements yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((a, i) => (
            <div key={a.id} style={{ padding: 'var(--space-2) 0', borderBottom: i < items.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {a.title}
                    {a.priority !== 'NORMAL' && (
                      <span className={`tag ${PRIORITY_TAG[a.priority]}`}>{a.priority}</span>
                    )}
                  </p>
                  <p className="card-meta">
                    {a.createdBy ? `${a.createdBy.firstName} ${a.createdBy.lastName}` : 'KNSCL'} &bull; {formatDate(a.startDate)}
                  </p>
                </div>
                {(isPlatformOwner || a.createdById === currentUserId) && (
                  <button className="btn btn-icon" aria-label="Remove announcement" onClick={() => handleDelete(a.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="card-body" style={{ marginTop: 'var(--space-1)' }}>{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
