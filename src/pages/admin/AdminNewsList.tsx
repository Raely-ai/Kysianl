import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function AdminNewsList() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBreaking, setFilterBreaking] = useState(false);
  const [filterSlider, setFilterSlider] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNews(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu haberi silmek istediğinize emin misiniz? (Bu işlem geri alınamaz!)")) {
      try {
        await deleteDoc(doc(db, 'news', id));
        fetchNews();
      } catch (e) {
        alert("Hata oluştu.");
      }
    }
  };

  // Deriving lists for dropdowns
  const uniqueCategories = Array.from(new Set(news.map(n => n.category))).filter(Boolean);

  const filteredNews = news.filter(item => {
     let match = true;
     if (searchTerm) {
       match = match && (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
     }
     if (filterCategory) {
       match = match && item.category === filterCategory;
     }
     if (filterStatus) {
       match = match && item.status === filterStatus;
     }
     if (filterBreaking) {
       match = match && item.isBreaking;
     }
     if (filterSlider) {
       match = match && item.isSlider;
     }
     return match;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-black font-serif text-gray-900">Haber Yönetimi</h1>
           <p className="text-gray-500 text-sm mt-1">Sistemdeki tüm haberleri yönetin</p>
        </div>
        <Link to="/admin/news/new" className="bg-red-700 text-white px-5 py-2 font-bold rounded-lg hover:bg-red-800 transition whitespace-nowrap shadow-sm">
          + Yeni Haber Ekle
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-wrap gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Başlıkta ara..." 
          className="border border-gray-300 px-3 py-2 rounded text-sm min-w-[200px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border border-gray-300 px-3 py-2 rounded text-sm bg-white"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Tüm Kategoriler</option>
          {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select 
          className="border border-gray-300 px-3 py-2 rounded text-sm bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tüm Durumlar</option>
          <option value="published">Yayında</option>
          <option value="draft">Taslak</option>
        </select>
        <label className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-2 rounded cursor-pointer">
          <input type="checkbox" checked={filterBreaking} onChange={e => setFilterBreaking(e.target.checked)} className="rounded" />
          Sadece Son Dakika
        </label>
        <label className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-2 rounded cursor-pointer">
          <input type="checkbox" checked={filterSlider} onChange={e => setFilterSlider(e.target.checked)} className="rounded" />
          Sadece Slider
        </label>
      </div>

      {loading ? (
         <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Haber / Tarih</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">Etiketler</th>
                <th className="px-6 py-3 text-right font-bold text-gray-700 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredNews.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 max-w-sm xl:max-w-md line-clamp-2 leading-snug" title={item.title}>
                       {item.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString('tr-TR')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{item.category || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${item.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {item.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 w-32">
                       {item.isHeadline && <span className="bg-blue-100 text-blue-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Manşet</span>}
                       {item.isBreaking && <span className="bg-red-100 text-red-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Son Dakika</span>}
                       {item.isSlider && <span className="bg-purple-100 text-purple-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Slider</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    <Link to={`/admin/news/edit/${item.id}`} className="text-blue-600 hover:text-blue-900 mr-4 hover:underline">Düzenle</Link>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 hover:underline">Sil</button>
                  </td>
                </tr>
              ))}
              {filteredNews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Aranan kriterlere uygun haber bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
