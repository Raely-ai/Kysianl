import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
     logoUrl: '',
     faviconUrl: '',
     siteName: 'Kayserianlık.',
     maintenanceMode: false,
     footerText: 'Kayseri\'nin en güncel, en hızlı ve güvenilir haber platformu. Sadece haberi değil, haberin perde arkasını da sizlere ulaştırıyoruz.',
     contactEmail: 'info@kayserianlik.com',
     address: 'Kayseri Merkez'
  });

  useEffect(() => {
    const fetchSettings = async () => {
       try {
          const snap = await getDoc(doc(db, 'settings', 'general'));
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
      await setDoc(doc(db, 'settings', 'general'), formData);
      alert('Site ayarları kaydedildi.');
    } catch (e) {
      alert('Hata!');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-black font-serif text-gray-900 mb-6">Genel Site Ayarları</h1>
      
      {loading ? <p>Yükleniyor...</p> : (
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-gray-200">
             <div className="flex items-center justify-between border-b pb-4 mb-4">
               <h2 className="text-lg font-bold">Bakım Modu</h2>
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.maintenanceMode} onChange={e => setFormData({...formData, maintenanceMode: e.target.checked})} className="w-5 h-5 rounded cursor-pointer text-red-600 focus:ring-red-500" />
                  <span className={`${formData.maintenanceMode ? 'text-red-600 font-bold' : 'text-gray-500'}`}>Sistemi Bakıma Al</span>
               </label>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Site Adı</label>
                  <input type="text" className="border border-gray-300 p-2 rounded w-full font-bold" value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})}/>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Logo URL</label>
                  <input type="url" className="border border-gray-300 p-2 rounded w-full" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} placeholder="https://..." />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Favicon URL</label>
                  <input type="url" className="border border-gray-300 p-2 rounded w-full" value={formData.faviconUrl} onChange={e => setFormData({...formData, faviconUrl: e.target.value})} placeholder="https://..." />
               </div>
               <div className="md:col-span-2 pt-4">
                  <h3 className="font-bold text-gray-800 mb-2">İletişim Bilgileri (Footer vs)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">E-posta Adresi</label>
                       <input type="email" className="border border-gray-300 p-2 rounded w-full" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Adres / Lokasyon</label>
                       <input type="text" className="border border-gray-300 p-2 rounded w-full" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                     </div>
                  </div>
               </div>
               <div className="md:col-span-2 mt-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Footer Hakkımızda Metni</label>
                  <textarea rows={3} className="border border-gray-300 p-2 rounded w-full text-sm" value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} />
               </div>
             </div>
           </div>

           <button type="submit" disabled={saving} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 w-full md:w-auto shadow-sm">{saving ? 'Kaydediliyor...' : 'Site Ayarlarını Kaydet'}</button>
        </form>
      )}
    </div>
  );
}
