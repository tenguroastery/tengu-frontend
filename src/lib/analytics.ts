/**
 * GA4 + GTM helper.
 *
 * 1. Configura `VITE_GA4_ID` (ej "G-XXXXXXX") en `.env.local` para activar GA4 directo.
 * 2. O usa `VITE_GTM_ID` para inyectar GTM (el container administra GA4).
 * 3. Si ninguna está, los eventos se loggean a consola en dev y son no-op en prod.
 *
 * Eventos clave (estándar GA4 ecommerce):
 *  - view_item, select_item
 *  - add_to_cart, remove_from_cart, view_cart
 *  - begin_checkout, purchase
 *  - newsletter_signup, whatsapp_click, instagram_click
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;
const COOKIE_KEY = 'tengu-cookie-consent';

let bootstrapped = false;

export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COOKIE_KEY) === 'accepted';
}

export function setConsent(value: 'accepted' | 'rejected') {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOKIE_KEY, value);
  if (value === 'accepted') bootstrapAnalytics();
}

export function bootstrapAnalytics() {
  if (bootstrapped) return;
  if (!hasConsent()) return;
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  if (GTM_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(s);
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  } else if (GA4_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(s);
    const gtagFn = function (...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag = gtagFn;
    gtagFn('js', new Date());
    gtagFn('config', GA4_ID, { send_page_view: false });
  }

  bootstrapped = true;
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  if (!hasConsent()) {
    if (import.meta.env.DEV) console.debug('[analytics] (no-consent)', event, params);
    return;
  }
  if (window.gtag) {
    window.gtag('event', event, params);
  } else if (window.dataLayer) {
    window.dataLayer.push({ event, ...params });
  } else if (import.meta.env.DEV) {
    console.debug('[analytics]', event, params);
  }
}

export function trackPageView(path: string) {
  track('page_view', { page_path: path, page_location: window.location.href });
}

// --- Helpers de ecommerce ---

type ItemPayload = {
  item_id: string;
  item_name: string;
  price: number;
  item_variant?: string;
  quantity?: number;
};

export const ecommerceEvents = {
  viewItem: (item: ItemPayload) => track('view_item', { currency: 'CLP', value: item.price, items: [item] }),
  addToCart: (item: ItemPayload) => track('add_to_cart', { currency: 'CLP', value: (item.price * (item.quantity ?? 1)), items: [item] }),
  beginCheckout: (items: ItemPayload[], total: number) =>
    track('begin_checkout', { currency: 'CLP', value: total, items }),
  purchase: (orderId: number, items: ItemPayload[], total: number) =>
    track('purchase', { transaction_id: String(orderId), currency: 'CLP', value: total, items }),
  newsletterSignup: () => track('newsletter_signup', { method: 'popup_or_footer' }),
  whatsappClick: (location: string) => track('whatsapp_click', { location }),
};
