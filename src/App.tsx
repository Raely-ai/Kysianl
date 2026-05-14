import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './AppContext';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import Header from './components/Header';
import Footer from './components/Footer';
import BreakingNewsTicker from './components/BreakingNewsTicker';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminNewsList from './pages/admin/AdminNewsList';
import AdminNewsForm from './pages/admin/AdminNewsForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBreaking from './pages/admin/AdminBreaking';
import AdminHomepage from './pages/admin/AdminHomepage';
import AdminAds from './pages/admin/AdminAds';
import AdminSocial from './pages/admin/AdminSocial';
import AdminMarketAPI from './pages/admin/AdminMarketAPI';
import AdminWeatherAPI from './pages/admin/AdminWeatherAPI';
import AdminSEO from './pages/admin/AdminSEO';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMenu from './pages/admin/AdminMenu';

import CategoryPage from './pages/CategoryPage';

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <BreakingNewsTicker />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/haber/:slug" element={<NewsDetail />} />
              <Route path="/kategori/:slug" element={<CategoryPage />} />
            </Route>

            {/* Admin API Routes - No Header/Footer */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="news" element={<AdminNewsList />} />
              <Route path="news/new" element={<AdminNewsForm />} />
              <Route path="news/edit/:id" element={<AdminNewsForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="breaking" element={<AdminBreaking />} />
              <Route path="homepage" element={<AdminHomepage />} />
              <Route path="menu" element={<AdminMenu />} />
              <Route path="ads" element={<AdminAds />} />
              <Route path="social" element={<AdminSocial />} />
              <Route path="market" element={<AdminMarketAPI />} />
              <Route path="weather" element={<AdminWeatherAPI />} />
              <Route path="seo" element={<AdminSEO />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </HelmetProvider>
  );
}
