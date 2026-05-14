import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string;
  category: string;
  isBreaking: boolean;
  createdAt: number;
}

interface NewsCardProps {
  news: NewsItem;
  featured?: boolean;
}

export default function NewsCard({ news, featured = false }: NewsCardProps) {
  let timeAgo = "";
  try {
    timeAgo = news?.createdAt ? formatDistanceToNow(news.createdAt, { addSuffix: true, locale: tr }) : "";
  } catch (e) {
    timeAgo = "";
  }

  // Büyük/Manşet kartı (Öne çıkan haber)
  if (featured) {
    return (
      <Link to={`/haber/${news.slug}`} className="group relative block overflow-hidden rounded-2xl h-[400px] md:h-[500px] shadow-sm hover:shadow-xl transition-all">
        <img 
          src={news.imageUrl || `https://picsum.photos/seed/${news.id || Math.random()}/800/600`} 
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-4">
             <span className="bg-red-700 text-white text-[11px] font-black uppercase tracking-widest py-1 px-3 rounded">
              {news.category}
            </span>
            <span className="text-gray-300 text-xs font-semibold tracking-wide">{timeAgo}</span>
          </div>
          <h2 className="font-serif text-3xl md:text-[42px] font-black text-white leading-[1.1] mb-3 group-hover:text-red-100 transition-colors drop-shadow-md">
            {news.title}
          </h2>
          <p className="text-gray-200 line-clamp-2 md:text-[17px] font-medium leading-relaxed max-w-3xl drop-shadow-sm">
            {news.summary}
          </p>
        </div>
      </Link>
    );
  }

  // Standart Liste Kartı
  return (
    <Link to={`/haber/${news.slug}`} className="group flex flex-col items-start gap-4 h-full bg-white rounded-xl p-3 md:p-4 shadow-sm hover:shadow-lg transition-all border border-gray-100">
      <div className="w-full relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
        <img 
            src={news.imageUrl || `https://picsum.photos/seed/${news.id || Math.random()}/600/450`} 
            alt={news.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 flex flex-col pt-1">
        <div className="flex items-center gap-3 mb-2.5">
            <span className="text-red-700 text-[11px] font-black uppercase tracking-widest">
              {news.category}
            </span>
            <span className="text-gray-400 text-[11px] font-semibold tracking-wide">{timeAgo}</span>
        </div>
        <h3 className="font-serif text-xl md:text-[22px] font-black text-gray-900 leading-[1.2] group-hover:text-red-700 transition-colors mb-2.5">
          {news.title}
        </h3>
        <p className="text-gray-600 line-clamp-2 text-[15px] leading-relaxed">
          {news.summary}
        </p>
      </div>
    </Link>
  );
}
