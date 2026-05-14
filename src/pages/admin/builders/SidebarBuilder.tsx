import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

const SIDEBAR_BLOCKS = [
    { id: 'popular_news', title: 'Çok Okunan Haberler' },
    { id: 'whatsapp_box', title: 'WhatsApp İhbar Hattı' },
    { id: 'social_box', title: 'Sosyal Medya Hesapları' },
    { id: 'market_data', title: 'Para Piyasaları' },
    { id: 'weather_widget', title: 'Hava Durumu' },
    { id: 'ad_300', title: 'Reklam (300x250)' }
];

export default function SidebarBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
     const fetch = async () => {
         try {
             const docRef = await getDoc(doc(db, 'siteLayouts', 'sidebar'));
             if (docRef.exists() && docRef.data().blocks) {
                 setBlocks(docRef.data().blocks);
             } else {
                 setBlocks([
                     { id: 'popular_news', active: true },
                     { id: 'whatsapp_box', active: true },
                     { id: 'social_box', active: true }
                 ]);
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
          await setDoc(doc(db, 'siteLayouts', 'sidebar'), { blocks });
          alert('Sidebar düzeni güncellendi!');
      } catch(e) {
          alert('Hata');
      } finally {
          setSaving(false);
      }
  }

  const addBlock = (id: string) => {
      if(blocks.find(b => b.id === id)) return;
      setBlocks([...blocks, { id, active: true }]);
  }

  const removeBlock = (id: string) => {
      setBlocks(blocks.filter(b => b.id !== id));
  }

  const toggleActive = (id: string, current: boolean) => {
      setBlocks(blocks.map(b => b.id === id ? { ...b, active: !current } : b));
  }

  const moveUp = (index: number) => {
      if(index === 0) return;
      const arr = [...blocks];
      [arr[index-1], arr[index]] = [arr[index], arr[index-1]];
      setBlocks(arr);
  }

  const moveDown = (index: number) => {
      if(index === blocks.length - 1) return;
      const arr = [...blocks];
      [arr[index+1], arr[index]] = [arr[index], arr[index+1]];
      setBlocks(arr);
  }

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-4xl mx-auto flex flex-col gap-6">
       <div className="border-b pb-4 mb-2">
           <h2 className="text-xl font-bold text-gray-900">Haber Detay Sağ Sidebar Düzeni</h2>
           <p className="text-sm text-gray-500 mt-1">Haber okuma sayfasında sağ tarafta görünecek blokları sıralayın.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
               <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Aktif Bloklar (Sıralı)</h3>
               <div className="space-y-3">
                   {blocks.map((b, idx) => {
                       const libItem = SIDEBAR_BLOCKS.find(l => l.id === b.id);
                       return (
                           <div key={b.id} className={`flex items-center gap-3 p-3 rounded-lg border ${b.active ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
                               <GripVertical className="text-gray-400" size={16} />
                               <span className="flex-1 text-sm font-bold text-gray-800">{libItem?.title || b.id}</span>
                               <label className="flex items-center gap-1 text-xs font-bold text-gray-600">
                                   <input type="checkbox" checked={b.active} onChange={() => toggleActive(b.id, b.active)} /> Göster
                               </label>
                               <div className="flex gap-1 ml-2">
                                   <button onClick={()=>moveUp(idx)} className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"><ArrowUp size={14}/></button>
                                   <button onClick={()=>moveDown(idx)} className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"><ArrowDown size={14}/></button>
                                   <button onClick={()=>removeBlock(b.id)} className="p-1 text-red-500 hover:text-red-700 hover:bg-gray-100 rounded"><Trash2 size={14}/></button>
                               </div>
                           </div>
                       )
                   })}
                   {blocks.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Sağ sidebar boş</p>}
               </div>
           </div>

           <div className="border-l pl-8">
               <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Eklenebilir Bloklar</h3>
               <div className="space-y-2">
                   {SIDEBAR_BLOCKS.map(sb => {
                       const isAdded = blocks.find(b => b.id === sb.id);
                       if(isAdded) return null;
                       return (
                           <div key={sb.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 group">
                               <span className="text-sm font-medium text-gray-700">{sb.title}</span>
                               <button onClick={() => addBlock(sb.id)} className="w-6 h-6 rounded bg-white border border-gray-200 text-blue-600 flex items-center justify-center group-hover:bg-blue-50 transition"><Plus size={14} /></button>
                           </div>
                       )
                   })}
               </div>
           </div>
       </div>

       <div className="flex justify-end pt-4 border-t">
           <button disabled={saving} onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Sidebar Düzenini Kaydet'}
           </button>
       </div>
    </div>
  )
}
