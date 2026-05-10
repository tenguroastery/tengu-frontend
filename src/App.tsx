import { Route, Routes, useLocation } from 'react-router-dom';

import AnalyticsBootstrap from './components/AnalyticsBootstrap';
import CookieBanner from './components/CookieBanner';
import Footer from './components/Footer';
import Header from './components/Header';
import NewsletterPopup from './components/NewsletterPopup';
import WhatsAppFab from './components/WhatsAppFab';
import About from './routes/About';
import AdminDashboard from './routes/admin/Dashboard';
import AdminLayout from './routes/admin/Layout';
import AdminLogin from './routes/admin/Login';
import AdminLoginVerify from './routes/admin/LoginVerify';
import AdminOrders from './routes/admin/Orders';
import AdminProducts from './routes/admin/Products';
import AdminSubscriptions from './routes/admin/Subscriptions';
import Cart from './routes/Cart';
import Checkout from './routes/Checkout';
import CheckoutError from './routes/CheckoutError';
import Home from './routes/Home';
import Privacy from './routes/legal/Privacy';
import Terms from './routes/legal/Terms';
import Product from './routes/Product';
import Shop from './routes/Shop';
import Thanks from './routes/Thanks';

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCheckoutFlow =
    location.pathname.startsWith('/checkout') || location.pathname.startsWith('/thanks');
  const showPopup = !isAdmin && !isCheckoutFlow && location.pathname !== '/cart';

  return (
    <div className="flex min-h-dvh flex-col">
      <AnalyticsBootstrap />
      {!isAdmin && <Header />}
      <main className="flex-1">
        <Routes>
          {/* Storefront */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thanks/:orderId" element={<Thanks />} />
          <Route path="/checkout/error" element={<CheckoutError />} />
          <Route path="/sobre-nosotros" element={<About />} />
          <Route path="/privacidad" element={<Privacy />} />
          <Route path="/terminos" element={<Terms />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/login/verify" element={<AdminLoginVerify />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {showPopup && <NewsletterPopup />}
      {!isAdmin && <WhatsAppFab />}
      {!isAdmin && <CookieBanner />}
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">404</h1>
      <p className="mt-3 text-tengu-dark/60">Página no encontrada.</p>
    </div>
  );
}
