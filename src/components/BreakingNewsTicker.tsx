import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext';

export default function BreakingNewsTicker() {
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const { initData } = useAppContext();

  const breakingSettings = initData?.settings?.breaking || { active: false, limit: 10, onlyBreaking: true };

  useEffect(() => {
    if (!breakingSettings.active) return;
    
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          let breaking = data.data;
          if (breakingSettings.onlyBreaking) {
             breaking = breaking.filter((n: any) => n.isBreaking);
          }
          setBreakingNews(breaking.slice(0, breakingSettings.limit));
        }
      })
      .catch(err => console.error(err));
  }, [breakingSettings.active, breakingSettings.limit, breakingSettings.onlyBreaking]);

  if (!breakingSettings.active || breakingNews.length === 0) return null;

  return (
    <div className="bg-red-700 text-white overflow-hidden py-2 px-4 shadow-sm z-10 relative border-b border-red-800">
      <div className="max-w-7xl mx-auto flex items-center">
        <span className="font-bold whitespace-nowrap bg-white text-red-700 px-2 py-1 rounded text-[10px] uppercase tracking-wider mr-4 shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
          Son Dakika
        </span>
        <div className="w-full overflow-hidden">
          {/* Simple CSS ticker animation */}
          <div className="animate-ticker inline-block whitespace-nowrap">
            {breakingNews.map((news, i) => (
              <span key={news.id} className="inline-block mr-12 text-[13px] font-medium tracking-wide">
                <Link to={`/haber/${news.slug}`} className="hover:underline hover:text-red-100 transition-colors">
                  {news.title}
                </Link>
                {i < breakingNews.length - 1 && <span className="mx-6 text-red-400 opacity-50">&bull;</span>}
              </span>
            ))}
            {/* DUPLICATE SET to prevent stuttering empty breaks during animation */}
             <span className="mx-6 text-red-400 opacity-50">&bull;</span>
             {breakingNews.map((news, i) => (
              <span key={`${news.id}-dup`} className="inline-block mr-12 text-[13px] font-medium tracking-wide">
                <Link to={`/haber/${news.slug}`} className="hover:underline hover:text-red-100 transition-colors">
                  {news.title}
                </Link>
                {i < breakingNews.length - 1 && <span className="mx-6 text-red-400 opacity-50">&bull;</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 35s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
