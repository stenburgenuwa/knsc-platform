import { getDownloads } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Downloads | Kilifi North Sub County League',
  description: 'Competition rules, registration forms, fixture lists and league documents.',
  path: '/downloads',
});

export default async function DownloadsPage() {
  const downloads = await getDownloads();

  const byCategory = downloads.reduce<Record<string, typeof downloads>>((acc, d) => {
    const key = d.category || 'Documents';
    (acc[key] ||= []).push(d);
    return acc;
  }, {});

  return (
    <div className="page-shell-narrow">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Downloads', href: '/downloads' }]} />
      <PageHeader eyebrow="Resources" title="Downloads" lead="Official league documents, forms and publications." />

      {downloads.length === 0 ? (
        <EmptyState title="No documents published yet" hint="Competition rules and forms will appear here." />
      ) : (
        Object.entries(byCategory).map(([category, list]) => (
          <section key={category} style={{ marginBottom: 'var(--space-6)' }}>
            <div className="section-head"><h2 style={{ fontSize: 20 }}>{category}</h2></div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {list.map((d) => (
                <li
                  key={d.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-divider)', flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>{d.title}</p>
                    {d.description && <p className="card-meta" style={{ margin: 0 }}>{d.description}</p>}
                  </div>
                  <a
                    className="btn btn-primary"
                    href={d.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    Download<span className="sr-only"> {d.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
