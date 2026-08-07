'use client';

// Renders a photo/crest when one exists, otherwise a neutral initials badge
// so lists stay visually even rather than showing broken-image icons.
export default function Avatar({
  src,
  name,
  size = 40,
  rounded = 'circle',
}: {
  src?: string | null;
  name: string;
  size?: number;
  rounded?: 'circle' | 'soft';
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const borderRadius = rounded === 'circle' ? '50%' : 'var(--radius-md)';

  const shared: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    flex: 'none',
    border: '1px solid var(--color-divider)',
  };

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- sources are data URLs or Blob CDN URLs, not statically known
    return <img src={src} alt={name} style={{ ...shared, objectFit: 'cover', background: 'var(--color-neutral-100)' }} />;
  }

  return (
    <span
      aria-hidden="true"
      style={{
        ...shared,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-neutral-100)',
        color: 'var(--color-neutral-600)',
        fontFamily: 'var(--font-heading)',
        fontSize: Math.max(10, Math.round(size * 0.36)),
        letterSpacing: '0.02em',
      }}
    >
      {initials || '?'}
    </span>
  );
}
