import React from 'react';
import NewsCard from '../NewsCard';
import { Link } from 'react-router-dom';

export default function CategoryNewsGrid({ block, newsList }: { block: any; newsList: any[] }) {
  const getNewsByCat = (slug: string, limit: number) => {
    let filtered = newsList;
    if (slug) {
      filtered = newsList.filter(n => n.categorySlug === slug || n.category === slug);
    }
    return filtered.slice(0, limit);
  };

  const blockNews = getNewsByCat(block.categorySlug, block.limit || 10);

  return (
    <div className="mb-8">
      {(!block.settings?.hideTitle) && (
        <div className="border-b-[3px] border-gray-900 pb-3 mb-6 flex justify-between items-end">
          <h2 className="font-serif font-black text-2xl md:text-3xl text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-2.5 h-6 bg-red-700"></div>
            {block.title || 'Haberler'}
          </h2>
          {block.categorySlug && (
            <Link to={`/kategori/${block.categorySlug}`} className="text-red-700 text-[13px] uppercase tracking-widest font-black hover:text-red-800 transition">
              Tümünü Gör
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {blockNews.map((news: any) => (
          <div key={news.id}>
            <NewsCard news={news} />
          </div>
        ))}
        {blockNews.length === 0 && (
          <p className="text-gray-500 italic col-span-2">Şu an gösterilecek haber bulunmuyor.</p>
        )}
      </div>
    </div>
  );
}
