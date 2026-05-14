import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs, limit, orderBy, getCountFromServer } from 'firebase/firestore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalNews: 0,
    publishedNews: 0,
    draftNews: 0,
    totalCategories: 0,
    totalAds: 0,
    todayNews: 0
  });
  const [breakingActive, setBreakingActive] = useState(false);
  const [topNews, setTopNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const newsRef = collection(db, 'news');
        
        // Counts
        const countTotal = await getCountFromServer(newsRef);
        const countPublished = await getCountFromServer(query(newsRef, where('status', '==', 'published')));
        const countDraft = await getCountFromServer(query(newsRef, where('status', '==', 'draft')));
        
        const catRef = collection(db, 'categories');
        const countCat = await getCountFromServer(catRef);

        const adsRef = collection(db, 'ads');
        const countAds = await getCountFromServer(adsRef);

        // Today news estimate (start of today)
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const countToday = await getCountFromServer(query(newsRef, where('createdAt', '>=', startOfToday.toISOString())));

        // Breaking active?
        const breakingSnap = await getDocs(query(collection(db, 'settings'), where('__name__', '==', 'breakingSettings')));
        if (!breakingSnap.empty) {
          setBreakingActive(breakingSnap.docs[0].data().active || false);
        }

        // Top 5 news
        const topNewsSnap = await getDocs(query(newsRef, where('status', '==', 'published'), orderBy('views', 'desc'), limit(5)));
        setTopNews(topNewsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        setStats({
          totalNews: countTotal.data().count,
          publishedNews: countPublished.data().count,
          draftNews: countDraft.data().count,
          totalCategories: countCat.data().count,
          totalAds: countAds.data().count,
          todayNews: countToday.data().count
        });
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Dashboard Özeti</h1>
         <Link to="/admin/news/new" className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition">
           + Yeni Haber
         </Link>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Toplam Haber</h3>
            <p className="text-3xl font-black text-gray-900">{stats.totalNews}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Yayında</h3>
            <p className="text-3xl font-black text-green-600">{stats.publishedNews}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Taslak</h3>
            <p className="text-3xl font-black text-amber-500">{stats.draftNews}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Bugün Eklenen</h3>
            <p className="text-3xl font-black text-blue-600">{stats.todayNews}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Kategori Sayısı</h3>
            <p className="text-3xl font-black text-gray-900">{stats.totalCategories}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Son Dakika Modu</h3>
            {breakingActive ? (
               <p className="text-2xl font-black text-red-600 animate-pulse mt-1">AKTİF</p>
            ) : (
               <p className="text-2xl font-black text-gray-400 mt-1">PASİF</p>
            )}
         </div>
      </div>

      {/* Top 5 list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">En Çok Okunan 5 Haber</h2>
            <Link to="/admin/news" className="text-sm text-red-600 font-bold hover:underline">Tüm Haberler</Link>
         </div>
         <div className="divide-y divide-gray-100">
            {topNews.length > 0 ? topNews.map(news => (
               <div key={news.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition gap-4">
                  <div className="flex items-center gap-4">
                     {news.imageUrl ? (
                        <img src={news.imageUrl} alt="" className="w-16 h-12 rounded object-cover" />
                     ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded"></div>
                     )}
                     <div>
                        <h4 className="font-bold text-gray-900 line-clamp-1">{news.title}</h4>
                        <div className="text-xs text-gray-500 mt-1 font-medium">{news.category}</div>
                     </div>
                  </div>
                  <div className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                     {news.views || 0} Görüntülenme
                  </div>
               </div>
            )) : (
               <div className="p-8 text-center text-gray-500">Henüz yayınlanmış haber bulunmuyor.</div>
            )}
         </div>
      </div>
    </div>
  );
}
