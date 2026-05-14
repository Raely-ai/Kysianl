import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NewsSlider({ newsList }: { newsList: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (newsList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [newsList.length]);

  if (!newsList || newsList.length === 0) {
    return (
      <div className="w-full h-[450px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 border border-gray-200">
        Manşet haberi bulunamadı.
      </div>
    );
  }

  const currentNews = newsList[currentIndex];

  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden group">
      <Link to={`/haber/${currentNews.slug}`}>
        <img 
          src={currentNews.imageUrl || `https://picsum.photos/seed/${currentNews.id}/800/600`} 
          alt={currentNews.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          {currentNews.category && (
            <span className="bg-red-600 text-white text-xs font-bold uppercase px-3 py-1 rounded inline-block mb-3">
              {currentNews.category}
            </span>
          )}
          <h2 className="text-white font-serif font-black text-3xl md:text-4xl leading-tight mb-2 drop-shadow-lg group-hover:text-red-100 transition-colors">
            {currentNews.title}
          </h2>
        </div>
      </Link>
      
      {/* Indicators */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {newsList.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-red-600 w-6' : 'bg-white/60 hover:bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
}
