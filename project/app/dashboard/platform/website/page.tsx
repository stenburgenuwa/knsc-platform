'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, ExternalLink } from 'lucide-react';
import {
  getSiteContent,
  saveSiteContent,
  getAdminSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  getAdminDownloads,
  createDownload,
  deleteDownload,
  getAdminGallery,
  createGalleryImage,
  deleteGalleryImage,
  getContactMessages,
  updatePlayer,
  updateClub,
} from '@/lib/admin-api';
import { getPlayers, getClubs } from '@/lib/public-api';
import { CONTENT_FIELD_GROUPS } from '@/lib/site-content-keys';
import ImageUpload from '@/components/ImageUpload';
import Avatar from '@/components/Avatar';

const TABS = ['Site Content', 'Featured', 'Sponsors', 'Gallery', 'Downloads', 'Messages'] as const;
type Tab = (typeof TABS)[number];

const GALLERY_CATEGORIES = ['Match Photos', 'Club Photos', 'Player Photos', 'Award Ceremonies', 'Community Events', 'Training'];
const DOWNLOAD_CATEGORIES = ['Competition Rules', 'Registration Forms', 'Fixture Lists', 'League Handbook', 'Press Releases'];
const SPONSOR_CATEGORIES = ['Principal Partner', 'Official Partner', 'Supplier', 'Community Partner'];

