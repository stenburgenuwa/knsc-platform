import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: 'var(--space-4)',
      }}
    >
      <p className="card-kicker">404</p>
      <h1 style={{ fontWeight: 400 }}>Page not found</h1>
      <p className="text-muted" style={{ maxWidth: 420, marginBottom: 'var(--space-4)' }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
