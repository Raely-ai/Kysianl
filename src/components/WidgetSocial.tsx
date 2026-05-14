export default function WidgetSocial() {
  return (
    <div className="mb-8">
      <div className="border-b-[3px] border-black pb-2 mb-4">
        <h3 className="font-serif font-black text-xl text-gray-900 tracking-tight">Takip Edin</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <a href="#" className="bg-blue-600 text-white rounded-lg p-3 flex flex-col items-center justify-center hover:opacity-90 transition">
           <span className="font-bold text-sm mb-1">Facebook</span>
           <span className="text-xs opacity-80">Beğen</span>
        </a>
        <a href="#" className="bg-gray-900 text-white rounded-lg p-3 flex flex-col items-center justify-center hover:opacity-90 transition">
           <span className="font-bold text-sm mb-1">X (Twitter)</span>
           <span className="text-xs opacity-80">Takip Et</span>
        </a>
        <a href="#" className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-lg p-3 flex flex-col items-center justify-center hover:opacity-90 transition">
           <span className="font-bold text-sm mb-1">Instagram</span>
           <span className="text-xs opacity-80">Takip Et</span>
        </a>
        <a href="#" className="bg-red-600 text-white rounded-lg p-3 flex flex-col items-center justify-center hover:opacity-90 transition">
           <span className="font-bold text-sm mb-1">YouTube</span>
           <span className="text-xs opacity-80">Abone Ol</span>
        </a>
      </div>
    </div>
  );
}
