import React from 'react';
import NewsSlider from '../NewsSlider';
import { Link } from 'react-router-dom';

export default function SliderPlusTwo({ block, newsList }: { block: any; newsList: any[] }) {
  const getNewsByCat = (slug: string, limit: number) => {
    let filtered = newsList;
    if (slug) {
      filtered = newsList.filter(n => n.categorySlug === slug || n.category === slug);
    }
    return filtered.slice(0, limit);
  };

  const blockNews = getNewsByCat(block.categorySlug, block.limit || 7);
  const sNews = blockNews.slice(0, Math.max(1, blockNews.length - 2));
  const sideNews = blockNews.slice(Math.max(1, blockNews.length - 2), blockNews.length);

  return (
    <div className="mb-8">
      {block.title && !block.settings?.hideTitle && (
        <h2 className="font-serif font-black text-2xl md:text-3xl mb-6 border-b-[3px] border-gray-900 pb-3 flex items-center gap-3">
          <div className="w-2.5 h-6 bg-red-700"></div>
          {block.title}
        </h2>
      )}
      <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[450px]">
        <div className={sideNews.length > 0 ? "w-full md:w-2/3 h-[300px] md:h-full" : "w-full h-[300px] md:h-full"}>
          <NewsSlider newsList={sNews} />
        </div>
        {sideNews.length > 0 && (
          <div className="w-full md:w-1/3 flex flex-col gap-4 h-full">
            {sideNews.map((news: any) => (
              <Link to={`/haber/${news.slug}`} key={news.id} className="relative block flex-1 rounded-xl overflow-hidden group">
                <img
                  src={news.imageUrl || `https://picsum.photos/seed/${news.id}/300/250`}
                  alt={news.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-sm leading-tight group-hover:text-red-100 line-clamp-3">
                    {news.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
