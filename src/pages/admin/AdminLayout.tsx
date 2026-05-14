import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../../firebase';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-100">Yükleniyor...</div>;
  }

  // Only allow admin@kayserianlik.com and the user's email as a simple guard on top of rules
  if (!user || (user.email !== 'admin@kayserianlik.com' && user.email !== 'hpferdicakir@gmail.com')) {
    auth.signOut();
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    auth.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Haber Yönetimi', path: '/admin/news' },
    { name: 'Yeni Haber', path: '/admin/news/new' },
    { name: 'Kategori Yönetimi', path: '/admin/categories' },
    { name: 'Son Dakika Yönetimi', path: '/admin/breaking' },
    { name: 'Site CMS Builder', path: '/admin/homepage' },
    { name: 'Menü Yönetimi', path: '/admin/menu' },
    { name: 'Reklam Yönetimi', path: '/admin/ads' },
    { name: 'WhatsApp / Sosyal Medya', path: '/admin/social' },
    { name: 'Finans API Ayarları', path: '/admin/market' },
    { name: 'Hava Durumu API Ayarları', path: '/admin/weather' },
    { name: 'SEO Ayarları', path: '/admin/seo' },
    { name: 'Site Ayarları', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      <aside className="w-64 bg-gray-900 text-white flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-gray-800">
             <div className="font-serif font-black text-2xl tracking-tighter">
                Kayseri<span className="text-red-500">anlık.</span>
             </div>
             <span className="block text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Admin Panel</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
             {navItems.map((item) => {
               const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
               return (
                 <Link 
                   key={item.path}
                   to={item.path} 
                   className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                     isActive ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                   }`}
                 >
                   {item.name}
                 </Link>
               );
             })}
          </nav>
          <div className="p-4 border-t border-gray-800 bg-gray-950">
             <div className="text-xs text-gray-500 mb-3 truncate">{user.email}</div>
             <button onClick={handleLogout} className="w-full text-left text-red-500 hover:text-red-400 text-sm font-medium flex items-center justify-between">
                <span>Çıkış Yap</span>
             </button>
          </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-6xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
