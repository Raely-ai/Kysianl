import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AdminSocial() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
     whatsappPhone: '',
     whatsappTitle: 'WhatsApp İhbar Hattı',
     whatsappDescription: 'Çekin, gönderin, yayınlayalım!',
     whatsappActive: true,
     facebookUrl: '',
     twitterUrl: '',
     instagramUrl: '',
     youtubeUrl: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
       try {
          const snap = await getDoc(doc(db, 'settings', 'socialLinks'));
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
      await setDoc(doc(db, 'settings', 'socialLinks'), formData);
      alert('Ayarlar kaydedildi.');
    } catch (e) {
      alert('Hata!');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-black font-serif text-gray-900 mb-6">WhatsApp ve Sosyal Medya</h1>
      
      {loading ? <p>Yükleniyor...</p> : (
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-lg font-bold mb-4 border-b pb-2">WhatsApp İhbar Hattı</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2 flex items-center gap-2 mb-2">
                    <input type="checkbox" id="wa-active" checked={formData.whatsappActive} onChange={e => setFormData({...formData, whatsappActive: e.target.checked})} className="w-5 h-5 rounded" />
                    <label htmlFor="wa-active" className="font-bold">WhatsApp Modülü Aktif</label>
                 </div>
                 
                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Telefon Numarası</label>
                    <input type="text" placeholder="Örn: 905437993838" className="border border-gray-300 p-2 rounded w-full" value={formData.whatsappPhone} onChange={e => setFormData({...formData, whatsappPhone: e.target.value})} />
                    <small className="text-gray-500">Uluslararası formatta, başında artı (+) olmadan girin.</small>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kutu Başlığı</label>
                    <input type="text" className="border border-gray-300 p-2 rounded w-full" value={formData.whatsappTitle} onChange={e => setFormData({...formData, whatsappTitle: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Alt Açıklama</label>
                    <input type="text" className="border border-gray-300 p-2 rounded w-full" value={formData.whatsappDescription} onChange={e => setFormData({...formData, whatsappDescription: e.target.value})} />
                 </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-lg font-bold mb-4 border-b pb-2">Sosyal Medya Linkleri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Facebook URL</label>
                    <input type="url" className="border border-gray-300 p-2 rounded w-full" value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} placeholder="https://facebook.com/..." />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">X (Twitter) URL</label>
                    <input type="url" className="border border-gray-300 p-2 rounded w-full" value={formData.twitterUrl} onChange={e => setFormData({...formData, twitterUrl: e.target.value})} placeholder="https://x.com/..." />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Instagram URL</label>
                    <input type="url" className="border border-gray-300 p-2 rounded w-full" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} placeholder="https://instagram.com/..." />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">YouTube URL</label>
                    <input type="url" className="border border-gray-300 p-2 rounded w-full" value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} placeholder="https://youtube.com/..." />
                 </div>
              </div>
           </div>

           <button type="submit" disabled={saving} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 w-full md:w-auto">{saving ? 'Kaydediliyor...' : 'Tümünü Kaydet'}</button>
        </form>
      )}
    </div>
  );
}
