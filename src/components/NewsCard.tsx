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
  const timeAgo = formatDistanceToNow(news.createdAt, { addSuffix: true, locale: tr });

  // Büyük/Manşet kartı (Öne çıkan haber)
  if (featured) {
    return (
      <Link to={`/haber/${news.slug}`} className="group relative block overflow-hidden rounded-xl h-[400px] md:h-[500px]">
        <img 
          src={news.imageUrl} 
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
             <span className="bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-1 px-2.5 rounded-sm">
              {news.category}
            </span>
            <span className="text-gray-300 text-xs font-medium">{timeAgo}</span>
          </div>
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-white leading-tight mb-2 group-hover:text-red-100 transition-colors">
            {news.title}
          </h2>
          <p className="text-gray-300 line-clamp-2 md:text-lg">
            {news.summary}
          </p>
        </div>
      </Link>
    );
  }

  // Standart Liste Kartı
  return (
    <Link to={`/haber/${news.slug}`} className="group flex flex-col items-start gap-4 h-full">
      <div className="w-full relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-200">
        <img 
            src={news.imageUrl} 
            alt={news.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
            <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
              {news.category}
            </span>
            <span className="text-gray-500 text-xs">{timeAgo}</span>
        </div>
        <h3 className="font-serif text-xl font-bold text-gray-900 leading-snug group-hover:text-red-700 transition-colors mb-2">
          {news.title}
        </h3>
        <p className="text-gray-600 line-clamp-2 text-sm">
          {news.summary}
        </p>
      </div>
    </Link>
  );
}
