import React from 'react';
import { Link } from 'react-router-dom';

export default function PopularNewsBlock({ block, newsList }: { block: any; newsList: any[] }) {
  const mostRead = [...newsList]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, block.limit || 5);

  return (
    <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      {(!block.settings?.hideTitle) && (
        <div className="border-b-[3px] border-gray-900 pb-3 mb-6">
          <h3 className="font-serif font-black text-[22px] text-gray-900 tracking-tight flex items-center gap-2">
            <div className="w-2.5 h-6 bg-red-700"></div>
            {block.title || 'Çok Okunanlar'}
          </h3>
        </div>
      )}
      <div className="flex flex-col gap-5">
        {mostRead.map((news, idx) => (
          <Link to={`/haber/${news.slug}`} key={news.id} className="flex gap-4 group">
            <div className="text-3xl font-black text-gray-200 group-hover:text-red-200 transition-colors">
              {(idx + 1).toString().padStart(2, '0')}
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-sm text-gray-800 leading-snug group-hover:text-red-700 line-clamp-2">
                {news.title}
              </h4>
            </div>
          </Link>
        ))}
        {mostRead.length === 0 && (
          <p className="text-gray-500 italic text-sm">Veri yok</p>
        )}
      </div>
    </div>
  );
}
