import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockRenderer from '../../components/homeBlocks/BlockRenderer';
import { Monitor, Smartphone, Tablet, Save, Plus, Check, PanelLeft, LayoutTemplate, Trash2, GripVertical, ArrowUp, ArrowDown, Columns, Box } from 'lucide-react';
import CustomBlockBuilder from './builders/CustomBlockBuilder';
import HeaderMenuBuilder from './builders/HeaderMenuBuilder';
import FooterBuilder from './builders/FooterBuilder';
import SidebarBuilder from './builders/SidebarBuilder';

const blockLibrary = [
  // Manşet / Üst
  { type: 'slider_plus_two', name: 'Slider + 2 Yan Haber', img: 'https://placehold.co/200x120/111827/ffffff?text=Slider%20%2B%202', limit: 7 },
  { type: 'four_news_grid', name: '4\'lü Haber Izgarası', img: 'https://placehold.co/200x120/111827/ffffff?text=4+Grid', limit: 4 },
  { type: 'three_news_grid', name: '3\'lü Haber Izgarası', img: 'https://placehold.co/200x120/111827/ffffff?text=3+Grid', limit: 3 },
  // Listeler
  { type: 'category_news_grid', name: 'Kategori - Liste', img: 'https://placehold.co/200x120/111827/ffffff?text=Kategori', limit: 6 },
  { type: 'popular_news', name: 'En Çok Okunanlar', img: 'https://placehold.co/200x120/111827/ffffff?text=Populer', limit: 5 },
  { type: 'latest_news', name: 'En Yeni Haberler', img: 'https://placehold.co/200x120/111827/ffffff?text=En+Yeni', limit: 10 },
  { type: 'editors_choice', name: 'Editörün Seçtikleri', img: 'https://placehold.co/200x120/111827/ffffff?text=Editor', limit: 4 },
  // Şeritler / Medya
  { type: 'breaking_ticker', name: 'Son Dakika Şeridi', img: 'https://placehold.co/200x60/111827/ffffff?text=Son+Dakika' },
  { type: 'video_news', name: 'Video Galerisi', img: 'https://placehold.co/200x120/111827/ffffff?text=Video', limit: 3 },
  { type: 'photo_gallery', name: 'Foto Galerisi', img: 'https://placehold.co/200x120/111827/ffffff?text=Foto', limit: 4 },
  // Widget
  { type: 'whatsapp_box', name: 'WhatsApp Uyarı', img: 'https://placehold.co/200x80/111827/ffffff?text=WhatsApp' },
  { type: 'social_box', name: 'Sosyal Medya', img: 'https://placehold.co/200x80/111827/ffffff?text=Sosyal' },
  { type: 'market_data', name: 'Para Piyasaları', img: 'https://placehold.co/200x80/111827/ffffff?text=Piyasa' },
  { type: 'weather_widget', name: 'Hava Durumu', img: 'https://placehold.co/200x80/111827/ffffff?text=Hava' },
  // Reklam
  { type: 'ad_banner_970', name: 'Reklam Alanı (970x90)', img: 'https://placehold.co/200x60/111827/ffffff?text=Reklam+970' },
  { type: 'ad_banner_728', name: 'Reklam Alanı (728x90)', img: 'https://placehold.co/200x60/111827/ffffff?text=Reklam+728' },
  { type: 'ad_banner_300', name: 'Reklam Alanı (300x250)', img: 'https://placehold.co/200x150/111827/ffffff?text=Reklam+300' },
  // Layout Helpers
  { type: 'section_title', name: 'Bölüm Başlığı', img: 'https://placehold.co/200x40/111827/ffffff?text=Baslik' },
  { type: 'spacer', name: 'Boşluk (Spacer)', img: 'https://placehold.co/200x40/111827/ffffff?text=Spacer' },
  { type: 'custom_html', name: 'Özel HTML', img: 'https://placehold.co/200x80/111827/ffffff?text=HTML' },
];

