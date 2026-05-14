import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext';

export default function Footer() {
  const { initData } = useAppContext();
  
  const siteName = initData?.settings?.general?.siteName || 'Kayserianlık.';
  const footerSettings = initData?.settings?.footer || {};
  const footerText = footerSettings.aboutText || initData?.settings?.general?.footerText || 'Kayseri\'nin en güncel, en hızlı ve güvenilir haber platformu. Şehrin nabzını tutan özel haberler, ropörtajlar ve şehir rehberi.';
  const copyrightText = footerSettings.copyrightText || `© ${new Date().getFullYear()} ${siteName} Tüm hakları saklıdır. İçerikler kaynak gösterilmeden kullanılamaz.`;
  const social = initData?.settings?.social || {};
  let menuItems = initData?.menuItems || [];
  
  if(menuItems.length === 0) {
    const categories = initData?.categories?.filter((c:any) => c.showInMenu) || [];
    menuItems = categories.map((c:any) => ({ id: c.id, title: c.name, url: `/kategori/${c.slug}` }));
  }

  return (
    <footer className="bg-[#111111] text-white mt-auto border-t-[6px] border-red-700">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-6 group hover:opacity-90 transition-opacity">
              <span className="font-serif font-black text-4xl tracking-tighter text-white">Kayseri</span>
              <span className="font-serif font-black text-4xl tracking-tighter text-red-600">anlık</span>
              <span className="text-red-600 text-4xl leading-none">.</span>
            </Link>
            <p className="text-gray-400 text-sm leading-[1.8] max-w-sm mb-8 font-medium">
              {footerText}
            </p>
            <div className="flex gap-4">
              {(footerSettings.socialFacebook || social.facebookUrl) && (
                 <a href={footerSettings.socialFacebook || social.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-gray-800/80 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all text-gray-400 hover:-translate-y-1 shadow-sm">
                    <span className="font-bold text-lg">f</span>
                 </a>
              )}
              {(footerSettings.socialTwitter || social.xUrl) && (
                 <a href={footerSettings.socialTwitter || social.xUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-gray-800/80 flex items-center justify-center hover:bg-black hover:text-white transition-all text-gray-400 hover:-translate-y-1 shadow-sm border border-transparent hover:border-gray-800">
                    <span className="font-bold text-lg">X</span>
                 </a>
              )}
              {(footerSettings.socialInstagram || social.instagramUrl) && (
                 <a href={footerSettings.socialInstagram || social.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-gray-800/80 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500 hover:text-white transition-all text-gray-400 hover:-translate-y-1 shadow-sm">
                    <span className="font-bold text-lg">in</span>
                 </a>
              )}
              {social.youtubeUrl && (
                 <a href={social.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-gray-800/80 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all text-gray-400 hover:-translate-y-1 shadow-sm">
                    <span className="font-bold cursor-pointer text-sm">YT</span>
                 </a>
              )}
            </div>
            {social.whatsappActive && (
               <div className="mt-8">
                 <a href={`https://wa.me/${social.whatsappNumber?.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#20bd5a] transition-all hover:shadow-lg hover:-translate-y-0.5">
                   {social.whatsappTitle || 'WhatsApp İhbar Hattı'}
                 </a>
               </div>
            )}
            {footerSettings.email && (
               <div className="mt-4 text-sm text-gray-400">
                  <p>{footerSettings.address}</p>
                  <p>{footerSettings.email} | {footerSettings.phone}</p>
               </div>
            )}
          </div>
          <div>
            <h3 className="text-[13px] font-black tracking-widest uppercase mb-6 text-gray-100 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-red-600"></div> Sayfalar
            </h3>
            <ul className="space-y-4 text-[15px] text-gray-400 font-medium">
              {menuItems.slice(0, 5).map((c:any, i:number) => (
                <li key={c.id || i}><Link to={c.url} className="hover:text-red-500 transition-colors">{c.title}</Link></li>
              ))}
              {menuItems.length === 0 && (
                 <>
                   <li><Link to="/kategori/guncel" className="hover:text-red-500 transition-colors">Güncel Haberler</Link></li>
                   <li><Link to="/kategori/spor" className="hover:text-red-500 transition-colors">Kayserispor Özel</Link></li>
                   <li><Link to="/canli-yayin" className="hover:text-red-500 transition-colors">Canlı Yayın</Link></li>
                 </>
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-[13px] font-black tracking-widest uppercase mb-6 text-gray-100 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-red-600"></div> Kurumsal
            </h3>
            <ul className="space-y-4 text-[15px] text-gray-400 font-medium">
              <li><Link to="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link to="/kunye" className="hover:text-white transition-colors">Künye</Link></li>
              <li><Link to="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
              <li><Link to="/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link to="/reklam-ver" className="hover:text-white transition-colors">Reklam Ver</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} {siteName} Tüm hakları saklıdır. İçerikler kaynak gösterilmeden kullanılamaz.
          </p>
          <div className="text-gray-600 text-sm font-medium">
            Powered by Tech
          </div>
        </div>
      </div>
    </footer>
  );
}
