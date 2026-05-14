import { Link } from 'react-router-dom';

export default function NewsCardGridFour({ newsList }: { newsList: any[] }) {
  if (!newsList || newsList.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
      {newsList.map((news) => (
        <Link key={news.id} to={`/haber/${news.slug}`} className="group relative block h-56 md:h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow bg-gray-100">
           <img 
              src={news.imageUrl || `https://picsum.photos/seed/${news.id}/500/400`} 
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
           <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
             <h3 className="text-white font-serif font-bold text-sm md:text-[17px] leading-snug group-hover:text-red-100 transition-colors line-clamp-3 md:line-clamp-4">
               {news.title}
             </h3>
           </div>
        </Link>
      ))}
    </div>
  );
}
