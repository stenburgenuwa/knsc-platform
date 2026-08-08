import { getSiteContent, getPublicClubs, getSponsors } from '@/lib/public-data';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs, PageHeader } from '@/components/public';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'About | Kilifi North Sub County League',
  description: 'The history, vision and structure of the Kilifi North Sub County League.',
  path: '/about',
});

// Copy is editable by the Platform Owner via SiteContent; the fallbacks below
// keep the page complete before anything has been written.
const FALLBACK: Record<string, string> = {
  'about.history':
    'The Kilifi North Sub County League brings together clubs from across Kilifi North to compete in an organised, officiated football competition. The league exists to give local players a structured season, a verifiable record of their performances, and a visible pathway into county and national football.',
  'about.vision': 'To be the best-run sub county football competition in Kenya — transparent, well officiated, and genuinely useful to the players who make it.',
  'about.mission': 'To organise a fair, well-documented league season for clubs in Kilifi North, and to publish every fixture, result and record openly.',
  'about.objectives':
    'Run a complete, fairly officiated season.\nRegister and verify every player properly.\nPublish fixtures, results and standings promptly.\nGive scouts and county selectors reliable data.\nGrow participation across the sub county.',
  'about.structure':
    'The league is administered by the Platform Owner, with a League Manager responsible for competition operations and a Referee Manager responsible for match officials. Each club is represented by a Team Manager who registers players and submits matchday team sheets.',
};

function Prose({ text }: { text: string }) {
  return (
    <div style={{ maxWidth: 720 }}>
      {text.split('\n').filter(Boolean).map((line, i) => (
        <p key={i} style={{ marginBottom: 'var(--space-2)' }}>{line}</p>
      ))}
    </div>
  );
}

export default async function AboutPage() {
  const [content, clubs, sponsors] = await Promise.all([getSiteContent(), getPublicClubs(), getSponsors()]);
  const value = (key: string) => content[key] || FALLBACK[key] || '';

  const sections = [
    { title: 'History', key: 'about.history' },
    { title: 'Vision', key: 'about.vision' },
    { title: 'Mission', key: 'about.mission' },
    { title: 'Objectives', key: 'about.objectives' },
    { title: 'League Structure', key: 'about.structure' },
  ];

  return (
    <div className="page-shell-narrow">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About', href: '/about' }]} />
      <PageHeader eyebrow="The League" title="About KNSCL" lead="Who we are and how the competition is run." />

      <div className="stat-strip" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-cell"><span className="stat-value">{clubs.length}</span><span className="stat-label">Clubs</span></div>
        <div className="stat-cell">
          <span className="stat-value">{clubs.reduce((sum, c) => sum + (c._count?.players ?? 0), 0)}</span>
          <span className="stat-label">Players</span>
        </div>
        <div className="stat-cell"><span className="stat-value">{content['league.season'] || '2026'}</span><span className="stat-label">Season</span></div>
        <div className="stat-cell"><span className="stat-value">{sponsors.length}</span><span className="stat-label">Partners</span></div>
      </div>

      {sections.map((section) => (
        <section key={section.key} style={{ marginBottom: 'var(--space-6)' }}>
          <div className="section-head"><h2 style={{ fontSize: 22 }}>{section.title}</h2></div>
          <Prose text={value(section.key)} />
        </section>
      ))}

      {content['about.leadership'] && (
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <div className="section-head"><h2 style={{ fontSize: 22 }}>Leadership</h2></div>
          <Prose text={content['about.leadership']} />
        </section>
      )}

      {sponsors.length > 0 && (
        <section>
          <div className="section-head"><h2 style={{ fontSize: 22 }}>Partners</h2></div>
          <p className="text-muted">
            {sponsors.map((s) => s.name).join(' · ')}
          </p>
        </section>
      )}
    </div>
  );
}
