import type { Order, OrderPayload, Product, WebpayInit } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    } catch { /* keep default */ }
    throw new Error(detail);
  }
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
