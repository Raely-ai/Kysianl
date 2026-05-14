import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

export default function HeaderMenuBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    logoText: 'Kayserianlık',
    logoUrl: '',
    showLiveButton: true,
    showSearch: true,
    showAdminLink: true,
    isSticky: true,
  });
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const docRef = await getDoc(doc(db, 'siteLayouts', 'header'));
        const sdocRef = await getDoc(doc(db, 'settings', 'general'));
        
        if (docRef.exists() && docRef.data().menuItems) {
            setMenuItems(docRef.data().menuItems);
        } else {
            setMenuItems([
                { id: '1', title: 'Ana Sayfa', url: '/', active: true },
                { id: '2', title: 'Gündem', url: '/kategori/gundem', active: true }
            ]);
        }
        
        if (sdocRef.exists()) {
            setSettings(prev => ({...prev, ...sdocRef.data()}));
        }
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteLayouts', 'header'), { menuItems });
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
      alert('Header ve Menü başarıyla kaydedildi! Public site güncellendi.');
    } catch (e) {
      console.error(e);
      alert('Kaydetme hatası.');
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = () => {
      setMenuItems([...menuItems, { id: Date.now().toString(), title: 'Yeni Link', url: '/', active: true }]);
  };

  const updateMenu = (id: string, key: string, value: any) => {
      setMenuItems(menuItems.map(m => m.id === id ? { ...m, [key]: value } : m));
  };
  
  const removeMenu = (id: string) => {
      setMenuItems(menuItems.filter(m => m.id !== id));
  };

  const moveUp = (index: number) => {
      if(index === 0) return;
      const arr = [...menuItems];
      [arr[index-1], arr[index]] = [arr[index], arr[index-1]];
      setMenuItems(arr);
  }

  const moveDown = (index: number) => {
      if(index === menuItems.length - 1) return;
      const arr = [...menuItems];
      [arr[index+1], arr[index]] = [arr[index], arr[index+1]];
      setMenuItems(arr);
  }

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-4xl mx-auto flex flex-col gap-8">
       <div>
           <div className="mb-4 border-b pb-2 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-900">Header Ayarları</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Logo Yazısı</label>
                   <input value={settings.logoText || ''} onChange={e => setSettings({...settings, logoText: e.target.value})} className="w-full border rounded p-2 text-sm" />
               </div>
               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Logo Görsel URL</label>
                   <input value={settings.logoUrl || ''} onChange={e => setSettings({...settings, logoUrl: e.target.value})} placeholder="https://" className="w-full border rounded p-2 text-sm" />
               </div>
           </div>
           <div className="flex flex-wrap gap-4 mt-4">
               <label className="flex items-center gap-2 text-sm">
                   <input type="checkbox" checked={settings.showLiveButton} onChange={e => setSettings({...settings, showLiveButton: e.target.checked})} /> Canlı Yayın Butonu
               </label>
               <label className="flex items-center gap-2 text-sm">
                   <input type="checkbox" checked={settings.showSearch} onChange={e => setSettings({...settings, showSearch: e.target.checked})} /> Arama Butonu
               </label>
               <label className="flex items-center gap-2 text-sm">
                   <input type="checkbox" checked={settings.isSticky} onChange={e => setSettings({...settings, isSticky: e.target.checked})} /> Yapışkan (Sticky) Header
               </label>
           </div>
       </div>

       <div>
           <div className="mb-4 border-b pb-2 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-900">Menü Linkleri</h2>
               <button onClick={addMenuItem} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 font-bold"><Plus size={16}/> Menü Ekle</button>
           </div>
           <div className="space-y-3">
               {menuItems.map((item, idx) => (
                   <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                       <GripVertical className="text-gray-400" size={16} />
                       <input value={item.title} onChange={e => updateMenu(item.id, 'title', e.target.value)} className="flex-1 border rounded p-1.5 text-sm" placeholder="Başlık" />
                       <input value={item.url} onChange={e => updateMenu(item.id, 'url', e.target.value)} className="flex-1 border rounded p-1.5 text-sm text-blue-600" placeholder="/url" />
                       <label className="flex items-center gap-1 text-xs font-bold text-gray-600">
                           <input type="checkbox" checked={item.active} onChange={e => updateMenu(item.id, 'active', e.target.checked)} /> Aktif
                       </label>
                       
                       <div className="flex gap-1 ml-2">
                           <button onClick={()=>moveUp(idx)} className="p-1 text-gray-500 hover:text-blue-600 hover:bg-white rounded"><ArrowUp size={14}/></button>
                           <button onClick={()=>moveDown(idx)} className="p-1 text-gray-500 hover:text-blue-600 hover:bg-white rounded"><ArrowDown size={14}/></button>
                           <button onClick={()=>removeMenu(item.id)} className="p-1 text-red-500 hover:text-red-700 hover:bg-white rounded"><Trash2 size={14}/></button>
                       </div>
                   </div>
               ))}
               {menuItems.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Menü linki yok</p>}
           </div>
       </div>

       <div className="flex justify-end pt-4 border-t">
           <button disabled={saving} onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
           </button>
       </div>
    </div>
  );
}
