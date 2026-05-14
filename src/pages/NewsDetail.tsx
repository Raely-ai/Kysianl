import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Helmet } from "react-helmet-async";
import WidgetWhatsApp from "../components/WidgetWhatsApp";
import WidgetSocial from "../components/WidgetSocial";
import { useAppContext } from "../AppContext";

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<any>(null);
  const [mostRead, setMostRead] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { initData } = useAppContext();

  useEffect(() => {
    setLoading(true);
    
    // Fetch individual news
    fetch(`/api/news/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Haber bulunamadı");
        return res.json();
      })
      .then(data => {
        setNews(data.data);
      })
      .catch(err => {
        setError(err.message);
      });

    // Fetch context data (most read)
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
         const sorted = (data.data || []).sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5);
         setMostRead(sorted);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));

  }, [slug]);

  if (loading) {
     return (
        <div className="max-w-7xl mx-auto px-4 py-32 flex justify-center">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-700 rounded-full animate-spin"></div>
        </div>
     );
  }

  if (error || !news) {
     return (
        <div className="max-w-7xl mx-auto px-4 py-32 text-center">
           <Helmet>
             <title>İçerik Bulunamadı - Kayserianlık</title>
           </Helmet>
           <h1 className="text-3xl font-serif font-black text-gray-900 mb-4">İçerik Bulunamadı</h1>
           <p className="text-gray-600 mb-8">Aradığınız haber yayından kaldırılmış veya taşınmış olabilir.</p>
           <Link to="/" className="inline-block bg-red-700 text-white px-6 py-3 font-bold rounded-lg hover:bg-red-800 transition shadow-md">
              Ana Sayfaya Dön
           </Link>
        </div>
     );
  }

  let timeAgo = "";
  try {
    timeAgo = news?.createdAt ? formatDistanceToNow(news.createdAt, { addSuffix: true, locale: tr }) : "";
  } catch (e) {
    timeAgo = "";
  }

  let sidebarBlocks = initData?.sidebarLayout?.blocks || [
      { id: 'whatsapp_box', active: true },
      { id: 'popular_news', active: true },
      { id: 'ad_300', active: true },
      { id: 'social_box', active: true }
  ];

  sidebarBlocks = sidebarBlocks.filter((b:any) => b.active);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Helmet>
        <title>{news.title} - Kayserianlık</title>
        <meta name="description" content={news.summary} />
        {news.imageUrl && <meta property="og:image" content={news.imageUrl} />}
      </Helmet>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Main Article Content */}
        <article className="xl:col-span-8">
           
           {/* Reklam Alanı (Detail Top) */}
           <div className="w-full h-24 bg-gray-100 flex items-center justify-center rounded-xl mb-8 border border-gray-200 shadow-sm relative overflow-hidden group">
             <span className="text-gray-400 text-sm tracking-widest uppercase font-semibold">Haber Üstü Reklam</span>
           </div>

           {/* Category & Time */}
           <div className="flex items-center gap-4 mb-8">
             <Link to={`/kategori/${news?.category?.toLowerCase?.() || ''}`} className="bg-red-700 text-white px-4 py-1.5 rounded-md text-[13px] font-black uppercase tracking-widest hover:bg-red-800 transition shadow-sm">
               {news.category || 'Haber'}
             </Link>
             <span className="text-gray-500 font-semibold text-sm tracking-wide">{timeAgo}</span>
           </div>

           {/* Title */}
           <h1 className="text-4xl md:text-[54px] font-article font-black text-gray-900 leading-[1.15] mb-6 tracking-tight">
             {news.title}
           </h1>

           {/* Summary */}
           <p className="text-[22px] md:text-[26px] font-serif font-medium text-gray-600 leading-[1.6] mb-10">
             {news.summary}
           </p>

           {/* Author & Share */}
           <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-gray-200 py-5 mx-0 mb-10 gap-4">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-50 text-red-700 rounded-full flex items-center justify-center font-black text-2xl shadow-inner border border-red-100">
                   K
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-[15px] tracking-wide">Kayserianlık Haber Merkezi</div>
                  <div className="text-gray-500 text-[13px] font-semibold mt-0.5">Haber Editörü &bull; {new Date(news.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
             </div>
             <div className="flex gap-2">
                <button className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition shadow-sm font-bold text-lg">f</button>
                <button className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition shadow-sm font-bold text-lg">X</button>
                <button className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition shadow-sm font-bold text-lg">W</button>
             </div>
           </div>

           {/* Main Image */}
           <div className="mb-12 rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm border border-gray-100">
              <img 
                 src={news.imageUrl || `https://picsum.photos/seed/${news.id || slug}/1200/800`} 
                 alt={news.title}
                 className="w-full h-[auto] object-cover max-h-[700px]"
              />
           </div>

           {/* Content */}
           <div className="prose prose-lg md:prose-[21px] max-w-none text-gray-800 font-article leading-[1.8] tracking-[0.01em]">
              {news.content?.split('\n').map((paragraph: string, i: number) => (
                 <div key={i}>
                    <p className="mb-8 selection:bg-red-200">{paragraph}</p>
                    {/* Inject Ad after 3rd paragraph */}
                    {i === 2 && (
                       <div className="my-10 w-full h-40 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                          <span className="text-[11px] text-gray-400 uppercase tracking-widest mb-2 font-bold">GOOGLE REKLAMLARI</span>
                          <span className="text-gray-400 text-[15px] font-semibold">İçerik İçi Reklam Alanı</span>
                       </div>
                    )}
                 </div>
              ))}
              {!news.content && (
                 <p className="text-gray-500 italic">Haber detayları yükleniyor...</p>
              )}
           </div>
        </article>

        {/* Right Sidebar */}
        <aside className="xl:col-span-4 flex flex-col gap-8">
           {sidebarBlocks.map((block:any) => {
               if (block.id === 'whatsapp_box') return <WidgetWhatsApp key={block.id} />;
               if (block.id === 'social_box') return <WidgetSocial key={block.id} />;
               if (block.id === 'popular_news') return (
                   <div key={block.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="border-b-[3px] border-gray-900 pb-3 mb-5">
                        <h3 className="font-serif font-black text-[22px] text-gray-900 tracking-tight flex items-center gap-2">
                           <div className="w-2.5 h-6 bg-red-700"></div> {/* Küçük bir accent çubuk */}
                           En Çok Okunanlar
                        </h3>
                      </div>
                      <div className="flex flex-col gap-5">
                         {mostRead.map((item, idx) => (
                           <Link to={`/haber/${item.slug}`} key={item.id} className="flex gap-4 group items-center">
                              <div className="text-[40px] font-black text-gray-200 group-hover:text-red-600 transition-colors leading-none italic w-12 text-center font-serif">
                                {(idx + 1).toString()}
                              </div>
                              <div className="flex flex-col justify-center flex-1">
                                 <h4 className="font-bold text-[15px] text-gray-800 leading-snug group-hover:text-red-700 line-clamp-3">
                                   {item.title}
                                 </h4>
                              </div>
                           </Link>
                         ))}
                         {mostRead.length === 0 && (
                           <div className="text-gray-400 text-sm">Haber bulunamadı.</div>
                         )}
                      </div>
                   </div>
               );
               if (block.id === 'ad_300') return (
                   <div key={block.id} className="w-[300px] h-[250px] mx-auto bg-gray-100 flex items-center justify-center rounded-xl border border-gray-200 sticky top-28">
                     <span className="text-gray-400 text-sm tracking-widest uppercase font-semibold text-center px-4">Reklam<br/>300x250</span>
                   </div>
               );
               return null;
           })}
        </aside>

      </div>
    </div>
  );
}
