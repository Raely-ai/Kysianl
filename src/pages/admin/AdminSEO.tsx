import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AdminSEO() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
     siteTitle: 'Kayserianlık - Kayseri Haberleri, Son Dakika',
     siteDescription: "Kayseri'nin en güncel haber portalı. Siyaset, spor, ekonomi ve asayiş haberleri.",
     keywords: 'kayseri, kayseri haber, kayseri son dakika, kayserispor',
     ogImage: '',
     canonicalBaseUrl: 'https://kayserianlik.com',
     googleAnalyticsId: '',
     searchConsoleVerification: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
       try {
          const snap = await getDoc(doc(db, 'settings', 'seo'));
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
      await setDoc(doc(db, 'settings', 'seo'), formData);
      alert('SEO Ayarları kaydedildi.');
    } catch (e) {
      alert('Hata!');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-black font-serif text-gray-900 mb-6">Genel SEO Ayarları</h1>
      
      {loading ? <p>Yükleniyor...</p> : (
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-gray-200">
             <h2 className="text-lg font-bold mb-4 border-b pb-2">Ana Sayfa Meta Etiketleri</h2>
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Site SEO Başlığı (Title)</label>
                  <input type="text" className="border border-gray-300 p-2 rounded w-full" value={formData.siteTitle} onChange={e => setFormData({...formData, siteTitle: e.target.value})} maxLength={70}/>
                  <div className="text-xs text-gray-500 text-right mt-1">{formData.siteTitle.length}/70 karakter</div>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Site SEO Açıklaması (Description)</label>
                  <textarea rows={3} className="border border-gray-300 p-2 rounded w-full" value={formData.siteDescription} onChange={e => setFormData({...formData, siteDescription: e.target.value})} maxLength={160}/>
                  <div className="text-xs text-gray-500 text-right mt-1">{formData.siteDescription.length}/160 karakter</div>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Anahtar Kelimeler (Keywords)</label>
                  <input type="text" className="border border-gray-300 p-2 rounded w-full" value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Varsayılan Paylaşım Görseli (og:image)</label>
                  <input type="url" className="border border-gray-300 p-2 rounded w-full" value={formData.ogImage} onChange={e => setFormData({...formData, ogImage: e.target.value})} placeholder="https://..." />
               </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-gray-200">
             <h2 className="text-lg font-bold mb-4 border-b pb-2">Gelişmiş & İzleme</h2>
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Canonical Base URL</label>
                  <input type="url" className="border border-gray-300 p-2 rounded w-full text-gray-600 bg-gray-50" value={formData.canonicalBaseUrl} onChange={e => setFormData({...formData, canonicalBaseUrl: e.target.value})} placeholder="https://kayserianlik.com" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Google Analytics ID</label>
                  <input type="text" className="border border-gray-300 p-2 rounded w-full" value={formData.googleAnalyticsId} onChange={e => setFormData({...formData, googleAnalyticsId: e.target.value})} placeholder="G-XXXXXXXXXX" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Google Search Console Verification Code</label>
                  <input type="text" className="border border-gray-300 p-2 rounded w-full" value={formData.searchConsoleVerification} onChange={e => setFormData({...formData, searchConsoleVerification: e.target.value})} />
               </div>
             </div>
           </div>

           <button type="submit" disabled={saving} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 w-full md:w-auto">{saving ? 'Kaydediliyor...' : 'Tümünü Kaydet'}</button>
        </form>
      )}
    </div>
  );
}
