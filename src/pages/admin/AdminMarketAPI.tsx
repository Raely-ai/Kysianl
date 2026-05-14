import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AdminMarketAPI() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
     active: true,
     provider: 'mock', // mock | collectapi vs
     apiUrl: '',
     apiKey: '',
     cacheMinutes: 15
  });

  useEffect(() => {
    const fetchSettings = async () => {
       try {
          const snap = await getDoc(doc(db, 'settings', 'marketSettings'));
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
      await setDoc(doc(db, 'settings', 'marketSettings'), formData);
      alert('Finans API Ayarları kaydedildi.');
    } catch (e) {
      alert('Hata!');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-black font-serif text-gray-900 mb-6">Finans / Para Piyasası Ayarları</h1>
      
      {loading ? <p>Yükleniyor...</p> : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200">
           
           <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800">
              <strong className="block mb-1">Bilgi:</strong> 
              Eğer geçerli bir API bilgisi girilmezse veya kota dolarsa, sistem otomatik olarak "Mock (Sahte)" veriler gösterecek ve beyaz ekran hatası yaşanmayacaktır.
           </div>

           <div className="mb-6 flex items-center space-x-3">
              <input type="checkbox" id="active" className="w-5 h-5 rounded cursor-pointer" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
              <label htmlFor="active" className="font-bold text-gray-900 cursor-pointer">Finans Barını Aktif Et</label>
           </div>
           
           <div className="space-y-4 opacity-100 transition-opacity" style={{opacity: formData.active ? 1 : 0.5}}>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">API Sağlayıcı</label>
               <select className="border border-gray-300 p-2 rounded w-full bg-white" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})}>
                  <option value="mock">Test Verisi (Mock)</option>
                  <option value="collectapi">CollectAPI</option>
                  <option value="custom">Özel API</option>
               </select>
             </div>

             {formData.provider !== 'mock' && (
                <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">API Endpoint URL</label>
                  <input type="text" className="border border-gray-300 p-2 rounded w-full" value={formData.apiUrl} onChange={e => setFormData({...formData, apiUrl: e.target.value})} placeholder="https://api.collectapi.com/economy/allCurrency"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">API Key</label>
                  <input type="password" className="border border-gray-300 p-2 rounded w-full" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} />
                  <small className="text-gray-500">Bu anahtar sadece backend tarafından kullanılacak ve dışarı sızdırılmayacaktır.</small>
                </div>
                </>
             )}
             
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Önbellek (Cache) Süresi (Dakika)</label>
               <select className="border border-gray-300 p-2 rounded w-full bg-white" value={formData.cacheMinutes} onChange={e => setFormData({...formData, cacheMinutes: parseInt(e.target.value)})}>
                  <option value={5}>5 Dakika</option>
                  <option value={15}>15 Dakika</option>
                  <option value={30}>30 Dakika</option>
                  <option value={60}>1 Saat</option>
               </select>
               <small className="text-gray-500">API istek limitlerini aşmamak için yüksek tutmanız önerilir.</small>
             </div>

             <button type="submit" disabled={saving} className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-700 mt-4">{saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</button>
           </div>
        </form>
      )}
    </div>
  );
}
