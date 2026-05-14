import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function AdminNewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    imageUrl: '',
    category: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    status: 'draft',
    isHeadline: false,
    isBreaking: false,
    isSlider: false,
    author: 'Kayserianlık Merkez',
  });

  useEffect(() => {
    // Load categories
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        const cats = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setCategories(cats);
        // set default if empty
        if (cats.length > 0 && !formData.category && !id) {
          setFormData(f => ({...f, category: (cats[0] as any).slug}));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCategories();

    if (id) {
      // Fetch news for editing
      const fetchNews = async () => {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          setFormData({
            ...data,
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
          });
        }
      };
      fetchNews();
    }
  }, [id]);

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!id) {
      setFormData({ ...formData, title, slug: generateSlug(title), seoTitle: title });
    } else {
      setFormData({ ...formData, title });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      let finalCustomData = {
         ...formData,
         tags: tagsArray,
         updatedAt: new Date().toISOString(),
      };

      if (formData.status === 'published' && (!finalCustomData as any).publishedAt) {
         (finalCustomData as any).publishedAt = new Date().toISOString();
      }

      if (id) {
        // Update
        await updateDoc(doc(db, 'news', id), finalCustomData);
      } else {
        // Create
        await addDoc(collection(db, 'news'), {
          ...finalCustomData,
          createdAt: new Date().toISOString(),
          authorId: auth.currentUser?.uid || 'admin',
          views: 0,
        });
      }
      navigate('/admin/news');
    } catch (error) {
      console.error('Error saving news', error);
      alert('Kaydetme hatası: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/news" className="text-gray-500 hover:text-gray-900 border border-gray-200 bg-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition">
           &larr; Geri Dön
        </Link>
        <h1 className="text-2xl font-black font-serif text-gray-900">{id ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h2 className="text-lg font-bold border-b border-gray-100 pb-3 mb-5">Temel Bilgiler</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
               <label className="block text-sm font-bold text-gray-700 mb-1">Başlık <span className="text-red-500">*</span></label>
               <input 
                 type="text" required
                 className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-inner focus:border-red-500 focus:ring-red-500 p-2.5 border"
                 value={formData.title} onChange={handleTitleChange} 
                 placeholder="Haberi özetleyen çarpıcı bir başlık"
               />
             </div>

             <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">URL Yolu (Slug) <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  className="block w-full bg-white rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500 p-2.5 border text-gray-600 font-mono text-sm"
                  value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} 
                />
             </div>

             <div className="md:col-span-1">
               <label className="block text-sm font-bold text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
               <select 
                 required
                 className="block w-full rounded-lg border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 p-2.5 border"
                 value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
               >
                 <option value="" disabled>Kategori Seçiniz</option>
                 {categories.map((cat: any) => (
                   <option key={cat.id} value={cat.name}>{cat.name}</option>
                 ))}
                 {categories.length === 0 && <option value="Gündem">Gündem (Varsayılan)</option>}
               </select>
             </div>

             <div className="md:col-span-2">
               <label className="block text-sm font-bold text-gray-700 mb-1">Kısa Özet (Spot) <span className="text-red-500">*</span></label>
               <textarea 
                 required rows={2}
                 className="block w-full rounded-lg border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 p-2.5 border leading-relaxed"
                 value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} 
                 placeholder="Haber listesinde ve sosyal medyada görünecek özet..."
               />
             </div>

             <div className="md:col-span-2">
               <label className="block text-sm font-bold text-gray-700 mb-1">Haber İçeriği <span className="text-red-500">*</span></label>
               <textarea 
                 required rows={12}
                 className="block w-full rounded-lg border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 p-3 border font-serif text-lg leading-loose"
                 value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} 
                 placeholder="HTML ve formatlar yakında desteklenecek. Şimdilik düz metin..."
               />
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-bold border-b border-gray-100 pb-3 mb-5">Medya & Gösterim</h2>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Resim URL</label>
                 <input 
                   type="text"
                   className="block w-full rounded-lg border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 p-2.5 border"
                   value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                   placeholder="https://..."
                 />
                 {formData.imageUrl && (
                   <img src={formData.imageUrl} alt="Önizleme" className="mt-3 h-40 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                 )}
               </div>

               <div className="pt-4 flex flex-col gap-3">
                  <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                     <input type="checkbox" checked={formData.isSlider} onChange={e => setFormData({...formData, isSlider: e.target.checked})} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                     <span className="font-bold text-blue-900">Slider Haberi Yap</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg cursor-pointer hover:bg-amber-100 transition">
                     <input type="checkbox" checked={formData.isHeadline} onChange={e => setFormData({...formData, isHeadline: e.target.checked})} className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                     <span className="font-bold text-amber-900">Yan Manşet (Slider Yanı)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer hover:bg-red-100 transition">
                     <input type="checkbox" checked={formData.isBreaking} onChange={e => setFormData({...formData, isBreaking: e.target.checked})} className="w-5 h-5 rounded text-red-600 focus:ring-red-500 cursor-pointer" />
                     <span className="font-bold text-red-900">Son Dakika Bantına Ekle 🚨</span>
                  </label>
               </div>
             </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-bold border-b border-gray-100 pb-3 mb-5">SEO & Yayın Ayarları</h2>
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Durum</label>
                  <select 
                    className="block w-full rounded-lg border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 p-2.5 border font-bold"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="draft" className="text-amber-600">Taslak (Yayında Değil)</option>
                    <option value="published" className="text-green-600">Yayında</option>
                  </select>
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Yazar / Kaynak</label>
                 <input 
                   type="text"
                   className="block w-full rounded-lg border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 p-2.5 border"
                   value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} 
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Etiketler (Virgülle ayırın)</label>
                 <input 
                   type="text"
                   className="block w-full rounded-lg border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 p-2.5 border"
                   value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} 
                   placeholder="kayseri, kaza, erciyes..."
                 />
               </div>
               
               <div className="pt-2">
                 <label className="block text-sm font-bold text-gray-700 mb-1">SEO Title (Opsiyonel)</label>
                 <input 
                   type="text"
                   className="block w-full rounded-lg border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 p-2.5 border text-sm"
                   value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} 
                   placeholder="Boş bırakılırsa ana başlık kullanılır"
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">SEO Description (Opsiyonel)</label>
                 <textarea 
                   rows={2}
                   className="block w-full rounded-lg border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 p-2.5 border text-sm"
                   value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} 
                   placeholder="Boş bırakılırsa özet kullanılır"
                 />
               </div>
             </div>
           </div>
        </div>
        
        <div className="flex justify-end gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-inner mt-6">
           <button type="button" onClick={() => navigate('/admin/news')} className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition shadow-sm">
             Vazgeç
           </button>
           <button type="submit" disabled={loading} className="px-8 py-2.5 bg-red-600 text-white font-black rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]">
             {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (id ? 'Değişiklikleri Kaydet' : 'Haberi Yayınla')}
           </button>
        </div>
      </form>
    </div>
  );
}
