import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          const filtered = data.data.filter((n: any) => n.categorySlug === slug || n.category === slug);
          setNewsList(filtered);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const catName = slug?.replace('-', ' ')?.toUpperCase();

  return (
    <div className="bg-transparent min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Helmet>
          <title>{catName} - Kayserianlık</title>
        </Helmet>
        
        <div className="border-b-[3px] border-gray-900 pb-4 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
             <span className="text-red-700 font-bold tracking-widest text-[11px] uppercase mb-1 block">Kategori İzleme</span>
             <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 capitalize tracking-tight flex items-center gap-3">
               <div className="w-2.5 h-8 bg-red-700 hidden md:block"></div>
               {catName}
             </h1>
           </div>
           <span className="text-gray-500 font-semibold tracking-wide bg-gray-100 px-3 py-1 rounded-full text-sm">
             {newsList.length} Haber İçeriği
           </span>
        </div>

        {newsList.length === 0 ? (
           <div className="bg-white p-20 rounded-2xl border border-gray-100 text-center shadow-sm">
             <div className="text-gray-200 mb-6">
               <svg className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7M4 6h16" />
               </svg>
             </div>
             <p className="text-gray-500 font-medium text-xl mb-6">Bu kategoride henüz yayınlanmış haber bulunmuyor.</p>
             <Link to="/" className="inline-block bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 font-bold shadow-sm transition">
               Ana Sayfaya Dön
             </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 gap-y-10">
             {newsList.map((news: any) => (
               <div key={news.id}>
                 <NewsCard news={news} />
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
