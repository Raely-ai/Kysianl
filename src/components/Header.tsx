import { Link } from 'react-router-dom';
import { Search, Menu, TrendingUp } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      {/* Topbar: Çok küçük duyurular veya Son Dakika bülteni için */}
      <div className="bg-red-700 text-white py-1.5 px-4 text-xs font-medium tracking-wide flex justify-center items-center">
        <span className="flex items-center gap-2">
           <TrendingUp size={14} /> ŞU AN: Kayseri'deki yoğun kar yağışı nedeniyle okullara tatil uyarısı verildi.
        </span>
      </div>

      {/* Main Logo & Navigation Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-baseline">
              <span className="font-serif font-bold text-3xl tracking-tight text-red-700">Kayseri</span>
              <span className="font-serif font-bold text-3xl tracking-tight text-gray-900">anlık</span>
              <span className="text-red-600 text-3xl">.</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-900 hover:text-red-700 px-3 py-2 text-sm font-semibold transition-colors">
              Son Dakika
            </Link>
            <Link to="/" className="text-gray-600 hover:text-red-700 px-3 py-2 text-sm font-medium transition-colors">
              Gündem
            </Link>
            <Link to="/" className="text-gray-600 hover:text-red-700 px-3 py-2 text-sm font-medium transition-colors">
              Siyaset
            </Link>
            <Link to="/" className="text-gray-600 hover:text-red-700 px-3 py-2 text-sm font-medium transition-colors">
              Spor
            </Link>
            <Link to="/" className="text-gray-600 hover:text-red-700 px-3 py-2 text-sm font-medium transition-colors">
              İlçeler
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-900 p-2">
              <Search size={20} />
            </button>
            <button className="md:hidden text-gray-500 hover:text-gray-900 p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