export default function WebsiteAdminPage() {
  const [tab, setTab] = useState<Tab>('Site Content');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const [content, setContent] = useState<Record<string, string>>({});
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);

  const [sponsorForm, setSponsorForm] = useState({ name: '', category: '', websiteUrl: '', description: '', logoUrl: null as string | null });
  const [downloadForm, setDownloadForm] = useState({ title: '', category: '', fileUrl: '', description: '' });
  const [galleryForm, setGalleryForm] = useState({ title: '', category: '', caption: '', imageUrl: null as string | null });

  const load = async () => {
    try {
      const [contentRes, sponsorsRes, downloadsRes, galleryRes, messagesRes, playersRes, clubsRes] = await Promise.all([
        getSiteContent(),
        getAdminSponsors(),
        getAdminDownloads(),
        getAdminGallery(),
        getContactMessages(),
        getPlayers(1, 300),
        getClubs(1, 200),
      ]);
      const c = contentRes.data?.data || {};
      setContent(c);
      setHeroImage(c['hero.imageUrl'] || null);
      setSponsors(sponsorsRes.data?.data || []);
      setDownloads(downloadsRes.data?.data || []);
      setGallery(galleryRes.data?.data || []);
      setMessages(messagesRes.data?.data || []);
      setPlayers(playersRes.data?.data || []);
      setClubs(clubsRes.data?.data || []);
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Could not load website content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      await saveSiteContent({ ...content, 'hero.imageUrl': heroImage || '' });
      setStatus('Website content saved.');
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to save content.');
    }
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSponsor(sponsorForm);
      setSponsorForm({ name: '', category: '', websiteUrl: '', description: '', logoUrl: null });
      setStatus('Sponsor added.');
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to add sponsor.');
    }
  };

  const handleAddDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDownload(downloadForm);
      setDownloadForm({ title: '', category: '', fileUrl: '', description: '' });
      setStatus('Download published.');
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to add download.');
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.imageUrl) {
      setStatus('Upload an image first.');
      return;
    }
    try {
      await createGalleryImage({ ...galleryForm, imageUrl: galleryForm.imageUrl });
      setGalleryForm({ title: '', category: '', caption: '', imageUrl: null });
      setStatus('Photo added to the gallery.');
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to add photo.');
    }
  };

  const toggleFeaturedPlayer = async (id: string, featured: boolean) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, featured } : p)));
    try {
      await updatePlayer(id, { featured } as any);
    } catch {
      load();
    }
  };

  const toggleFeaturedClub = async (id: string, featured: boolean) => {
    setClubs((prev) => prev.map((c) => (c.id === id ? { ...c, featured } : c)));
    try {
      await updateClub(id, { featured } as any);
    } catch {
      load();
    }
  };

  const removeItem = async (kind: 'sponsor' | 'download' | 'gallery', id: string) => {
    try {
      if (kind === 'sponsor') await deleteSponsor(id);
      if (kind === 'download') await deleteDownload(id);
      if (kind === 'gallery') await deleteGalleryImage(id);
      load();
    } catch (err: any) {
      setStatus(err?.response?.data?.error || 'Failed to remove item.');
    }
  };

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-1)' }}>Public Website</h1>
      <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
        Everything here appears on the public site immediately. <Link href="/" target="_blank">View site <ExternalLink size={12} style={{ display: 'inline' }} /></Link>
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        {TABS.map((t) => (
          <button key={t} className={t === tab ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => { setTab(t); setStatus(null); }}>
            {t}
          </button>
        ))}
      </div>

      {status && <p className="card-meta" style={{ marginBottom: 'var(--space-3)' }}>{status}</p>}
      {loading && <p className="text-muted">Loading&hellip;</p>}

      {/* ── Site content ────────────────────────────────────── */}
      {!loading && tab === 'Site Content' && (
        <form onSubmit={handleSaveContent} className="card elev-sm">
          <h3 className="card-title">Homepage, About & Contact copy</h3>
          <ImageUpload
            label="Hero image (shown on the homepage)"
            kind="announcement"
            rounded="soft"
            name="Hero"
            value={heroImage}
            onChange={setHeroImage}
          />
          {CONTENT_FIELD_GROUPS.map((group) => (
            <fieldset key={group.group} style={{ border: 'none', padding: 0, margin: '0 0 var(--space-3)' }}>
              <legend className="eyebrow" style={{ padding: 0 }}>{group.group}</legend>
              {group.fields.map((f) => (
                <div className="field" key={f.key}>
                  <label htmlFor={f.key}>{f.label}</label>
                  {f.multiline ? (
                    <textarea
                      id={f.key}
                      className="input"
                      value={content[f.key] || ''}
                      onChange={(e) => setContent({ ...content, [f.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      id={f.key}
                      className="input"
                      value={content[f.key] || ''}
                      onChange={(e) => setContent({ ...content, [f.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </fieldset>
          ))}
          <button type="submit" className="btn btn-primary btn-block">Save website content</button>
        </form>
      )}

      {/* ── Featured ────────────────────────────────────────── */}
      {!loading && tab === 'Featured' && (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
          <div className="card elev-sm">
            <h3 className="card-title">Featured Players</h3>
            <p className="card-meta">Ticked players appear in “Players to Watch” on the homepage. With none ticked, the top scorers show instead.</p>
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 460, overflowY: 'auto' }}>
              {players.map((p) => (
                <label key={p.id} className="radio" style={{ justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Avatar src={p.photoUrl} name={`${p.firstName} ${p.lastName}`} size={28} />
                    <span>{p.firstName} {p.lastName} <span className="text-muted">· {p.club?.name}</span></span>
                  </span>
                  <input type="checkbox" checked={!!p.featured} onChange={(e) => toggleFeaturedPlayer(p.id, e.target.checked)} style={{ position: 'static', width: 16, height: 16, opacity: 1, pointerEvents: 'auto' }} />
                </label>
              ))}
            </div>
          </div>

          <div className="card elev-sm">
            <h3 className="card-title">Featured Clubs</h3>
            <p className="card-meta">Highlighted in club listings.</p>
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 460, overflowY: 'auto' }}>
              {clubs.map((c) => (
                <label key={c.id} className="radio" style={{ justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Avatar src={c.logoUrl} name={c.name} size={28} rounded="soft" />
                    <span>{c.name}</span>
                  </span>
                  <input type="checkbox" checked={!!c.featured} onChange={(e) => toggleFeaturedClub(c.id, e.target.checked)} style={{ position: 'static', width: 16, height: 16, opacity: 1, pointerEvents: 'auto' }} />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sponsors ────────────────────────────────────────── */}
      {!loading && tab === 'Sponsors' && (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
          <form onSubmit={handleAddSponsor} className="card elev-sm">
            <h3 className="card-title">Add a sponsor</h3>
            <div className="field">
              <label htmlFor="s-name">Name</label>
              <input id="s-name" className="input" required value={sponsorForm.name} onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="s-cat">Partnership category</label>
              <select id="s-cat" className="input" value={sponsorForm.category} onChange={(e) => setSponsorForm({ ...sponsorForm, category: e.target.value })}>
                <option value="">Select&hellip;</option>
                {SPONSOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="s-url">Website</label>
              <input id="s-url" type="url" className="input" placeholder="https://" value={sponsorForm.websiteUrl} onChange={(e) => setSponsorForm({ ...sponsorForm, websiteUrl: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="s-desc">Description</label>
              <textarea id="s-desc" className="input" value={sponsorForm.description} onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })} />
            </div>
            <ImageUpload label="Logo" kind="club" rounded="soft" name={sponsorForm.name} value={sponsorForm.logoUrl} onChange={(url) => setSponsorForm({ ...sponsorForm, logoUrl: url })} />
            <button type="submit" className="btn btn-primary btn-block">Add sponsor</button>
          </form>

          <div className="card elev-sm">
            <h3 className="card-title">Sponsors ({sponsors.length})</h3>
            {sponsors.length === 0 ? <p className="card-meta">No sponsors yet.</p> : sponsors.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
                  <Avatar src={s.logoUrl} name={s.name} size={32} rounded="soft" />
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)' }}>{s.name}</span>
                    <span className="card-meta" style={{ margin: 0 }}>{s.category || 'Partner'}</span>
                  </span>
                </span>
                <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => updateSponsor(s.id, { active: !s.active }).then(load)}>
                    {s.active ? 'Hide' : 'Show'}
                  </button>
                  <button className="btn btn-icon" aria-label={`Remove ${s.name}`} onClick={() => removeItem('sponsor', s.id)}><Trash2 size={14} /></button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gallery ─────────────────────────────────────────── */}
      {!loading && tab === 'Gallery' && (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
          <form onSubmit={handleAddImage} className="card elev-sm">
            <h3 className="card-title">Add a photo</h3>
            <div className="field">
              <label htmlFor="g-title">Title</label>
              <input id="g-title" className="input" value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="g-cat">Category</label>
              <select id="g-cat" className="input" value={galleryForm.category} onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}>
                <option value="">Select&hellip;</option>
                {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="g-caption">Caption</label>
              <input id="g-caption" className="input" value={galleryForm.caption} onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })} />
            </div>
            <ImageUpload label="Photograph" kind="announcement" rounded="soft" name={galleryForm.title || 'Photo'} value={galleryForm.imageUrl} onChange={(url) => setGalleryForm({ ...galleryForm, imageUrl: url })} />
            <button type="submit" className="btn btn-primary btn-block">Add to gallery</button>
          </form>

          <div className="card elev-sm">
            <h3 className="card-title">Gallery ({gallery.length})</h3>
            {gallery.length === 0 ? <p className="card-meta">No photos yet.</p> : (
              <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
                {gallery.map((g) => (
                  <figure key={g.id} style={{ margin: 0, position: 'relative' }}>
                    <img src={g.imageUrl} alt={g.title || ''} className="media-4x3" />
                    <figcaption style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                      <span>{g.title || g.category || 'Untitled'}</span>
                      <button className="btn btn-icon" aria-label="Remove photo" onClick={() => removeItem('gallery', g.id)}><Trash2 size={13} /></button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Downloads ───────────────────────────────────────── */}
      {!loading && tab === 'Downloads' && (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
          <form onSubmit={handleAddDownload} className="card elev-sm">
            <h3 className="card-title">Publish a document</h3>
            <div className="field">
              <label htmlFor="d-title">Title</label>
              <input id="d-title" className="input" required value={downloadForm.title} onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="d-cat">Category</label>
              <select id="d-cat" className="input" value={downloadForm.category} onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value })}>
                <option value="">Select&hellip;</option>
                {DOWNLOAD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="d-url">File link</label>
              <input id="d-url" type="url" className="input" required placeholder="https://…" value={downloadForm.fileUrl} onChange={(e) => setDownloadForm({ ...downloadForm, fileUrl: e.target.value })} />
              <p className="card-meta">Paste a link to the document (Google Drive, Dropbox, or any public URL).</p>
            </div>
            <div className="field">
              <label htmlFor="d-desc">Description</label>
              <input id="d-desc" className="input" value={downloadForm.description} onChange={(e) => setDownloadForm({ ...downloadForm, description: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Publish document</button>
          </form>

          <div className="card elev-sm">
            <h3 className="card-title">Documents ({downloads.length})</h3>
            {downloads.length === 0 ? <p className="card-meta">Nothing published yet.</p> : downloads.map((d) => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)' }}>{d.title}</span>
                  <span className="card-meta" style={{ margin: 0 }}>{d.category || 'Document'}</span>
                </span>
                <button className="btn btn-icon" aria-label={`Remove ${d.title}`} onClick={() => removeItem('download', d.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages ────────────────────────────────────────── */}
      {!loading && tab === 'Messages' && (
        <div className="card elev-sm">
          <h3 className="card-title">Contact form messages ({messages.length})</h3>
          {messages.length === 0 ? <p className="card-meta">No messages received yet.</p> : messages.map((m) => (
            <div key={m.id} style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-divider)' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{m.subject || 'No subject'}</p>
              <p className="card-meta">
                {m.name} · <a href={`mailto:${m.email}`}>{m.email}</a> · {new Date(m.createdAt).toLocaleString('en-GB')}
              </p>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: 'var(--space-1)' }}>{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
