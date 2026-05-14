import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, PlayCircle } from 'lucide-react';
import FinanceBar from './FinanceBar';
import { useAppContext } from '../AppContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { initData } = useAppContext();

  // Load from context or default
  let menuItems = initData?.menuItems || [];
  const headerLayout = initData?.headerLayout || {};
  const { logoText = 'Kayserianlık', logoUrl = '', showLiveButton = true, showSearch = true, showAdminLink = true, isSticky = true } = headerLayout;
  
  if (menuItems.length === 0) {
    const categories = initData?.categories?.filter((c:any) => c.showInMenu) || [];
    menuItems = [
      { id: '1', title: 'Anasayfa', url: '/' },
      ...categories.map((c:any) => ({ id: c.id, title: c.name, url: `/kategori/${c.slug}` }))
    ];

    if (menuItems.length === 1) {
      menuItems.push(
        { id: '2', title: 'Güncel', url: '/kategori/guncel' },
        { id: '3', title: 'Siyaset', url: '/kategori/siyaset' }
      );
    }
  }

  return (
    <header className={`bg-white border-b-2 border-gray-100 ${isSticky ? 'sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]' : ''}`}>
      <FinanceBar />

      {/* Main Logo & Navigation Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center mr-8">
            <Link to="/" className="flex items-baseline group hover:opacity-90 transition-opacity">
              {logoUrl ? (
                  <img src={logoUrl} alt={logoText} className="max-h-12" />
              ) : (
                  <>
                  <span className="font-serif font-black text-4xl tracking-tighter text-red-700">Kayseri</span>
                  <span className="font-serif font-black text-4xl tracking-tighter text-gray-900">anlık</span>
                  <span className="text-red-600 text-4xl leading-none">.</span>
                  </>
              )}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex flex-1 space-x-2 justify-center overflow-x-auto">
            {menuItems.map((item: any) => (
              <Link 
                key={item.id} 
                to={item.url} 
                className="text-gray-800 hover:text-white hover:bg-red-700 px-4 py-2.5 rounded-lg text-[15px] font-bold tracking-wide transition-all whitespace-nowrap"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 lg:gap-5 ml-4">
            {showLiveButton && (
                <Link to="/canli-yayin" className="hidden lg:flex items-center gap-1.5 text-red-700 font-bold hover:text-white text-sm border-2 border-red-100 px-4 py-2 rounded-full hover:bg-red-700 hover:border-red-700 transition-all shadow-sm">
                <PlayCircle size={18} className="animate-pulse" />
                Canlı Yayın
                </Link>
            )}
            {showSearch && (
                <button className="text-gray-900 bg-gray-100 hover:bg-gray-200 hover:text-red-700 p-2.5 rounded-full transition-colors">
                <Search size={20} />
                </button>
            )}
            {showAdminLink && (
                <Link to="/admin" className="hidden lg:block text-gray-400 hover:text-gray-800 text-xs font-bold tracking-wider uppercase ml-2">
                Yönetim
                </Link>
            )}
            <button 
              className="lg:hidden text-gray-900 bg-gray-100 hover:bg-red-50 hover:text-red-700 p-2.5 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t-2 border-gray-100 shadow-inner absolute w-full left-0">
          <div className="px-4 py-6 space-y-2">
            {menuItems.map((item: any) => (
               <Link 
                 key={item.name} 
                 to={item.path} 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="block px-4 py-3.5 rounded-xl text-[17px] font-bold text-gray-900 border border-gray-100 hover:border-red-200 hover:text-red-700 hover:bg-red-50 transition-all shadow-sm"
               >
                 {item.name}
               </Link>
            ))}
            <div className="border-t-2 border-gray-100 my-4 pt-4"></div>
            <Link to="/canli-yayin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-lg font-bold text-white bg-red-700 hover:bg-red-800 shadow-md">
              <PlayCircle size={24} />
              Kayserianlık Canlı Yayın
            </Link>
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-center rounded-xl text-sm font-bold tracking-wider text-gray-500 hover:text-gray-900 mt-2">
              SİSTEM YÖNETİMİ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
