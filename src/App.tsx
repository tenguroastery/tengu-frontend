import { Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import NewsletterPopup from './components/NewsletterPopup';
import WhatsAppFab from './components/WhatsAppFab';
import Cart from './routes/Cart';
import Checkout from './routes/Checkout';
import CheckoutError from './routes/CheckoutError';
import Home from './routes/Home';
import Product from './routes/Product';
import Shop from './routes/Shop';
import Thanks from './routes/Thanks';

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thanks/:orderId" element={<Thanks />} />
          <Route path="/checkout/error" element={<CheckoutError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <NewsletterPopup />
      <WhatsAppFab />
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
