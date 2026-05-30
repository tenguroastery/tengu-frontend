import { formatApiError } from './api';
import { notifyInvalidation } from './useRevalidateOnFocus';
import { useAdmin } from '../store/admin';
import type { Order, Post, SiteSettings } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export class AdminAuthError extends Error {
  constructor() {
    super('Sesión expirada');
    this.name = 'AdminAuthError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const jwt = useAdmin.getState().jwt;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (jwt) headers.set('Authorization', `Bearer ${jwt}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  // 403 también limpia sesión: el JWT puede ser válido pero el email ya no
  // está en ADMIN_EMAILS (revocación del lado backend).
  if (res.status === 401 || res.status === 403) {
    useAdmin.getState().clearSession();
    throw new AdminAuthError();
  }
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = formatApiError(body.detail);
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  // Cualquier mutation exitosa avisa a las pestañas del sitio público que
  // refresquen catálogo/settings (BroadcastChannel). Excepciones: login/me
  // (sólo cambian sesión), uploads (ya disparan otra mutation con el slug).
  const method = (init.method || 'GET').toUpperCase();
  if (method !== 'GET' && !path.startsWith('/admin/login') && !path.startsWith('/admin/me')) {
    notifyInvalidation();
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type AdminVariant = {
  id: number;
  size_g: number;
  price_clp: number;
  stock_qty: number;
  compare_at_price_clp: number | null;
};

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  origin: string;
  region: string | null;
  variety: string | null;
  process: string | null;
  altitude_masl: string | null;
  harvest: string | null;
  roast_profile: string;
  producer: string | null;
  body: string | null;
  acidity: string | null;
  tasting_notes: string[];
  category: string;
  image: string | null;
  featured: boolean;
  is_published: boolean;
  description: string | null;
  variants: AdminVariant[];
  grind_options: string[];
};

export type ProductCreatePayload = {
  slug: string;
  name: string;
  origin: string;
  region?: string | null;
  variety?: string | null;
  process?: string | null;
  altitude_masl?: string | null;
  harvest?: string | null;
  roast_profile: string;
  producer?: string | null;
  body?: string | null;
  acidity?: string | null;
  tasting_notes: string[];
  category: string;
  featured: boolean;
  is_published: boolean;
  description?: string | null;
  variants: { size_g: number; price_clp: number; stock_qty: number }[];
  grind_options?: string[];
};

export type ProductPatchPayload = Partial<Omit<ProductCreatePayload, 'slug' | 'variants'>>;

export type AdminCategory = {
  id: number;
  name: string;
  description: string | null;
  is_visible: boolean;
  sort_order: number;
  product_count: number;
};

export type CategoryCreatePayload = {
  name: string;
  description?: string | null;
  is_visible?: boolean;
  sort_order?: number;
};

export type CategoryPatchPayload = Partial<CategoryCreatePayload>;

export type AdminSubscription = {
  id: number;
  email: string;
  created_at: string;
};

export type AdminCoffeeSubscription = {
  id: number;
  customer_email: string;
  customer_name: string;
  frequency_days: number;
  product_slug: string | null;
  size_g: number;
  is_surprise: boolean;
  discount_pct: number;
  is_active: boolean;
  next_charge_at: string | null;
  last_charge_at: string | null;
  orders_count: number;
  first_order_id: number | null;
  admin_notes?: string | null;
  cancel_reason?: string | null;
  canceled_at?: string | null;
  created_at: string;
};

export type CoffeeSubPatch = {
  is_active?: boolean;
  cancel_reason?: string;
  admin_notes?: string;
  next_charge_at?: string;
};

export type ProcessSubOut = {
  subscription: AdminCoffeeSubscription;
  order: Order;
};

export type AdminDiscountCode = {
  id: number;
  code: string;
  description: string | null;
  kind: 'percent' | 'fixed';
  value: number;
  min_subtotal_clp: number;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  applies_to: 'all' | 'category' | 'product';
  applies_value: string | null;
  is_active: boolean;
  created_at: string;
};

export type DiscountCodeCreatePayload = {
  code: string;
  description?: string | null;
  kind: 'percent' | 'fixed';
  value: number;
  min_subtotal_clp?: number;
  valid_from?: string | null;
  valid_until?: string | null;
  max_uses?: number | null;
  applies_to?: 'all' | 'category' | 'product';
  applies_value?: string | null;
  is_active?: boolean;
};

export type DiscountCodePatchPayload = Partial<Omit<DiscountCodeCreatePayload, 'code'>>;

export type AdminHeroSlide = {
  id: number;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_url: string;
  image_has_text: boolean;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type HeroSlideCreatePayload = {
  image: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  cta_label?: string;
  cta_url?: string;
  image_has_text?: boolean;
  sort_order?: number;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
};

export type HeroSlidePatchPayload = Partial<HeroSlideCreatePayload>;

export type AbandonedCart = {
  id: number;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: Array<{
    product_slug: string;
    product_name: string;
    size_g: number;
    unit_price_clp: number;
    quantity: number;
  }>;
  subtotal_clp: number;
  status: 'open' | 'recovered' | 'dismissed';
  recovered_order_id: number | null;
  admin_notes: string | null;
  last_reminder_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminHorecaLead = {
  id: number;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string | null;
  business_type: string | null;
  kg_per_month: string | null;
  machine_type: string | null;
  message: string | null;
  contacted_at: string | null;
  notes: string | null;
  created_at: string;
};

export type AdminReview = {
  id: number;
  product_slug: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  approved_at: string | null;
  created_at: string;
};

export type ReviewModeratePayload = {
  status?: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  title?: string;
  body?: string;
};

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ jwt: string; email: string; expires_in_hours: number }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ email: string }>('/admin/me'),

  listProducts: () => request<AdminProduct[]>('/admin/products'),
  listCategories: () => request<string[]>('/admin/products/categories'),
  restoreSeedImages: () =>
    request<{ updated: { slug: string; image: string; score: number }[]; skipped: string[]; unmatched: string[] }>(
      '/admin/products/restore-images',
      { method: 'POST' },
    ),
  cleanupOrphanImages: () =>
    request<{ deleted: string[]; bytes_freed: number; kept: number }>(
      '/admin/products/cleanup-orphan-images',
      { method: 'POST' },
    ),

  // Category management (dedicated)
  listCategoryObjects: () => request<AdminCategory[]>('/admin/categories'),
  createCategory: (payload: CategoryCreatePayload) =>
    request<AdminCategory>('/admin/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id: number, payload: CategoryPatchPayload) =>
    request<AdminCategory>(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCategory: (id: number) =>
    request<void>(`/admin/categories/${id}`, { method: 'DELETE' }),
  createProduct: (payload: ProductCreatePayload) =>
    request<AdminProduct>('/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (slug: string, payload: ProductPatchPayload) =>
    request<AdminProduct>(`/admin/products/${slug}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProduct: (slug: string) =>
    request<void>(`/admin/products/${slug}`, { method: 'DELETE' }),

  // --- Uploads genéricos (cover de posts, brochures, etc.) ---
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request<{ url: string; filename: string; size_bytes: number }>(
      '/admin/uploads',
      { method: 'POST', body: fd },
    );
  },

  // --- Blog Posts ---
  listPostsAdmin: () => request<Post[]>('/admin/posts'),
  getPostAdmin: (slug: string) => request<Post>(`/admin/posts/${slug}`),
  createPost: (payload: Omit<Post, 'id'>) =>
    request<Post>('/admin/posts', { method: 'POST', body: JSON.stringify(payload) }),
  updatePost: (slug: string, payload: Partial<Omit<Post, 'id' | 'slug'>>) =>
    request<Post>(`/admin/posts/${slug}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deletePost: (slug: string) =>
    request<void>(`/admin/posts/${slug}`, { method: 'DELETE' }),
  updateVariant: (id: number, payload: { price_clp?: number; stock_qty?: number; compare_at_price_clp?: number }) =>
    request<AdminVariant>(`/admin/products/variants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  addVariant: (slug: string, payload: { size_g: number; price_clp: number; stock_qty: number }) =>
    request<AdminVariant>(`/admin/products/${slug}/variants`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteVariant: (variantId: number) =>
    request<void>(`/admin/products/variants/${variantId}`, { method: 'DELETE' }),
  uploadProductImage: (slug: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request<AdminProduct>(`/admin/products/${slug}/image`, { method: 'POST', body: fd });
  },

  listOrders: (status?: string) =>
    request<Order[]>(`/admin/orders${status ? `?status=${status}` : ''}`),
  updateOrder: (id: number, payload: { status?: string; tracking_code?: string; admin_notes?: string }) =>
    request<Order>(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  // Descarga el CSV de pedidos con auth (un <a href> no manda el Bearer).
  downloadOrdersCsv: async (status?: string): Promise<Blob> => {
    const jwt = useAdmin.getState().jwt;
    const res = await fetch(`${API_BASE}/admin/orders/export.csv${status ? `?status=${status}` : ''}`, {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    });
    if (res.status === 401 || res.status === 403) {
      useAdmin.getState().clearSession();
      throw new AdminAuthError();
    }
    if (!res.ok) throw new Error('No se pudo exportar el CSV');
    return res.blob();
  },

  listSubscriptions: () => request<AdminSubscription[]>('/admin/subscriptions'),
  exportSubscriptionsCsvUrl: (jwt: string) => `${API_BASE}/admin/subscriptions/export.csv?_=${jwt.slice(0, 8)}`,

  // Coffee subscriptions (recurring product delivery)
  listCoffeeSubscriptions: () => request<AdminCoffeeSubscription[]>('/admin/coffee-subscriptions'),
  updateCoffeeSubscription: (id: number, payload: CoffeeSubPatch) =>
    request<AdminCoffeeSubscription>(`/admin/coffee-subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  processCoffeeSubscription: (id: number) =>
    request<ProcessSubOut>(`/admin/coffee-subscriptions/${id}/process`, { method: 'POST' }),

  // --- Site settings + shipping ---
  getSiteSettings: () => request<SiteSettings>('/admin/site/settings'),
  patchSiteSettings: (patch: Partial<SiteSettings>) =>
    request<SiteSettings>('/admin/site/settings', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  listShippingRates: () => request<AdminShippingRate[]>('/admin/site/shipping-rates'),
  patchShippingRate: (id: number, price_clp: number) =>
    request<AdminShippingRate>(`/admin/site/shipping-rates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ price_clp }),
    }),
  listComunaZones: () => request<AdminComunaZone[]>('/admin/site/comuna-zones'),
  createComunaZone: (payload: AdminComunaZoneIn) =>
    request<AdminComunaZone>('/admin/site/comuna-zones', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  patchComunaZone: (id: number, payload: AdminComunaZoneIn) =>
    request<AdminComunaZone>(`/admin/site/comuna-zones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteComunaZone: (id: number) =>
    request<void>(`/admin/site/comuna-zones/${id}`, { method: 'DELETE' }),

  // Carrusel del home (hero slides)
  listHeroSlides: () => request<AdminHeroSlide[]>('/admin/hero-slides'),
  createHeroSlide: (payload: HeroSlideCreatePayload) =>
    request<AdminHeroSlide>('/admin/hero-slides', { method: 'POST', body: JSON.stringify(payload) }),
  updateHeroSlide: (id: number, payload: HeroSlidePatchPayload) =>
    request<AdminHeroSlide>(`/admin/hero-slides/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteHeroSlide: (id: number) =>
    request<void>(`/admin/hero-slides/${id}`, { method: 'DELETE' }),

  // Códigos de descuento
  listDiscountCodes: () => request<AdminDiscountCode[]>('/admin/discount-codes'),
  createDiscountCode: (payload: DiscountCodeCreatePayload) =>
    request<AdminDiscountCode>('/admin/discount-codes', { method: 'POST', body: JSON.stringify(payload) }),
  updateDiscountCode: (id: number, payload: DiscountCodePatchPayload) =>
    request<AdminDiscountCode>(`/admin/discount-codes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteDiscountCode: (id: number) =>
    request<void>(`/admin/discount-codes/${id}`, { method: 'DELETE' }),

  // Carritos abandonados
  listAbandonedCarts: (status?: string) =>
    request<AbandonedCart[]>(`/admin/abandoned-carts${status ? `?status=${status}` : ''}`),
  updateAbandonedCart: (id: number, payload: { status?: 'open' | 'dismissed'; admin_notes?: string; mark_reminded?: boolean }) =>
    request<AbandonedCart>(`/admin/abandoned-carts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteAbandonedCart: (id: number) =>
    request<void>(`/admin/abandoned-carts/${id}`, { method: 'DELETE' }),

  // Leads Mayorista (Horeca)
  listHorecaLeads: (status?: string) =>
    request<AdminHorecaLead[]>(`/admin/horeca-leads${status ? `?status=${status}` : ''}`),
  updateHorecaLead: (id: number, payload: { contacted?: boolean; notes?: string }) =>
    request<AdminHorecaLead>(`/admin/horeca-leads/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteHorecaLead: (id: number) =>
    request<void>(`/admin/horeca-leads/${id}`, { method: 'DELETE' }),

  // Reseñas
  listReviews: (status?: string) =>
    request<AdminReview[]>(`/admin/reviews${status ? `?status=${status}` : ''}`),
  moderateReview: (id: number, payload: ReviewModeratePayload) =>
    request<AdminReview>(`/admin/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteReview: (id: number) =>
    request<void>(`/admin/reviews/${id}`, { method: 'DELETE' }),
};

export type AdminShippingRate = {
  id: number;
  size_band: string;
  zone: string;
  mode: string;
  weight_min_g: number;
  weight_max_g: number;
  price_clp: number;
};

export type AdminComunaZone = {
  id: number;
  region: string;
  comuna: string | null;
  zone: string;
};

export type AdminComunaZoneIn = {
  region: string;
  comuna?: string | null;
  zone: 'ohiggins' | 'centro_otros' | 'extremo';
};
