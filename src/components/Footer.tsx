import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-serif font-bold text-2xl tracking-tight text-white mb-4 block">
              Kayserianlık.
            </span>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Kayseri'nin en güncel, en hızlı ve güvenilir haber platformu. Sadece haberi değil, haberin perde arkasını da sizlere ulaştırıyoruz.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-gray-300">Kategoriler</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Son Dakika</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Gündem</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Spor</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Siyaset</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-gray-300">Kurumsal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">İletişim</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Künye</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Kayserianlık. Tüm hakları saklıdır.
          </p>
          <div className="flex space-x-6 text-gray-500">
             {/* Sosyal Medya İkonları vs Gelecek */}
          </div>
        </div>
      </div>
    </footer>
  );
}
