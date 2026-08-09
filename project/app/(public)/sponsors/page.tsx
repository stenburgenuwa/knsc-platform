import Link from 'next/link';
import { getSponsors } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, EmptyState, PageHeader, SectionHead, SponsorCard } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Sponsors & Partners | Kilifi North Sub County League',
  description: 'The businesses and organisations backing football in Kilifi North.',
  path: '/sponsors',
});

export default async function SponsorsPage() {
  const sponsors = await getSponsors();

  const byCategory = sponsors.reduce<Record<string, typeof sponsors>>((acc, s) => {
    const key = s.category || 'Partners';
    (acc[key] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="page-shell">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Sponsors', href: '/sponsors' }]} />
      <PageHeader
        eyebrow="Commercial"
        title="Sponsors & Partners"
        lead="Local football runs on local support. These organisations make the season possible."
      />

      {sponsors.length === 0 ? (
        <EmptyState title="No sponsors listed yet" hint="Interested in partnering with the league? Get in touch." />
      ) : (
        Object.entries(byCategory).map(([category, list]) => (
          <section key={category} style={{ marginBottom: 'var(--space-8)' }}>
            <SectionHead title={category} />
            <div className="logo-wall">
              {list.map((sponsor) => <SponsorCard key={sponsor.id} sponsor={sponsor} />)}
            </div>
            {list.some((s) => s.description) && (
              <dl style={{ marginTop: 'var(--space-4)' }}>
                {list.filter((s) => s.description).map((s) => (
                  <div key={s.id} style={{ marginBottom: 'var(--space-2)' }}>
                    <dt style={{ fontFamily: 'var(--font-heading)' }}>{s.name}</dt>
                    <dd className="text-muted" style={{ margin: 0, fontSize: 14 }}>{s.description}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        ))
      )}

      <div className="card elev-sm" style={{ marginTop: 'var(--space-6)' }}>
        <h3 className="card-title">Partner with the league</h3>
        <p className="card-body">
          Sponsorship supports match officials, equipment and youth development across Kilifi North.
        </p>
        <Link href="/contact" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Contact the league office</Link>
      </div>
    </div>
  );
}
