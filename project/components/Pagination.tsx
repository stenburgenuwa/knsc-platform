'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
      <button
        className="btn btn-icon btn-secondary"
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-muted" style={{ fontSize: 13 }}>
        Page {page}{totalPages ? ` of ${totalPages}` : ''}
      </span>
      <button
        className="btn btn-icon btn-secondary"
        disabled={totalPages > 0 && page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
