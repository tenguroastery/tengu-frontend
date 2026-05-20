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
  is_published: boolean;
  description: string | null;
  variants: Variant[];
  /** Slugs de moliendas habilitadas para este producto. */
  grind_options: string[];
};

export type ShippingMethod = 'rm' | 'regiones' | 'pickup';
export type ShippingMode = 'domicilio' | 'punto';

export type SiteSettings = {
  free_shipping_threshold_clp: number;
  roast_day: string;
  ship_days: string;
  subscription_discount_pct: number;
  subscription_enabled: boolean;
  customer_accounts_enabled: boolean;
  wholesale_min_kg: number;
  wholesale_lead_msg: string;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  meta_description: string;
  cover: string;
  published_at: string;  // YYYY-MM-DD
  reading_minutes: number;
  author: string;
  tags: string[];
  body: string;  // markdown
  is_published: boolean;
};

export type ShippingQuote = {
  cost_clp: number;
  zone: string;
  size_band: string;
  is_free: boolean;
  reason: string;
};

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'failed' | 'canceled';

export type OrderItemPayload = {
  product_slug: string;
  size_g: number;
  quantity: number;
  grind?: string;
};

export type OrderPayload = {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_rut: string;
  shipping_method: ShippingMethod;
  shipping_mode?: ShippingMode;
  shipping_address?: string;
  shipping_comuna?: string;
  shipping_region?: string;
  shipping_notes?: string;
  payment_method?: PaymentMethod;
  items: OrderItemPayload[];
  /** Honeypot anti-bot. Humanos no lo llenan; si llega, backend rechaza. */
  website?: string;
};

export type OrderItem = {
  id: number;
  product_slug: string;
  product_name: string;
  size_g: number;
  unit_price_clp: number;
  quantity: number;
  subtotal_clp: number;
  grind: string;
};

export type PaymentMethod = 'webpay' | 'khipu' | 'bank_transfer' | 'mercadopago';

export type MercadoPagoInit = {
  preference_id: string;
  init_point: string;
};

export type Order = {
  id: number;
  status: OrderStatus;
  // Solo viene en la respuesta de POST /api/orders (no en GET). El cliente lo
  // propaga a /thanks/{id}?token=... para autorizar la lectura del detalle.
  access_token?: string;
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
  payment_method: PaymentMethod | null;
  webpay_authorization_code: string | null;
  admin_notes: string | null;
  tracking_code: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  items: OrderItem[];
};

export type WebpayInit = {
  token: string;
  url: string;
};

export type KhipuInit = {
  payment_id: string;
  payment_url: string;
  simplified_transfer_url: string | null;
};

export type SubscriptionPayload = {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_rut: string;
  shipping_method: ShippingMethod;
  shipping_address?: string;
  shipping_comuna?: string;
  shipping_region?: string;
  shipping_notes?: string;
  frequency_days: 30 | 60 | 90;
  product_slug: string | null;
  size_g: number;
  is_surprise: boolean;
};

export type CoffeeSubscription = {
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
  created_at: string;
};

export type SubscriptionCreateResponse = {
  subscription: CoffeeSubscription;
  order: Order;
};

export type Review = {
  id: number;
  product_slug: string;
  customer_name: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
};

export type ReviewSummary = {
  count: number;
  average: number;
};

export type ReviewSubmit = {
  product_slug: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title?: string;
  body: string;
};
