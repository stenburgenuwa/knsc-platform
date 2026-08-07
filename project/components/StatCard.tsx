export default function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'accent' | 'warning';
}) {
  const color = tone === 'warning' ? 'var(--color-accent-800)' : tone === 'accent' ? 'var(--color-accent-700)' : 'var(--color-text)';
  return (
    <div className="card elev-sm">
      <span className="card-kicker">{label}</span>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 34, color }}>{value}</span>
    </div>
  );
}
