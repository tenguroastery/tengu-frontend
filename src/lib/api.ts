import type { CustomerProfile } from '../store/auth';
import type {
  CoffeeSubscription,
  KhipuInit,
  Order,
  OrderPayload,
  Product,
  Review,
  ReviewSubmit,
  ReviewSummary,
  SubscriptionCreateResponse,
  SubscriptionPayload,
  WebpayInit,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

async function request<T>(path: string, init?: RequestInit, jwt?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  if (init?.headers) Object.assign(headers, init.headers as Record<string, string>);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    } catch { /* keep default */ }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type SubscribeResponse = { status: 'subscribed' | 'already_subscribed'; message: string };

export const api = {
  listProducts: () => request<Product[]>('/products'),
  getProduct: (slug: string) => request<Product>(`/products/${slug}`),
  subscribe: (email: string) =>
    request<SubscribeResponse>('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  createOrder: (payload: OrderPayload) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (orderId: number) => request<Order>(`/orders/${orderId}`),
  initWebpay: (orderId: number) =>
    request<WebpayInit>('/checkout/webpay/init', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    }),
  initKhipu: (orderId: number) =>
    request<KhipuInit>('/checkout/khipu/init', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    }),
  verifyKhipu: (orderId: number) =>
    request<{ order_status: string; khipu_status: string }>(`/checkout/khipu/verify/${orderId}`, {
      method: 'POST',
    }),
  createSubscription: (payload: SubscriptionPayload) =>
    request<SubscriptionCreateResponse>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSubscription: (id: number) => request<CoffeeSubscription>(`/subscriptions/${id}`),
  listReviews: (productSlug: string) => request<Review[]>(`/reviews/${productSlug}`),
  reviewSummary: (productSlug: string) => request<ReviewSummary>(`/reviews/${productSlug}/summary`),
  submitReview: (payload: ReviewSubmit) =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify(payload) }),

  // --- Auth de cliente (magic link) ---
  requestMagicLink: (email: string) =>
    request<void>('/auth/request-link', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyMagicLink: (token: string) =>
    request<{ jwt: string; email: string }>(`/auth/verify?token=${encodeURIComponent(token)}`),
  getMe: (jwt: string) => request<CustomerProfile>('/auth/me', undefined, jwt),
  patchMe: (jwt: string, patch: Partial<CustomerProfile>) =>
    request<CustomerProfile>('/auth/me', { method: 'PATCH', body: JSON.stringify(patch) }, jwt),
  listMyOrders: (jwt: string) => request<Order[]>('/auth/me/orders', undefined, jwt),
};

export function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSize(sizeG: number): string {
  return sizeG >= 1000 ? `${sizeG / 1000} kg` : `${sizeG} g`;
}

/** CLP por kilo dado precio total y gramos de la variante. */
export function pricePerKg(priceClp: number, sizeG: number): number {
  return Math.round((priceClp / sizeG) * 1000);
}
