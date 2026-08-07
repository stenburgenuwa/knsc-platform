'use client';

import { useEffect, useState } from 'react';
import { getNews } from '@/lib/public-api';

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
        setNews(response.data?.news || []);
        setTotal(response.data?.pagination?.total || 0);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">News</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-40 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-6 mb-8">
            {news.map((article: any) => (
              <div key={article.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row">
                  <img 
                    src={article.image || '/placeholder.png'} 
                    alt={article.title}
                    className="w-full md:w-48 h-40 object-cover"
                  />
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                    <p className="text-gray-600 mb-4">{article.content?.substring(0, 200)}...</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <p>{article.author}</p>
                        <p>{article.date}</p>
                      </div>
                      <a href={`/news/${article.id}`} className="text-green-600 hover:underline">
                        Read more →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
