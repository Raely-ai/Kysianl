import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, item, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border text-sm border-gray-200 rounded-lg p-3 mb-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-red-600 text-gray-400 p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            <span className="font-bold text-gray-900">{item.name}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">{item.path}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => onEdit(item)} className="text-blue-600 hover:underline font-medium text-xs">Düzenle</button>
        <button onClick={() => onDelete(item.id)} className="text-red-600 hover:underline font-medium text-xs">Sil</button>
      </div>
    </div>
  );
}

export default function AdminMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultForm = {
     name: '',
     path: '',
     active: true,
     order: 0
  };

  const [formData, setFormData] = useState({...defaultForm});

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'menuItems'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({id: d.id, ...d.data()})));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Save new order to Firebase
      setSavingOrder(true);
      try {
        const batch = writeBatch(db);
        newItems.forEach((item: any, index: number) => {
          const ref = doc(db, 'menuItems', item.id);
          batch.update(ref, { order: index });
        });
        await batch.commit();
      } catch (e) {
        console.error(e);
        alert('Sıralama güncellenirken hata oluştu.');
      } finally {
        setSavingOrder(false);
      }
    }
  };

  const handleSubmit = async (e: any) => {
     e.preventDefault();
     setFormLoading(true);
     try {
       if (editingId) {
         await updateDoc(doc(db, 'menuItems', editingId), formData);
       } else {
         await addDoc(collection(db, 'menuItems'), {
           ...formData,
           order: items.length
         });
       }
       setFormData({...defaultForm});
       setEditingId(null);
       fetchData();
     } catch (err) { alert(err); } finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
     if(window.confirm("Menü elemanını silmek istediğinize emin misiniz?")) {
        await deleteDoc(doc(db, 'menuItems', id));
        fetchData();
     }
  };

  const addPathPrefix = (prefix: string) => {
    if(!formData.path.startsWith(prefix)) {
       setFormData({...formData, path: prefix});
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black font-serif text-gray-900 mb-2">Menü Yönetimi</h1>
      <p className="text-gray-500 mb-6 font-medium">Sürükle bırak ile site menünüzü yönetin.</p>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-1 bg-white p-6 rounded-xl border border-gray-200 h-max">
          <h2 className="font-bold text-lg mb-4">{editingId ? 'Menüyü Düzenle' : 'Yeni Menü Ekle'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Görünür İsim (Label)</label>
               <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full border border-gray-300 rounded p-2" placeholder="Örn: Siyaset" />
             </div>
             
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Yol (URL / Path)</label>
               <div className="flex gap-2 mb-2">
                 <button type="button" onClick={() => addPathPrefix('/kategori/')} className="text-[10px] bg-gray-100 px-2 py-1 rounded">Kategori</button>
                 <button type="button" onClick={() => addPathPrefix('/sayfa/')} className="text-[10px] bg-gray-100 px-2 py-1 rounded">Sayfa</button>
                 <button type="button" onClick={() => addPathPrefix('https://')} className="text-[10px] bg-gray-100 px-2 py-1 rounded">Dış Bağlantı</button>
               </div>
               <input type="text" required value={formData.path} onChange={e => setFormData({...formData, path: e.target.value})} className="block w-full border border-gray-300 rounded p-2 font-mono text-xs" placeholder="Örn: /kategori/guncel" />
             </div>

             <div className="flex gap-2 text-base pt-2">
               <label className="flex items-center gap-2 font-bold cursor-pointer">
                 <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 cursor-pointer" /> Aktif
               </label>
             </div>
             
             <div className="pt-2">
               <button type="submit" disabled={formLoading} className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700">{formLoading ? '...' : 'Kaydet'}</button>
               {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({...defaultForm})}} className="w-full mt-2 text-gray-500 underline text-sm">İptal</button>}
             </div>
          </form>
        </div>

        <div className="xl:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-lg">Menü Sıralaması</h2>
             {savingOrder && <span className="text-sm text-green-600 font-bold animate-pulse">Kaydediliyor...</span>}
          </div>
          {loading ? <div className="p-8 text-center">Yükleniyor...</div> : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {items.map(item => (
                  <SortableItem key={item.id} id={item.id} item={item} onEdit={(i: any) => { setEditingId(i.id); setFormData(i); }} onDelete={handleDelete} />
                ))}
              </SortableContext>
              {items.length === 0 && <div className="text-center p-8 text-gray-500">Henüz menü eklenmemiş.</div>}
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
