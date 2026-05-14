import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import NewsCard from "../components/NewsCard";

export default function Home() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Veriler artık doğrudan veritabanından(firebase) değil, Express Cache sunucumuzdan gelecek
  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNewsList(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Haberler çekilemedi:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  const headlines = newsList.slice(0, 1); // 1. Manşet
  const recentNews = newsList.slice(1); // Geri Kalanlar

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Kayserianlık - Kayseri Haberleri, Son Dakika ve Yerel Haberler</title>
        <meta name="description" content="Kayseri'nin en güncel yerel haber sitesi. Kayserianlık ile en son dakika gelişmelerinden hemen haberdar olun." />
      </Helmet>
      
      {/* Reklam Alanı (Mock) */}
      <div className="w-full h-24 bg-gray-200 flex items-center justify-center rounded-md mb-8 border border-gray-300">
        <span className="text-gray-400 text-sm tracking-wider uppercase">Reklam Alanı (970x90)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sol Ana Sütun (Slider/Ana Manşet) */}
        <div className="col-span-1 lg:col-span-8">
          {headlines.length > 0 && <NewsCard news={headlines[0]} featured={true} />}
        </div>

        {/* Sağ Sütun (Son Gelişmeler Listesi) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <div className="border-b-2 border-red-700 pb-2 mb-2">
            <h2 className="font-serif font-bold text-xl text-gray-900">En Son Haberler</h2>
          </div>
          
          <div className="flex flex-col gap-6 divide-y divide-gray-100">
             {recentNews.map((news) => (
               <div key={news.id} className="pt-4 first:pt-0">
                  <NewsCard news={news} featured={false} />
               </div>
             ))}
             {/* Boşluk Doldurucu Ekstra Tasarım Testi İçin Geriye Kalan Haberler Yoksa sahte üret */}
             {recentNews.length === 0 && (
                <div className="text-gray-500 py-4">Daha fazla içerik bulunamadı.</div>
             )}
          </div>
        </div>
      </div>

      {/* İkincil Kategori ve İki Sütunlu Gridler */}
      <div className="mt-16">
         <div className="border-b-2 border-gray-900 pb-2 mb-8 flex justify-between items-end">
            <h2 className="font-serif font-bold text-2xl text-gray-900">Gündem</h2>
            <a href="#" className="text-red-700 text-sm font-semibold hover:underline">Tümünü Gör</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsList.map((news) => (
              <NewsCard key={`grid-${news.id}`} news={news} />
            ))}
          </div>
      </div>

    </div>
  );
}
