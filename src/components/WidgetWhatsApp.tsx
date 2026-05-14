import { MessageCircle } from 'lucide-react';

export default function WidgetWhatsApp() {
  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-8 text-center flex flex-col items-center shadow-sm">
      <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white mb-3 shadow-md">
        <MessageCircle size={30} />
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-1">WhatsApp İhbar Hattı</h3>
      <p className="text-xl font-black text-green-600 mb-2">0543 799 38 38</p>
      <p className="text-sm text-gray-600">Çekin, gönderin, yayınlayalım!</p>
      <a 
        href="https://wa.me/905437993838" 
        target="_blank" 
        rel="noreferrer"
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors flex items-center gap-2"
      >
        Mesaj Gönder
      </a>
    </div>
  );
}
