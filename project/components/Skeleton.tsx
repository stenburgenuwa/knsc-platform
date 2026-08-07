// Shimmering placeholders shown while public/dashboard data loads, standing in
// for the real card/row/avatar shapes so the layout doesn't jump on arrival.

export function SkeletonCard() {
  return (
    <div className="card elev-sm">
      <span className="skeleton skeleton-text" style={{ width: '40%' }} />
      <span className="skeleton skeleton-text" style={{ width: '75%', height: 16 }} />
      <span className="skeleton skeleton-text" style={{ width: '55%' }} />
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <span className="skeleton skeleton-text" style={{ width: i === 0 ? '60%' : '80%' }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  );
}
