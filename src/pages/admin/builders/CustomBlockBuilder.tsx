import React, { useState } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Save, Plus } from 'lucide-react';

export default function CustomBlockBuilder({ onCreated }: { onCreated?: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    layoutType: 'grid',
    dataSource: 'category',
    categorySlug: '',
    limit: 4,
    desktopColumns: 4,
    tabletColumns: 2,
    mobileColumns: 1,
    cardStyle: 'classic',
    imageRatio: '16:9',
    showTitle: true,
    showSummary: true,
    showDate: true,
    showCategory: true,
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    padding: '16',
    borderRadius: '8',
    active: true
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, 'customBlocks'), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert('Özel blok başarıyla oluşturuldu!');
      setFormData({ ...formData, name: '' });
      if (onCreated) onCreated();
    } catch (error) {
      console.error(error);
      alert('Hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-4xl mx-auto">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">Yeni Özel Blok Oluştur</h2>
        <p className="text-gray-500 text-sm">Buradan oluşturduğunuz bloklar "Özel Bloklarım" kütüphanesine eklenecektir.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Blok Adı</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded p-2 text-sm" placeholder="Örn: Mavi Arka Planlı Liste" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Blok Tipi</label>
            <select name="layoutType" value={formData.layoutType} onChange={handleChange} className="w-full border rounded p-2 text-sm">
              <option value="grid">Grid (Izgara)</option>
              <option value="list">Liste</option>
              <option value="slider">Slider</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Veri Kaynağı</label>
            <select name="dataSource" value={formData.dataSource} onChange={handleChange} className="w-full border rounded p-2 text-sm">
              <option value="latest">Son Haberler</option>
              <option value="category">Kategoriye Göre</option>
              <option value="popular">Çok Okunanlar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Gösterilecek Veri Sayısı</label>
            <input type="number" name="limit" value={formData.limit} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kolon Sayısı (Masaüstü)</label>
            <input type="number" name="desktopColumns" value={formData.desktopColumns} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kolon Sayısı (Tablet)</label>
            <input type="number" name="tabletColumns" value={formData.tabletColumns} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kolon Sayısı (Mobil)</label>
            <input type="number" name="mobileColumns" value={formData.mobileColumns} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Kart Tipi</label>
             <select name="cardStyle" value={formData.cardStyle} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                <option value="classic">Klasik</option>
                <option value="large">Büyük Görsel</option>
                <option value="compact">Kompakt</option>
             </select>
          </div>
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Görsel Oranı</label>
             <select name="imageRatio" value={formData.imageRatio} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                <option value="16:9">16:9 Geniş</option>
                <option value="4:3">4:3 Standart</option>
                <option value="1:1">1:1 Kare</option>
             </select>
          </div>
        </div>

        <div className="border-t pt-4">
           <p className="text-sm font-bold text-gray-700 mb-3">Gösterilecek Öğeler</p>
           <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showTitle" checked={formData.showTitle} onChange={handleChange} /> Başlık</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showSummary" checked={formData.showSummary} onChange={handleChange} /> Özet</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showDate" checked={formData.showDate} onChange={handleChange} /> Tarih</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showCategory" checked={formData.showCategory} onChange={handleChange} /> Kategori Badge</label>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
           <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Arka Plan Rengi</label>
              <input type="color" name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} className="w-full h-10 border rounded p-1" />
           </div>
           <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Yazı Rengi</label>
              <input type="color" name="textColor" value={formData.textColor} onChange={handleChange} className="w-full h-10 border rounded p-1" />
           </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button disabled={saving} type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Özel Bloğu Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
