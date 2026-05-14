import { Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../../firebase';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // NOTE: Gerçekte burada Firestore'dan rol kontrolü yapılmalıdır (isAdmin checker server-side rules'da var).
  // Şimdilik sadece login olması admin panele girmesi için yeterli varsayıyoruz görsel olarak.

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
          <div className="p-4 border-b border-gray-800 font-bold text-xl tracking-wider">
             Kayserianlık.
             <span className="block text-xs font-normal text-gray-400 mt-1">Admin Panel</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
             <a href="/admin" className="block text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors">Dashboard</a>
             <a href="#" className="block text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors">Haber Ekle</a>
             <a href="#" className="block text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors">Kategoriler</a>
          </nav>
          <div className="p-4 border-t border-gray-800">
             <button onClick={() => auth.signOut()} className="w-full text-left text-red-500 hover:text-red-400 text-sm">
                Çıkış Yap
             </button>
          </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
