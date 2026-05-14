import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export default function AdminAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
     title: '',
     placement: 'home_top',
     imageUrl: '',
     linkUrl: '',
     htmlCode: '',
     active: true,
     order: 0
  });

  const placements = [
     { id: 'home_top', label: 'Ana Sayfa Üst (Header Altı)' },
     { id: 'home_middle', label: 'Ana Sayfa Orta (YabBoz İçi)' },
     { id: 'home_sidebar', label: 'Ana Sayfa Sağ Sidebar' },
     { id: 'detail_top', label: 'Haber Detay Üst' },
     { id: 'detail_inside', label: 'Haber Detay İçerik Arası' },
     { id: 'detail_sidebar', label: 'Haber Detay Sağ Sidebar' },
  ];

  const fetchAds = async () => {
    try {
      const q = query(collection(db, 'ads'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      setAds(snap.docs.map(d => ({id: d.id, ...d.data()})));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleSubmit = async (e: any) => {
     e.preventDefault();
     setFormLoading(true);
     try {
       if (editingId) {
         await updateDoc(doc(db, 'ads', editingId), formData);
       } else {
         await addDoc(collection(db, 'ads'), formData);
       }
       setFormData({title: '', placement: 'home_top', imageUrl: '', linkUrl: '', htmlCode: '', active: true, order: ads.length + 1});
       setEditingId(null);
       fetchAds();
     } catch (err) { alert(err); } finally { setFormLoading(false); }
  };

  const handleEdit = (ad: any) => {
     setEditingId(ad.id);
     setFormData({ title: ad.title, placement: ad.placement, imageUrl: ad.imageUrl, linkUrl: ad.linkUrl, htmlCode: ad.htmlCode, active: ad.active, order: ad.order });
  };

  const handleDelete = async (id: string) => {
     if(window.confirm("Reklamı silmek istediğinize emin misiniz?")) {
        await deleteDoc(doc(db, 'ads', id));
        fetchAds();
     }
  };

  const getPlacementLabel = (id: string) => placements.find(p => p.id === id)?.label || id;

  return (
    <div>
      <h1 className="text-2xl font-black font-serif text-gray-900 mb-6">Reklam Yönetimi</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-1 bg-white p-6 rounded-xl border border-gray-200 h-max">
          <h2 className="font-bold text-lg mb-4">{editingId ? 'Reklamı Düzenle' : 'Yeni Reklam'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Reklam Başlığı (Not Amaçlı)</label>
               <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="block w-full border border-gray-300 rounded p-2" />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Gösterim Alanı (Placement)</label>
               <select required value={formData.placement} onChange={e => setFormData({...formData, placement: e.target.value})} className="block w-full border border-gray-300 rounded p-2">
                 {placements.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Görsel URL</label>
               <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="block w-full border border-gray-300 rounded p-2" placeholder="Basit resim reklamları için" />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Yönlendirme Linki</label>
               <input type="text" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="block w-full border border-gray-300 rounded p-2" placeholder="Görsele tıklandığında gidilecek URL"/>
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1 flex justify-between">
                  <span>AdSense / HTML Kodu</span>
                  <span className="text-xs font-normal text-gray-500">Öncelikli Kullanılır</span>
               </label>
               <textarea rows={4} value={formData.htmlCode} onChange={e => setFormData({...formData, htmlCode: e.target.value})} className="block w-full border border-gray-300 rounded p-2 font-mono text-xs text-gray-600" placeholder="<script>...</script>" />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Sıra (Birden fazla varsa)</label>
               <input type="number" required value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="block w-full border border-gray-300 rounded p-2" />
             </div>
             <div className="flex gap-2 text-base">
               <label className="flex items-center gap-2 font-bold cursor-pointer">
                 <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4 cursor-pointer" /> Aktif
               </label>
             </div>
             <div className="pt-2">
               <button type="submit" disabled={formLoading} className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700">{formLoading ? '...' : 'Kaydet'}</button>
               {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({title: '', placement: 'home_top', imageUrl: '', linkUrl: '', htmlCode: '', active: true, order: 0})}} className="w-full mt-2 text-gray-500 underline text-sm">İptal</button>}
             </div>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="p-8 text-center">Yükleniyor...</div> : (
             <table className="min-w-full divide-y divide-gray-200 text-sm">
               <thead className="bg-gray-100">
                 <tr>
                   <th className="px-4 py-3 text-left font-bold text-gray-700">Reklam Bilgisi</th>
                   <th className="px-4 py-3 text-left font-bold text-gray-700">Gösterim Alanı</th>
                   <th className="px-4 py-3 text-left font-bold text-gray-700">Durum</th>
                   <th className="px-4 py-3 text-right font-bold text-gray-700">İşlem</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {ads.map(ad => (
                   <tr key={ad.id}>
                     <td className="px-4 py-3 font-bold text-gray-900">{ad.title} <div className="font-normal text-xs text-gray-500 max-w-[200px] truncate">{ad.htmlCode ? 'HTML Kodu Eklendi' : ad.imageUrl || '-'}</div></td>
                     <td className="px-4 py-3">{getPlacementLabel(ad.placement)} <small className="text-gray-400 block">Sıra: {ad.order}</small></td>
                     <td className="px-4 py-3">
                       {ad.active ? <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Aktif</span> : <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded font-bold">Pasif</span>}
                     </td>
                     <td className="px-4 py-3 text-right whitespace-nowrap">
                       <button onClick={() => handleEdit(ad)} className="text-blue-600 hover:underline mr-3 font-medium">Düzenle</button>
                       <button onClick={() => handleDelete(ad.id)} className="text-red-600 hover:underline font-medium">Sil</button>
                     </td>
                   </tr>
                 ))}
                 {ads.length === 0 && <tr><td colSpan={4} className="p-4 text-center">Reklam bulunamadı.</td></tr>}
               </tbody>
             </table>
          )}
        </div>
      </div>
    </div>
  );
}
