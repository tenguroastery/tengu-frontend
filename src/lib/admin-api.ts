import { useAdmin } from '../store/admin';
import type { Order } from '../types';

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
  if (res.status === 401) {
    useAdmin.getState().clearSession();
    throw new AdminAuthError();
  }
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
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
  category: string;
  roast_profile: string;
  image: string | null;
  featured: boolean;
  variants: AdminVariant[];
};

export type AdminSubscription = {
  id: number;
  email: string;
  created_at: string;
};

export const adminApi = {
  loginRequest: (email: string) =>
    request<void>('/admin/login/request', { method: 'POST', body: JSON.stringify({ email }) }),
  loginVerify: (token: string) =>
    request<{ jwt: string; email: string; expires_in_hours: number }>(
      '/admin/login/verify',
      { method: 'POST', body: JSON.stringify({ token }) },
    ),
  me: () => request<{ email: string }>('/admin/me'),

  listProducts: () => request<AdminProduct[]>('/admin/products'),
  updateVariant: (id: number, payload: { price_clp?: number; stock_qty?: number }) =>
    request<AdminVariant>(`/admin/products/variants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
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
};
