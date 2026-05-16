import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';

import AnalyticsBootstrap from './components/AnalyticsBootstrap';
import CookieBanner from './components/CookieBanner';
import Footer from './components/Footer';
import Header from './components/Header';
import NewsletterPopup from './components/NewsletterPopup';
import WhatsAppFab from './components/WhatsAppFab';
import About from './routes/About';
import BlogList from './routes/blog/BlogList';
import BlogPost from './routes/blog/BlogPost';
import Horeca from './routes/Horeca';
import AeroPress from './routes/methods/AeroPress';
import Espresso from './routes/methods/Espresso';
import V60 from './routes/methods/V60';
import Subscription from './routes/Subscription';
import AdminCategories from './routes/admin/Categories';
import AdminCoffeeSubscriptions from './routes/admin/CoffeeSubscriptions';
import AdminDashboard from './routes/admin/Dashboard';
import AdminLayout from './routes/admin/Layout';
import AdminLogin from './routes/admin/Login';
import AdminLoginVerify from './routes/admin/LoginVerify';
import AdminOrders from './routes/admin/Orders';
import AdminProducts from './routes/admin/Products';
import AdminSettings from './routes/admin/Settings';
import AdminShipping from './routes/admin/Shipping';
import AdminSubscriptions from './routes/admin/Subscriptions';
import Cart from './routes/Cart';
import Checkout from './routes/Checkout';
import CheckoutError from './routes/CheckoutError';
import CuentaCallback from './routes/cuenta/Callback';
import CuentaDashboard from './routes/cuenta/Dashboard';
import CuentaLogin from './routes/cuenta/Login';
import Home from './routes/Home';
import KhipuReturn from './routes/KhipuReturn';
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
  const showPopup = !isAdmin && !isCheckoutFlow && location.pathname !== '/carrito';

  return (
    <div className="flex min-h-dvh flex-col">
      <AnalyticsBootstrap />
      {!isAdmin && <Header />}
      <main className="flex-1">
        <Routes>
          {/* Storefront — rutas canónicas en español */}
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Shop />} />
          <Route path="/cafe/:slug" element={<Product />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/khipu/return" element={<KhipuReturn />} />
          <Route path="/thanks/:orderId" element={<Thanks />} />
          <Route path="/checkout/error" element={<CheckoutError />} />
          <Route path="/cuenta/login" element={<CuentaLogin />} />
          <Route path="/cuenta/callback" element={<CuentaCallback />} />
          <Route path="/cuenta" element={<CuentaDashboard />} />
          <Route path="/sobre-nosotros" element={<About />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/metodos/v60" element={<V60 />} />
          <Route path="/metodos/aeropress" element={<AeroPress />} />
          <Route path="/metodos/espresso" element={<Espresso />} />
          <Route path="/horeca" element={<Horeca />} />
          <Route path="/suscripcion" element={<Subscription />} />
          <Route path="/privacidad" element={<Privacy />} />
          <Route path="/terminos" element={<Terms />} />

          {/* Redirects 301 desde rutas viejas en inglés (preservan SEO indexado) */}
          <Route path="/shop" element={<Navigate to="/tienda" replace />} />
          <Route path="/shop/:slug" element={<RedirectShopProduct />} />
          <Route path="/cart" element={<Navigate to="/carrito" replace />} />
          {/* Aliases comunes */}
          <Route path="/nosotros" element={<Navigate to="/sobre-nosotros" replace />} />
          <Route path="/about" element={<Navigate to="/sobre-nosotros" replace />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/login/verify" element={<AdminLoginVerify />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coffee-subscriptions" element={<AdminCoffeeSubscriptions />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="shipping" element={<AdminShipping />} />
            <Route path="settings" element={<AdminSettings />} />
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

function RedirectShopProduct() {
  const { slug } = useParams();
  return <Navigate to={`/cafe/${slug}`} replace />;
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">404</h1>
      <p className="mt-3 text-tengu-dark/60">Página no encontrada.</p>
    </div>
  );
}