const sectionLayouts = [
  { id: '100', name: 'Tek Kolon', icon: '100%' },
  { id: '50-50', name: 'İki Kolon (Eşit)', icon: '50|50' },
  { id: '70-30', name: 'Ana İçerik + Sağ Sidebar (70/30)', icon: '70|30' },
  { id: '30-70', name: 'Sol Sidebar + Ana İçerik (30/70)', icon: '30|70' },
  { id: '66-34', name: 'Klasik Haber (66/34)', icon: '66|34' },
  { id: '33-33-33', name: 'Üç Kolon (Eşit)', icon: '33|33|33' },
];

const dummyNews = Array.from({length: 12}).map((_, i) => ({
  id: `mock-${i}`,
  title: `Kayseri'de Örnek Haber Başlığı Çok Çarpıcı Bir Şekilde Sunuldu ${i + 1}`,
  slug: `ornek-haber-${i}`,
  category: "Gündem",
  summary: "Haberin örnek özet metni burada yer alacaktır. İçerik hakkında bilgi verir...",
  createdAt: new Date().toISOString(),
  imageUrl: `https://picsum.photos/seed/kayseri${i+10}/800/600`,
}));

type SelectedEntity = { type: 'section' | 'column' | 'block', id: string } | null;

function SortableBlockItem({ id, block, isSelected, onClick, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={onClick}
      className={`relative mb-6 cursor-pointer group rounded-xl transition-all ${isSelected ? 'ring-2 ring-blue-500 shadow-md outline-none bg-blue-50/10' : 'hover:bg-gray-50'}`}
    >
      <div 
         {...attributes} 
         {...listeners} 
         className={`absolute -left-12 top-4 bg-white shadow rounded p-2 text-gray-400 hover:text-blue-600 transition-opacity z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <GripVertical size={20} />
      </div>
      {isSelected && (
        <div className="absolute -right-3 -top-3 z-[60]">
          <button 
             type="button"
             onPointerDown={(e) => e.stopPropagation()}
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(id); }}
             className="bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 flex pointer-events-auto"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
      <div className={`pointer-events-none p-2 opacity-90 group-hover:opacity-100 transition-opacity ${block.settings?.grayBackground ? 'bg-gray-50 p-6 rounded-2xl border border-gray-100' : ''}`}>
        <BlockRenderer block={block} newsList={dummyNews} />
      </div>
    </div>
  );
}

function ColumnContainer({ column, isSelected, onClick, children }: any) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'Column', column },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`flex flex-col flex-1 p-3 min-h-[120px] rounded-xl border-2 transition-all cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50/20 shadow-inner' : 'border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100/50'
      }`}
    >
      <SortableContext items={column.blocks.map((b:any) => b.id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      {column.blocks.length === 0 && (
         <div className="text-xs text-gray-400 text-center mt-4">Buraya blok sürükleyin veya ekleyin</div>
      )}
    </div>
  );
}

export default function AdminHomepage() {
  const [sections, setSections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [leftTab, setLeftTab] = useState<'sections' | 'blocks'>('sections');
  const [builderMode, setBuilderMode] = useState<'homepage' | 'header' | 'footer' | 'sidebar' | 'custom_blocks'>('homepage');
  const [customBlocks, setCustomBlocks] = useState<any[]>([]);

  // Helper to find stuff
  const findColumnById = (id: string, searchSections: any[]) => {
    for(const s of searchSections) {
      for(const c of s.columns) {
         if(c.id === id) return c;
      }
    }
    return null;
  }
  const findColumnOfBlock = (blockId: string, searchSections: any[]) => {
    for(const s of searchSections) {
      for(const c of s.columns) {
         if(c.blocks.find((b:any) => b.id === blockId)) return c;
      }
    }
    return null;
  }
  const findBlockById = (blockId: string, searchSections: any[]) => {
    for(const s of searchSections) {
      for(const c of s.columns) {
         const b = c.blocks.find((b:any) => b.id === blockId);
         if(b) return b;
      }
    }
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catsQ = await getDocs(collection(db, 'categories'));
        setCategories(catsQ.docs.map(d => ({id: d.id, ...d.data()})));

        const customBlocksQ = await getDocs(collection(db, 'customBlocks'));
        setCustomBlocks(customBlocksQ.docs.map(d => ({id: d.id, ...d.data()})));

        const layoutDoc = await getDoc(doc(db, 'homepageLayouts', 'published'));
        if (layoutDoc.exists() && layoutDoc.data().sections) {
            setSections(layoutDoc.data().sections);
        } else if (layoutDoc.exists() && layoutDoc.data().blocks) {
            setSections([{
                id: 'legacy-section',
                layoutParams: '100',
                columns: [{ id: 'col-1', blocks: layoutDoc.data().blocks }]
            }]);
        } else {
            const q = await getDocs(collection(db, 'homepageBlocks'));
            const b = q.docs.map(d => ({id: d.id, ...d.data()})).sort((a: any, b: any) => a.order - b.order);
            setSections([{
                id: 'legacy-default',
                layoutParams: '100',
                columns: [{ id: 'col-1', blocks: b }]
            }]);
        }
      } catch(e) {
          console.error(e);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeColumn = findColumnOfBlock(activeId, sections);
    const overColumn = findColumnById(overId, sections) || findColumnOfBlock(overId, sections);

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id !== overColumn.id) {
      setSections((prevSections) => {
        const next = JSON.parse(JSON.stringify(prevSections));
        const aCol = findColumnById(activeColumn.id, next);
        const oCol = findColumnById(overColumn.id, next);

        const activeItems = aCol.blocks;
        const overItems = oCol.blocks;
        const activeIndex = activeItems.findIndex((b: any) => b.id === activeId);
        const overIndex = overItems.findIndex((b: any) => b.id === overId);

        let newIndex;
        if (overId === oCol.id) { 
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
          const modifier = isBelowOverItem ? 1 : 0;
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        const [item] = aCol.blocks.splice(activeIndex, 1);
        oCol.blocks.splice(newIndex, 0, item);

        return next;
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumnOfBlock(activeId, sections);
    const overColumn = findColumnOfBlock(overId, sections);

    if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.blocks.findIndex((b: any) => b.id === activeId);
      const newIndex = overColumn.blocks.findIndex((b: any) => b.id === overId);

      if (oldIndex !== newIndex) {
        setSections((prev) => {
          const next = JSON.parse(JSON.stringify(prev));
          const col = findColumnById(activeColumn.id, next);
          col.blocks = arrayMove(col.blocks, oldIndex, newIndex);
          return next;
        });
      }
    }
  };

  const generateColumnsForLayout = (layout: string) => {
    const cols = [];
    if (layout === '100') cols.push({ id: `col-${Date.now()}-1` });
    else if (layout === '50-50') cols.push({ id: `col-${Date.now()}-1` }, { id: `col-${Date.now()}-2` });
    else if (layout === '70-30') cols.push({ id: `col-${Date.now()}-1` }, { id: `col-${Date.now()}-2` });
    else if (layout === '30-70') cols.push({ id: `col-${Date.now()}-1` }, { id: `col-${Date.now()}-2` });
    else if (layout === '66-34') cols.push({ id: `col-${Date.now()}-1` }, { id: `col-${Date.now()}-2` });
    else if (layout === '33-33-33') cols.push({ id: `col-${Date.now()}-1` }, { id: `col-${Date.now()}-2` }, { id: `col-${Date.now()}-3` });
    return cols.map(c => ({ ...c, blocks: [] }));
  }

  const handleAddSection = (layoutType: string) => {
     const newSection = {
        id: `section-${Date.now()}`,
        layoutParams: layoutType,
        columns: generateColumnsForLayout(layoutType)
     };
     setSections([...sections, newSection]);
     setSelectedEntity({ type: 'section', id: newSection.id });
     window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const moveSectionUp = (index: number) => {
     if(index === 0) return;
     const newArr = [...sections];
     [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
     setSections(newArr);
  }
  const moveSectionDown = (index: number) => {
     if(index === sections.length - 1) return;
     const newArr = [...sections];
     [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]];
     setSections(newArr);
  }
  const removeSection = (id: string) => {
     if(window.confirm('Bu bölümü siliyorsunuz, emin misiniz?')) {
        setSections(sections.filter(s => s.id !== id));
        if(selectedEntity?.id === id) setSelectedEntity(null);
        console.log('deleted block id', id); // The user requested "deleted block id" log although it's a section
     }
  }

  const handleAddBlock = (libBlock: any) => {
    if (sections.length === 0) {
        alert('Lütfen önce bir bölüm (section) ekleyin.');
        setLeftTab('sections');
        return;
    }
    let targetColId = null;
    if (selectedEntity?.type === 'column' || selectedEntity?.type === 'block') {
        const entityId = selectedEntity.id;
        const col = selectedEntity.type === 'column' ? findColumnById(entityId, sections) : findColumnOfBlock(entityId, sections);
        if(col) targetColId = col.id;
    }
    if (!targetColId) {
        // Fallback to the very last column of the last section if nothing is selected
        targetColId = sections[sections.length - 1].columns[0].id;
    }

    const newBlock = {
      id: `block-${Date.now()}`,
      type: libBlock.type,
      title: libBlock.name,
      limit: libBlock.limit || null,
      active: true,
      categorySlug: '',
      settings: {}
    };

    setSections(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const col = findColumnById(targetColId!, next);
        if(col) col.blocks.push(newBlock);
        return next;
    });
    setSelectedEntity({ type: 'block', id: newBlock.id });
  };

  const handleRemoveBlock = (id: string) => {
      console.log('Attempting to remove block', id);
      if(window.confirm('Bloku silmek istediğinize emin misiniz?')) {
          setSections(prev => {
              const next = JSON.parse(JSON.stringify(prev));
              const col = findColumnOfBlock(id, next);
              if(col) col.blocks = col.blocks.filter((b:any) => b.id !== id);
              return next;
          });
          if(selectedEntity?.id === id) setSelectedEntity(null);
          console.log('Deleted block id', id);
      }
  };

  const currentUpdateBlock = (key: string, value: any) => {
      if (selectedEntity?.type !== 'block') return;
      setSections(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const col = findColumnOfBlock(selectedEntity.id, next);
        if(col) {
            col.blocks = col.blocks.map((b:any) => b.id === selectedEntity.id ? { ...b, [key]: value } : b);
        }
        return next;
      });
  };
  
  const currentUpdateSetting = (key: string, value: any) => {
      if (selectedEntity?.type !== 'block') return;
      setSections(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const col = findColumnOfBlock(selectedEntity.id, next);
        if(col) {
            col.blocks = col.blocks.map((b:any) => {
                if(b.id === selectedEntity.id) {
                    return { ...b, settings: { ...(b.settings || {}), [key]: value } };
                }
                return b;
            });
        }
        return next;
      });
  };

  const saveLayout = async (type: 'draft' | 'published') => {
      setSavingStatus('Kaydediliyor...');
      try {
         await setDoc(doc(db, 'homepageLayouts', type), {
             sections: sections,
             updatedAt: new Date().toISOString()
         });
         setSavingStatus(type === 'published' ? 'Yayına Alındı!' : 'Taslak Kaydedildi!');
         setTimeout(() => setSavingStatus(null), 3000);
      } catch (e: any) {
         setSavingStatus(`Hata: ${e.message}`);
         setTimeout(() => setSavingStatus(null), 5000);
      }
  };

  const getColumnClass = (layout: string, index: number) => {
    if (previewMode === 'mobile') return 'w-full';
    if (layout === '100') return 'w-full';
    if (layout === '50-50') return 'w-[50%]';
    if (layout === '70-30') return index === 0 ? 'w-[70%]' : 'w-[30%]';
    if (layout === '30-70') return index === 0 ? 'w-[30%]' : 'w-[70%]';
    if (layout === '66-34') return index === 0 ? 'w-[66%]' : 'w-[34%]';
    if (layout === '33-33-33') return 'w-[33.33%]';
    return 'w-full';
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

  const activeSelectedBlock = selectedEntity?.type === 'block' ? findBlockById(selectedEntity.id, sections) : null;

  const blockLibraryFull = [
    ...blockLibrary,
    ...customBlocks.map(cb => ({
        type: 'custom_generated',
        customBlockId: cb.id,
        name: cb.name || 'Özel Blok',
        img: 'https://placehold.co/200x80/2563eb/ffffff?text=Ozel+Blok',
        limit: cb.limit
    }))
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-gray-50 -m-6">
      
      {/* Builder Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-20">
         <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                 <LayoutTemplate size={20} />
             </div>
             <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight">Tam Site Görsel CMS</h1>
                <div className="flex gap-4 mt-1">
                  <button onClick={() => setBuilderMode('homepage')} className={`text-xs font-bold uppercase tracking-wider ${builderMode === 'homepage' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>Ana Sayfa</button>
                  <button onClick={() => setBuilderMode('custom_blocks')} className={`text-xs font-bold uppercase tracking-wider ${builderMode === 'custom_blocks' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>Özel Blok Üretici</button>
                  <button onClick={() => setBuilderMode('header')} className={`text-xs font-bold uppercase tracking-wider ${builderMode === 'header' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>Header / Menü</button>
                  <button onClick={() => setBuilderMode('footer')} className={`text-xs font-bold uppercase tracking-wider ${builderMode === 'footer' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>Footer</button>
                  <button onClick={() => setBuilderMode('sidebar')} className={`text-xs font-bold uppercase tracking-wider ${builderMode === 'sidebar' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>Sidebar & Detay</button>
                </div>
             </div>
         </div>
         
         <div className="flex bg-gray-100 p-1 rounded-lg">
             <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-md transition ${previewMode === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                 <Monitor size={18} />
             </button>
             <button onClick={() => setPreviewMode('tablet')} className={`p-2 rounded-md transition ${previewMode === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                 <Tablet size={18} />
             </button>
             <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-md transition ${previewMode === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                 <Smartphone size={18} />
             </button>
         </div>

         <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-green-600 mr-2">{savingStatus}</span>
             <button onClick={() => saveLayout('draft')} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition">
                <Save size={16} /> Taslak
             </button>
             <button onClick={() => saveLayout('published')} className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition">
                <Check size={16} /> Yayına Al
             </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Main content of the builder switches based on builderMode */}
         {builderMode === 'custom_blocks' && (
           <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
               <CustomBlockBuilder onCreated={() => {
                   // Refresh custom blocks
                   getDocs(collection(db, 'customBlocks')).then(q => {
                       setCustomBlocks(q.docs.map(d => ({id: d.id, ...d.data()})));
                   });
               }} />
           </div>
         )}
         {builderMode === 'header' && (
           <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
               <HeaderMenuBuilder />
           </div>
         )}
         {builderMode === 'footer' && (
           <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
               <FooterBuilder />
           </div>
         )}
         {builderMode === 'sidebar' && (
           <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
               <SidebarBuilder />
           </div>
         )}
         
         {builderMode === 'homepage' && (
           <>
         {/* Left: Library */}
         <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
               <button onClick={() => setLeftTab('sections')} className={`flex-1 p-3 text-sm font-bold border-b-2 transition-colors ${leftTab === 'sections' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>Bölümler</button>
               <button onClick={() => setLeftTab('blocks')} className={`flex-1 p-3 text-sm font-bold border-b-2 transition-colors ${leftTab === 'blocks' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>Bloklar</button>
            </div>
            
            <div className="p-3 space-y-3">
               {leftTab === 'sections' && sectionLayouts.map(lib => (
                   <div key={lib.id} className="group border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-blue-300 hover:shadow-md transition cursor-pointer p-4 flex flex-col items-center justify-center gap-2" onClick={() => handleAddSection(lib.id)}>
                       <Columns size={32} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                       <div className="text-[13px] font-bold text-gray-700 text-center">{lib.name}</div>
                       <div className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">{lib.icon}</div>
                   </div>
               ))}

               {leftTab === 'blocks' && blockLibraryFull.map(lib => (
                   <div key={lib.type + (lib.customBlockId || '')} className="group border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-blue-300 hover:shadow-md transition cursor-pointer" onClick={() => handleAddBlock(lib)}>
                       <div className="h-20 bg-gray-100 flex items-center justify-center border-b border-gray-100 p-2">
                           <img src={lib.img} alt={lib.name} className="max-h-full opacity-80 group-hover:opacity-100 transition" />
                       </div>
                       <div className="p-2.5 flex justify-between items-center">
                           <span className="text-[13px] font-bold text-gray-700">{lib.name}</span>
                           <div className="w-6 h-6 bg-gray-50 rounded flex items-center justify-center text-blue-600 group-hover:bg-blue-50">
                               <Plus size={14} />
                           </div>
                       </div>
                   </div>
               ))}
               {leftTab === 'blocks' && (
                  <p className="text-xs text-gray-500 text-center mt-4">Sol panelden blok ismine tıklayarak en son seçilen kolona ekleyebilirsiniz.</p>
               )}
            </div>
         </div>

         {/* Center: Canvas Preview */}
         <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100/50" onClick={() => setSelectedEntity(null)}>
            <div className={`mx-auto transition-all duration-300 ${
                 previewMode === 'mobile' ? 'w-[375px]' :
                 previewMode === 'tablet' ? 'w-[768px]' : 'w-full max-w-[1280px]'
               } min-h-[800px] flex flex-col mb-20`}>
                 
                 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                   {sections.map((section, sIdx) => (
                     <div key={section.id} className={`relative mb-8 rounded-2xl bg-white border-2 transition-all ${selectedEntity?.type === 'section' && selectedEntity?.id === section.id ? 'border-blue-500 shadow-md ring-4 ring-blue-500/10' : 'border-gray-200 shadow-sm'}`}>
                         
                         {/* Section Header */}
                         <div 
                           className={`p-3 border-b flex justify-between items-center rounded-t-xl cursor-pointer ${selectedEntity?.type === 'section' && selectedEntity?.id === section.id ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100'}`}
                           onClick={(e) => { e.stopPropagation(); setSelectedEntity({ type: 'section', id: section.id }); }}
                         >
                           <div className="font-bold text-sm text-gray-700 flex items-center gap-2">
                               <Columns size={16} className={selectedEntity?.id === section.id ? 'text-blue-600' : 'text-gray-400'} />
                               Bölüm: {sectionLayouts.find(l=>l.id === section.layoutParams)?.name}
                           </div>
                           <div className="flex items-center gap-2">
                              {sIdx > 0 && <button onClick={(e) => { e.stopPropagation(); moveSectionUp(sIdx); }} className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-white transition"><ArrowUp size={16}/></button>}
                              {sIdx < sections.length - 1 && <button onClick={(e) => { e.stopPropagation(); moveSectionDown(sIdx); }} className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-white transition"><ArrowDown size={16}/></button>}
                              <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-white ml-2 transition"><Trash2 size={16}/></button>
                           </div>
                         </div>
                         
                         {/* Columns */}
                         <div className={`p-4 md:p-6 flex gap-4 md:gap-6 ${previewMode === 'mobile' ? 'flex-col' : 'flex-row'}`}>
                            {section.columns.map((col: any, cIdx: number) => (
                              <div key={col.id} className={`${getColumnClass(section.layoutParams, cIdx)} flex flex-col`}>
                                  <ColumnContainer 
                                     column={col} 
                                     isSelected={selectedEntity?.type === 'column' && selectedEntity?.id === col.id}
                                     onClick={(e:any) => { e.stopPropagation(); setSelectedEntity({ type: 'column', id: col.id }); }}
                                  >
                                     {col.blocks.map((block: any) => (
                                         <SortableBlockItem 
                                             key={block.id}
                                             id={block.id}
                                             block={block}
                                             isSelected={selectedEntity?.type === 'block' && selectedEntity?.id === block.id}
                                             onClick={(e:any) => { e.stopPropagation(); setSelectedEntity({ type: 'block', id: block.id }); }}
                                             onRemove={handleRemoveBlock}
                                         />
                                     ))}
                                  </ColumnContainer>
                              </div>
                            ))}
                         </div>
                     </div>
                   ))}
                 </DndContext>
                 {sections.length === 0 && (
                     <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white border border-gray-200 border-dashed rounded-2xl h-96">
                         <LayoutTemplate size={48} className="mb-4 opacity-20" />
                         <p className="text-lg font-medium">Sayfa düzeni boş.</p>
                         <p className="text-sm mt-1">Sol panelden bir Bölüm ekleyerek başlayın.</p>
                     </div>
                 )}
            </div>
         </div>

         {/* Right: Settings */}
         <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto hidden xl:block">
            {selectedEntity ? (
                <div>
                   <div className="p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 flex items-start gap-3">
                       {selectedEntity.type === 'block' && <Box size={24} className="text-blue-600 mt-1" />}
                       {selectedEntity.type === 'section' && <Columns size={24} className="text-purple-600 mt-1" />}
                       {selectedEntity.type === 'column' && <PanelLeft size={24} className="text-orange-600 mt-1" />}
                       <div>
                         <h3 className="font-bold text-sm text-gray-800 capitalize">{selectedEntity.type} Ayarları</h3>
                         {selectedEntity.type === 'block' && activeSelectedBlock && (
                            <p className="text-xs text-gray-500 mt-1">{blockLibrary.find(l=>l.type===activeSelectedBlock.type)?.name || activeSelectedBlock.type}</p>
                         )}
                       </div>
                   </div>
                   
                   {/* Block Settings */}
                   {selectedEntity.type === 'block' && activeSelectedBlock && (
                     <div className="p-5 space-y-5">
                         <div>
                             <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Blok Başlığı</label>
                             <input type="text" value={activeSelectedBlock.title || ''} onChange={e => currentUpdateBlock('title', e.target.value)} className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Örn: Güncel Haberler" />
                         </div>
                         
                         {['four_news_grid', 'category_news_grid', 'slider_plus_two'].includes(activeSelectedBlock.type) && (
                             <>
                             <div>
                                 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Kategori Kaynağı</label>
                                 <select value={activeSelectedBlock.categorySlug || ''} onChange={e => currentUpdateBlock('categorySlug', e.target.value)} className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                     <option value="">Tümü (Genel Haberler)</option>
                                     {categories.map((c:any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Gösterilecek Veri Sayısı</label>
                                 <input type="number" value={activeSelectedBlock.limit || 4} onChange={e => currentUpdateBlock('limit', parseInt(e.target.value))} className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" min={1} max={20} />
                             </div>
                             </>
                         )}

                         <div className="pt-4 border-t border-gray-100">
                             <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Tasarım & Görünüm</label>
                             <label className="flex items-center gap-3 cursor-pointer text-sm mb-3">
                                 <input type="checkbox" checked={activeSelectedBlock.settings?.hideTitle || false} onChange={e => currentUpdateSetting('hideTitle', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                                 Başlığı Gizle
                             </label>
                             <label className="flex items-center gap-3 cursor-pointer text-sm">
                                 <input type="checkbox" checked={activeSelectedBlock.settings?.grayBackground || false} onChange={e => currentUpdateSetting('grayBackground', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                                 Gri Arka Plan Ekle (Zıtlık için)
                             </label>
                         </div>
                     </div>
                   )}

                   {/* Section / Column settings */}
                   {(selectedEntity.type === 'section' || selectedEntity.type === 'column') && (
                       <div className="p-5 space-y-5">
                           {selectedEntity.type === 'section' && (
                               <>
                                   <div>
                                       <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Bölüm Tipi (Layout)</label>
                                       <select 
                                         value={sections.find(s=>s.id === selectedEntity.id)?.layoutParams || '100'} 
                                         onChange={e => {
                                             const val = e.target.value;
                                             setSections(prev => prev.map(s => s.id === selectedEntity.id ? {...s, layoutParams: val} : s));
                                         }}
                                         className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                       >
                                           {sectionLayouts.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                       </select>
                                       <p className="text-[10px] text-orange-500 mt-1">Uyarı: Layout değişimi kolon sayılarını etkilemez, varsayılan görünümü değiştirir.</p>
                                   </div>
                               </>
                           )}
                           {selectedEntity.type === 'section' && (() => {
                               const sec = sections.find(s=>s.id === selectedEntity.id);
                               return (
                                <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Bölüm ID (Opsiyonel)</label>
                                    <input type="text" value={sec?.sectionId || ''} onChange={e => {
                                        setSections(prev => prev.map(s => s.id === selectedEntity.id ? {...s, sectionId: e.target.value} : s));
                                    }} className="w-full border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="HTML id değeri" />
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <label className="flex items-center gap-3 cursor-pointer text-sm mb-3">
                                        <input type="checkbox" checked={sec?.settings?.hideOnMobile || false} onChange={e => {
                                             setSections(prev => prev.map(s => s.id === selectedEntity.id ? {...s, settings: {...s.settings, hideOnMobile: e.target.checked}} : s));
                                         }} className="w-4 h-4 text-blue-600 rounded" />
                                        Mobilde Gizle
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer text-sm mb-3">
                                        <input type="checkbox" checked={sec?.settings?.containerFluid || false} onChange={e => {
                                             setSections(prev => prev.map(s => s.id === selectedEntity.id ? {...s, settings: {...s.settings, containerFluid: e.target.checked}} : s));
                                         }} className="w-4 h-4 text-blue-600 rounded" />
                                        Tam Genişlik (Fluid)
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer text-sm">
                                        <input type="checkbox" checked={sec?.settings?.grayBackground || false} onChange={e => {
                                             setSections(prev => prev.map(s => s.id === selectedEntity.id ? {...s, settings: {...s.settings, grayBackground: e.target.checked}} : s));
                                         }} className="w-4 h-4 text-blue-600 rounded" />
                                        Gri Arka Plan (Zıtlık)
                                    </label>
                                </div>
                                </>
                               );
                           })()}

                           {selectedEntity.type === 'column' && (
                               <div>
                                  <p className="text-sm text-gray-500 mb-4">Seçili kolon içinde {sections.flatMap(s=>s.columns).find(c=>c.id === selectedEntity.id)?.blocks?.length || 0} adet blok bulunuyor.</p>
                                  <p className="text-xs text-orange-500">Kolon genişlikleri Bölüm (Section) layout ayarlarına göre otomatik hesaplanır.</p>
                               </div>
                           )}
                       </div>
                   )}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-400 mt-20 flex flex-col items-center">
                    <PanelLeft size={36} className="mb-4 opacity-20" />
                    <p className="text-sm">Ayarlarını görmek istediğiniz bir bölüm, kolon veya bloka tıklayın.</p>
                </div>
            )}
         </div>
         </>
         )}
      </div>
    </div>
  );
}
