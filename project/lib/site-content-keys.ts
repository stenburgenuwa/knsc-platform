// Keys the Platform Owner may edit through /api/site-content. Anything not on
// this list is rejected so the key/value store can't become a dumping ground.
// Lives outside the route file because Next.js route modules may only export
// their recognised handler names.
export const EDITABLE_KEYS = [
  'hero.title',
  'hero.subtitle',
  'hero.imageUrl',
  'hero.ctaLabel',
  'hero.ctaHref',
  'league.season',
  'league.tagline',
  'about.history',
  'about.vision',
  'about.mission',
  'about.objectives',
  'about.leadership',
  'about.structure',
  'contact.address',
  'contact.email',
  'contact.phone',
  'contact.mapEmbed',
  'social.facebook',
  'social.twitter',
  'social.instagram',
] as const;

export const CONTENT_FIELD_GROUPS: { group: string; fields: { key: string; label: string; multiline?: boolean }[] }[] = [
  {
    group: 'Homepage hero',
    fields: [
      { key: 'hero.title', label: 'Headline' },
      { key: 'hero.subtitle', label: 'Sub-heading', multiline: true },
      { key: 'hero.ctaLabel', label: 'Button label' },
      { key: 'hero.ctaHref', label: 'Button link (e.g. /fixtures)' },
    ],
  },
  {
    group: 'League identity',
    fields: [
      { key: 'league.season', label: 'Current season (e.g. 2026)' },
      { key: 'league.tagline', label: 'Footer tagline', multiline: true },
    ],
  },
  {
    group: 'About page',
    fields: [
      { key: 'about.history', label: 'History', multiline: true },
      { key: 'about.vision', label: 'Vision', multiline: true },
      { key: 'about.mission', label: 'Mission', multiline: true },
      { key: 'about.objectives', label: 'Objectives (one per line)', multiline: true },
      { key: 'about.leadership', label: 'Leadership (one per line)', multiline: true },
      { key: 'about.structure', label: 'League structure', multiline: true },
    ],
  },
  {
    group: 'Contact details',
    fields: [
      { key: 'contact.address', label: 'Office address', multiline: true },
      { key: 'contact.email', label: 'Email' },
      { key: 'contact.phone', label: 'Phone' },
      { key: 'contact.mapEmbed', label: 'Map embed URL (Google Maps “embed” src)' },
    ],
  },
  {
    group: 'Social media',
    fields: [
      { key: 'social.facebook', label: 'Facebook URL' },
      { key: 'social.twitter', label: 'X (Twitter) URL' },
      { key: 'social.instagram', label: 'Instagram URL' },
    ],
  },
];
