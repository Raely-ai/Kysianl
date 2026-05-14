import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AdminBreaking() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
     active: true,
     mode: 'auto', // auto | manual
     limit: 10,
     onlyBreaking: true,
     selectedNewsIds: []
  });

  useEffect(() => {
    const fetchSettings = async () => {
       try {
          const snap = await getDoc(doc(db, 'settings', 'breakingSettings'));
          if (snap.exists()) {
             setFormData(snap.data() as any);
          }
       } catch(e) { console.error(e); }
       finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'breakingSettings'), formData);
      alert('Ayarlar kaydedildi.');
    } catch (e) {
      alert('Hata!');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-black font-serif text-gray-900 mb-6">Son Dakika Bant Ayarları</h1>
      
      {loading ? <p>Yükleniyor...</p> : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200">
           <div className="mb-6 flex items-center space-x-3">
              <input type="checkbox" id="active" className="w-5 h-5 rounded cursor-pointer" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
              <label htmlFor="active" className="font-bold text-gray-900 cursor-pointer">Bantı Aktif Et</label>
           </div>
           
           <div className="space-y-6 opacity-100 transition-opacity" style={{opacity: formData.active ? 1 : 0.5}}>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Çalışma Modu</label>
               <select className="border border-gray-300 p-2 rounded w-full" value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})}>
                  <option value="auto">Otomatik (En son haberleri çeker)</option>
                  <option value="manual">Manuel (Elle seçilenleri çeker - Yakında)</option>
               </select>
             </div>
             
             {formData.mode === 'auto' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Gösterilecek Maksimum Haber</label>
                    <input type="number" className="border border-gray-300 p-2 rounded w-full" value={formData.limit} onChange={e => setFormData({...formData, limit: parseInt(e.target.value)})} min={1} max={50}/>
                  </div>
                  <div className="flex items-center space-x-2">
                     <input type="checkbox" id="onlyBreaking" checked={formData.onlyBreaking} onChange={e => setFormData({...formData, onlyBreaking: e.target.checked})} className="rounded"/>
                     <label htmlFor="onlyBreaking" className="text-sm font-medium text-gray-700">Sadece "Son Dakika" olarak işaretlenen haberleri göster</label>
                  </div>
                </>
             )}

             <button type="submit" disabled={saving} className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-700">{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
           </div>
        </form>
      )}
    </div>
  );
}
