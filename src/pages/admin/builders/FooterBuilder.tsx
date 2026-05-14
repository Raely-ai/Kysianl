import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function FooterBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footerData, setFooterData] = useState({
     aboutText: 'Kayserianlık, Kayseri\'nin en güncel ve tarafsız haber platformudur.',
     copyrightText: '© 2024 Kayserianlık. Tüm hakları saklıdır.',
     address: 'Cumhuriyet Meydanı, Melikgazi / Kayseri',
     email: 'iletisim@kayserianlik.com',
     phone: '0352 123 45 67',
     socialFacebook: '',
     socialTwitter: '',
     socialInstagram: '',
  });

  useEffect(() => {
     const fetch = async () => {
         try {
            const docRef = await getDoc(doc(db, 'settings', 'footer'));
            if(docRef.exists()) {
                setFooterData(prev => ({...prev, ...docRef.data()}));
            }
         } catch(e) {
             console.error(e);
         } finally {
             setLoading(false);
         }
     }
     fetch();
  }, []);

  const handleSave = async () => {
      setSaving(true);
      try {
          await setDoc(doc(db, 'settings', 'footer'), footerData, { merge: true });
          alert('Footer güncellendi!');
      } catch(e) {
          alert('Hata');
      } finally {
          setSaving(false);
      }
  }

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-4xl mx-auto flex flex-col gap-6">
       <div className="border-b pb-4 mb-2">
           <h2 className="text-xl font-bold text-gray-900">Footer Builder (Alt Bilgi)</h2>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Hakkımızda Yazısı</label>
                   <textarea rows={4} value={footerData.aboutText} onChange={e=>setFooterData({...footerData, aboutText: e.target.value})} className="w-full border rounded p-2 text-sm" />
               </div>
               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Copyright Metni</label>
                   <input value={footerData.copyrightText} onChange={e=>setFooterData({...footerData, copyrightText: e.target.value})} className="w-full border rounded p-2 text-sm" />
               </div>
               <div className="border-t pt-4">
                   <h3 className="text-sm font-bold text-gray-900 mb-3">İletişim Bilgileri</h3>
                   <div className="space-y-3">
                       <input value={footerData.address} onChange={e=>setFooterData({...footerData, address: e.target.value})} placeholder="Adres" className="w-full border rounded p-2 text-sm" />
                       <input value={footerData.email} onChange={e=>setFooterData({...footerData, email: e.target.value})} placeholder="E-Posta" className="w-full border rounded p-2 text-sm" />
                       <input value={footerData.phone} onChange={e=>setFooterData({...footerData, phone: e.target.value})} placeholder="Telefon" className="w-full border rounded p-2 text-sm" />
                   </div>
               </div>
           </div>

           <div className="space-y-4 border-l pl-8">
               <h3 className="text-sm font-bold text-gray-900">Sosyal Medya Linkleri</h3>
               <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">Facebook URL</label>
                   <input value={footerData.socialFacebook} onChange={e=>setFooterData({...footerData, socialFacebook: e.target.value})} className="w-full border rounded p-2 text-sm text-blue-600" />
               </div>
               <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">X (Twitter) URL</label>
                   <input value={footerData.socialTwitter} onChange={e=>setFooterData({...footerData, socialTwitter: e.target.value})} className="w-full border rounded p-2 text-sm text-blue-600" />
               </div>
               <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">Instagram URL</label>
                   <input value={footerData.socialInstagram} onChange={e=>setFooterData({...footerData, socialInstagram: e.target.value})} className="w-full border rounded p-2 text-sm text-blue-600" />
               </div>
           </div>
       </div>

       <div className="flex justify-end pt-4 border-t">
           <button disabled={saving} onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Footer Kaydet'}
           </button>
       </div>
    </div>
  )
}
