// Renders a photo/crest when one exists, otherwise a neutral initials badge
// so lists stay visually even rather than showing broken-image icons.
// No directive: renders on the server for public pages, and is bundled into
// the client where a dashboard imports it.
export default function Avatar({
  src,
  name,
  size = 40,
  rounded = 'circle',
}: {
  src?: string | null;
  name: string;
  size?: number;
  /** Player photos use `square` — a passport photo is not a circle, and
      cropping one into a disc cuts off the top of the head. */
  rounded?: 'circle' | 'soft' | 'square';
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const borderRadius = rounded === 'circle' ? '50%' : rounded === 'square' ? '0' : 'var(--radius-md)';

  const shared: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    flex: 'none',
    border: '1px solid var(--color-divider)',
  };

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- sources are data URLs or Blob CDN URLs, not statically known
    return <img src={src} alt={name} className="avatar" style={{ ...shared, objectFit: 'cover', background: 'var(--color-neutral-100)' }} />;
  }

  return (
    <span
      aria-hidden="true"
      className="avatar"
      style={{
        ...shared,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-neutral-100)',
        color: 'var(--color-neutral-600)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: Math.max(10, Math.round(size * 0.36)),
        letterSpacing: '0.02em',
      }}
    >
      {initials || '?'}
    </span>
  );
}
