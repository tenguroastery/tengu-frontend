export type Variant = {
  id: number;
  size_g: number;
  price_clp: number;
};

export type Product = {
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
  image: string | null;
  category: string;
  featured: boolean;
  variants: Variant[];
};

export type ShippingMethod = 'rm' | 'regiones' | 'pickup';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'canceled';

export type OrderItemPayload = {
  product_slug: string;
  size_g: number;
  quantity: number;
};

export type OrderPayload = {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_rut: string;
  shipping_method: ShippingMethod;
  shipping_address?: string;
  shipping_comuna?: string;
  shipping_region?: string;
  shipping_notes?: string;
  items: OrderItemPayload[];
};

export type OrderItem = {
  id: number;
  product_slug: string;
  product_name: string;
  size_g: number;
  unit_price_clp: number;
  quantity: number;
  subtotal_clp: number;
};

export type Order = {
  id: number;
  status: OrderStatus;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_rut: string;
  shipping_method: ShippingMethod;
  shipping_address: string | null;
  shipping_comuna: string | null;
  shipping_region: string | null;
  shipping_notes: string | null;
  shipping_cost_clp: number;
  subtotal_clp: number;
  total_clp: number;
  webpay_authorization_code: string | null;
  created_at: string;
  paid_at: string | null;
  items: OrderItem[];
};

export type WebpayInit = {
  token: string;
  url: string;
};
