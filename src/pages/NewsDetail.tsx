import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Helmet } from "react-helmet-async";

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/news/${slug}`)
      .then(res => {
        if (!res.ok) {
           throw new Error("Haber bulunamadı");
        }
        return res.json();
      })
      .then(data => {
        setNews(data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
     return (
        <div className="max-w-4xl mx-auto px-4 py-32 flex justify-center">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-700 rounded-full animate-spin"></div>
        </div>
     );
  }

  if (error || !news) {
     return (
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
           <Helmet>
             <title>İçerik Bulunamadı - Kayserianlık</title>
           </Helmet>
           <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">İçerik Bulunamadı</h1>
           <p className="text-gray-600 mb-8">Aradığınız haber yayından kaldırılmış veya taşınmış olabilir.</p>
           <Link to="/" className="inline-block bg-red-700 text-white px-6 py-3 rounded hover:bg-red-800 transition">
              Ana Sayfaya Dön
           </Link>
        </div>
     );
  }

  const timeAgo = formatDistanceToNow(news.createdAt, { addSuffix: true, locale: tr });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <Helmet>
        <title>{news.title} - Kayserianlık</title>
        <meta name="description" content={news.summary} />
        {news.imageUrl && <meta property="og:image" content={news.imageUrl} />}
      </Helmet>
      
      {/* Category & Time */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/kategori/${news.category.toLowerCase()}`} className="text-red-700 font-bold uppercase tracking-wider text-sm hover:underline">
          {news.category}
        </Link>
        <span className="text-gray-400">&bull;</span>
        <span className="text-gray-500 text-sm">{timeAgo}</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-6">
        {news.title}
      </h1>

      {/* Summary */}
      <p className="text-xl md:text-2xl font-medium text-gray-600 leading-relaxed mb-8">
        {news.summary}
      </p>

      {/* Author & Share (Placeholder) */}
      <div className="flex items-center justify-between border-y border-gray-200 py-4 mb-10">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
              K
           </div>
           <div>
             <div className="font-semibold text-gray-900 text-sm">Kayserianlık Haber Merkezi</div>
             <div className="text-gray-500 text-xs text-left">Editör</div>
           </div>
        </div>
        <div className="flex gap-2">
           {/* Social Icons Placeholder */}
           <button className="text-gray-400 hover:text-gray-900 transition"><span className="sr-only">Paylaş</span>🔗</button>
        </div>
      </div>

      {/* Main Image */}
      {news.imageUrl && (
         <div className="mb-12 rounded-xl overflow-hidden bg-gray-100">
            <img 
               src={news.imageUrl} 
               alt={news.title}
               className="w-full h-auto object-cover max-h-[600px]"
            />
         </div>
      )}

      {/* Content */}
      <div className="prose prose-lg md:prose-xl max-w-none text-gray-800 font-serif leading-loose">
         {/* Simple rendering for now. In production, use react-markdown or DOMPurify for HTML */}
         {news.content?.split('\n').map((paragraph: string, i: number) => (
            <p key={i} className="mb-6">{paragraph}</p>
         ))}
         {!news.content && (
            <p className="text-gray-500 italic">Haber detayları yükleniyor...</p>
         )}
      </div>

    </article>
  );
}
