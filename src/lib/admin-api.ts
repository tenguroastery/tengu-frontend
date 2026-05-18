import { formatApiError } from './api';
import { useAdmin } from '../store/admin';
import type { Order, SiteSettings } from '../types';

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
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type AdminVariant = {
  id: number;
  size_g: number;
  price_clp: number;
  stock_qty: number;
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
  updateVariant: (id: number, payload: { price_clp?: number; stock_qty?: number }) =>
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
