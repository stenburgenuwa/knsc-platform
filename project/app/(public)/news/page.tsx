'use client';

import { useEffect, useState } from 'react';
import { getNews } from '@/lib/public-api';
import Pagination from '@/components/Pagination';

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await getNews(page, 10);
        setNews(response.data?.data || []);
        setTotal(response.data?.pagination?.total || 0);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [page]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1 style={{ fontWeight: 400, marginBottom: 'var(--space-6)' }}>News</h1>

      {!loading && news.length === 0 && <p className="text-muted">No news published yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span className="skeleton skeleton-text" style={{ width: '30%' }} />
            <span className="skeleton skeleton-text" style={{ width: '60%', height: 18 }} />
            <span className="skeleton skeleton-text" style={{ width: '90%' }} />
            <span className="skeleton skeleton-text" style={{ width: '80%' }} />
          </div>
        )}
        {news.map((article: any) => (
          <article key={article.id}>
            <p className="card-kicker">{formatDate(article.startDate || article.createdAt)}</p>
            <h3 style={{ marginBottom: 'var(--space-1)' }}>{article.title}</h3>
            <p className="text-muted">{article.message}</p>
            <div className="hr" />
          </article>
        ))}
      </div>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}
