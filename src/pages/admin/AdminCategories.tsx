import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
     name: '',
     slug: '',
     order: 0,
     active: true,
     showInMenu: true
  });

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  const handleNameChange = (e: any) => {
     setFormData({
        ...formData,
        name: e.target.value,
        slug: generateSlug(e.target.value)
     });
  };

  const fetchCats = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      setCategories(snap.docs.map(d => ({id: d.id, ...d.data()})));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCats(); }, []);

  const handleSubmit = async (e: any) => {
     e.preventDefault();
     setFormLoading(true);
     try {
       if (editingId) {
         await updateDoc(doc(db, 'categories', editingId), formData);
       } else {
         await addDoc(collection(db, 'categories'), formData);
       }
       setFormData({name: '', slug: '', order: categories.length + 1, active: true, showInMenu: true});
       setEditingId(null);
       fetchCats();
     } catch (err) { alert(err); } finally { setFormLoading(false); }
  };

  const handleEdit = (cat: any) => {
     setEditingId(cat.id);
     setFormData({ name: cat.name, slug: cat.slug, order: cat.order, active: cat.active ?? true, showInMenu: cat.showInMenu ?? true });
  };

  const handleDelete = async (id: string) => {
     if(window.confirm("Kategoriyi silmek istediğinize emin misiniz?")) {
        await deleteDoc(doc(db, 'categories', id));
        fetchCats();
     }
  };

  return (
    <div>
      <h1 className="text-2xl font-black font-serif text-gray-900 mb-6">Kategori Yönetimi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1 bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="font-bold text-lg mb-4">{editingId ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Adı</label>
               <input type="text" required value={formData.name} onChange={handleNameChange} className="block w-full border border-gray-300 rounded p-2" />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Slug</label>
               <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="block w-full border border-gray-300 rounded p-2 bg-gray-50 text-gray-500" />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Sıra (Menü için)</label>
               <input type="number" required value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="block w-full border border-gray-300 rounded p-2" />
             </div>
             <div className="flex flex-col gap-2">
               <label className="flex items-center gap-2">
                 <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} /> Aktif
               </label>
               <label className="flex items-center gap-2">
                 <input type="checkbox" checked={formData.showInMenu} onChange={e => setFormData({...formData, showInMenu: e.target.checked})} /> Ana Menüde Göster
               </label>
             </div>
             <div className="pt-2">
               <button type="submit" disabled={formLoading} className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700">{formLoading ? '...' : 'Kaydet'}</button>
               {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({name: '', slug: '', order: 0, active: true, showInMenu: true})}} className="w-full mt-2 text-gray-500 underline text-sm">İptal</button>}
             </div>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="p-8 text-center">Yükleniyor...</div> : (
             <table className="min-w-full divide-y divide-gray-200 text-sm">
               <thead className="bg-gray-100">
                 <tr>
                   <th className="px-4 py-3 text-left font-bold text-gray-700">Kategori / Slug</th>
                   <th className="px-4 py-3 text-left font-bold text-gray-700">Sıra</th>
                   <th className="px-4 py-3 text-left font-bold text-gray-700">Durum</th>
                   <th className="px-4 py-3 text-right font-bold text-gray-700">İşlem</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {categories.map(cat => (
                   <tr key={cat.id}>
                     <td className="px-4 py-3 font-bold text-gray-900">{cat.name} <div className="font-normal text-xs text-gray-400">{cat.slug}</div></td>
                     <td className="px-4 py-3">{cat.order}</td>
                     <td className="px-4 py-3">
                       {cat.active ? <span className="text-green-600">Aktif</span> : <span className="text-gray-400">Pasif</span>}
                       {cat.showInMenu && <span className="ml-2 text-blue-600 text-xs text-nowrap">(Menüde)</span>}
                     </td>
                     <td className="px-4 py-3 text-right">
                       <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:underline mr-3">Düzenle</button>
                       <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline">Sil</button>
                     </td>
                   </tr>
                 ))}
                 {categories.length === 0 && <tr><td colSpan={4} className="p-4 text-center">Bulunamadı.</td></tr>}
               </tbody>
             </table>
          )}
        </div>
      </div>
    </div>
  );
}
