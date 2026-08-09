import { getSiteContent } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, PageHeader, SectionHead } from '@/components/public';
import ContactForm from '@/components/public/ContactForm';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Contact | Kilifi North Sub County League',
  description: 'Get in touch with the Kilifi North Sub County League office.',
  path: '/contact',
});

export default async function ContactPage() {
  const content = await getSiteContent();

  const socials = [
    { label: 'Facebook', href: content['social.facebook'] },
    { label: 'X (Twitter)', href: content['social.twitter'] },
    { label: 'Instagram', href: content['social.instagram'] },
  ].filter((s) => s.href);

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />
      <PageHeader eyebrow="Get in touch" title="Contact" lead="Questions about registration, fixtures or partnership? The league office is here." />

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
        <div>
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <SectionHead title="League Office" />
            <address style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div>
                <p className="stat-label" style={{ margin: 0 }}>Address</p>
                <p style={{ margin: 0 }}>{content['contact.address'] || 'Kilifi North Sub County, Kilifi County, Kenya'}</p>
              </div>
              <div>
                <p className="stat-label" style={{ margin: 0 }}>Email</p>
                <p style={{ margin: 0 }}>
                  <a href={`mailto:${content['contact.email'] || 'info@knscl.co.ke'}`}>
                    {content['contact.email'] || 'info@knscl.co.ke'}
                  </a>
                </p>
              </div>
              {content['contact.phone'] && (
                <div>
                  <p className="stat-label" style={{ margin: 0 }}>Phone</p>
                  <p style={{ margin: 0 }}>
                    <a href={`tel:${content['contact.phone'].replace(/\s+/g, '')}`}>{content['contact.phone']}</a>
                  </p>
                </div>
              )}
            </address>
          </section>

          {socials.length > 0 && (
            <section style={{ marginBottom: 'var(--space-6)' }}>
              <SectionHead title="Follow the league" />
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {socials.map((s) => (
                  <li key={s.label}>
                    <a className="btn btn-secondary" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content['contact.mapEmbed'] && (
            <section>
              <SectionHead title="Find us" />
              <div style={{ aspectRatio: '16 / 10', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-divider)' }}>
                <iframe
                  src={content['contact.mapEmbed']}
                  title="Map to the league office"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ width: '100%', height: '100%', border: 0 }}
                />
              </div>
            </section>
          )}
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
