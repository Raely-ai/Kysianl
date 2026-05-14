import React from 'react';
import NewsCardGridFour from '../NewsCardGridFour';

export default function FourNewsGridBlock({ block, newsList }: { block: any; newsList: any[] }) {
  const getNewsByCat = (slug: string, limit: number) => {
    let filtered = newsList;
    if (slug) {
      filtered = newsList.filter(n => n.categorySlug === slug || n.category === slug);
    }
    return filtered.slice(0, limit);
  };

  const blockNews = getNewsByCat(block.categorySlug, block.limit || 4);

  return (
    <div className="mb-8">
      {block.title && !block.settings?.hideTitle && (
        <h2 className="font-serif font-black text-2xl md:text-3xl mb-6 border-b-[3px] border-gray-900 pb-3 flex items-center gap-3">
          <div className="w-2.5 h-6 bg-red-700"></div>
          {block.title}
        </h2>
      )}
      <NewsCardGridFour newsList={blockNews} />
    </div>
  );
}
