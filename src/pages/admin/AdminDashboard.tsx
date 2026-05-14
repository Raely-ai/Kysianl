export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Toplam Haber</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">142</p>
         </div>
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Yayındaki Haberler</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">128</p>
         </div>
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Bugün Okunma</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">5.4K</p>
         </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
         <h2 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
         <p className="text-gray-600">Buradan haber ekleyebilir, mevcutları düzenleyebilirsiniz. Geliştirme aşamasındadır.</p>
         <button className="mt-4 bg-gray-900 text-white px-4 py-2 rounded shadow hover:bg-gray-800 transition">
            Yeni Haber Ekle
         </button>
      </div>
    </div>
  );
}
