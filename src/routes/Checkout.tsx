import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { ecommerceEvents } from '../lib/analytics';
import { api, formatCLP, formatSize } from '../lib/api';
import { useAuth } from '../store/auth';
import { selectCartSubtotal, useCart } from '../store/cart';
import type { ShippingMethod } from '../types';

const PREFILL_KEY = 'tengu-checkout-prefill-v1';

type PrefillForm = {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_rut: string;
  shipping_address: string;
  shipping_comuna: string;
  shipping_region: string;
  shipping_notes: string;
};

const EMPTY_FORM: PrefillForm = {
  customer_email: '',
  customer_name: '',
  customer_phone: '',
  customer_rut: '',
  shipping_address: '',
  shipping_comuna: '',
  shipping_region: 'Región Metropolitana',
  shipping_notes: '',
};

function loadLocalPrefill(): PrefillForm {
  try {
    const raw = localStorage.getItem(PREFILL_KEY);
    if (!raw) return EMPTY_FORM;
    return { ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<PrefillForm>) };
  } catch {
    return EMPTY_FORM;
  }
}

const SHIPPING_OPTIONS: { value: ShippingMethod; label: string; cost: number; help: string }[] = [
  { value: 'rm', label: 'Despacho Región Metropolitana', cost: 3500, help: '2-3 días hábiles' },
  { value: 'regiones', label: 'Despacho regiones', cost: 5500, help: '3-7 días hábiles' },
  { value: 'pickup', label: 'Retiro en local', cost: 0, help: 'Coordinamos por WhatsApp' },
];

const REGIONES = [
  'Región Metropolitana',
  'Valparaíso',
  'O\'Higgins',
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
];

export default function Checkout() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectCartSubtotal);
  const navigate = useNavigate();
  const jwt = useAuth((s) => s.jwt);
  const customer = useAuth((s) => s.customer);

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('rm');
  const [form, setForm] = useState<PrefillForm>(() => loadLocalPrefill());

  // Si hay sesión, prellena con datos del customer (gana sobre localStorage)
  useEffect(() => {
    if (!jwt) return;
    api.getMe(jwt).then((me) => {
      setForm((f) => ({
        ...f,
        customer_email: me.email,
        customer_name: me.name ?? f.customer_name,
        customer_phone: me.phone ?? f.customer_phone,
        customer_rut: me.rut ?? f.customer_rut,
        shipping_address: me.shipping_address ?? f.shipping_address,
        shipping_comuna: me.shipping_comuna ?? f.shipping_comuna,
        shipping_region: me.shipping_region ?? f.shipping_region,
        shipping_notes: me.shipping_notes ?? f.shipping_notes,
      }));
    }).catch(() => {
      // JWT inválido/vencido: ignoramos, queda el prefill de localStorage
    });
  }, [jwt]);

  // Si ya teníamos customer en el store, úsalo de entrada (evita flash)
  useEffect(() => {
    if (!customer) return;
    setForm((f) => ({
      customer_email: customer.email || f.customer_email,
      customer_name: customer.name || f.customer_name,
      customer_phone: customer.phone || f.customer_phone,
      customer_rut: customer.rut || f.customer_rut,
      shipping_address: customer.shipping_address || f.shipping_address,
      shipping_comuna: customer.shipping_comuna || f.shipping_comuna,
      shipping_region: customer.shipping_region || f.shipping_region,
      shipping_notes: customer.shipping_notes || f.shipping_notes,
    }));
  }, [customer]);
  const [submitting, setSubmitting] = useState<null | 'webpay' | 'khipu' | 'bank_transfer'>(null);
  const [error, setError] = useState<string | null>(null);
  const [webpay, setWebpay] = useState<{ url: string; token: string } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const shippingCost = useMemo(
    () => SHIPPING_OPTIONS.find((o) => o.value === shippingMethod)?.cost ?? 0,
    [shippingMethod],
  );
  const total = subtotal + shippingCost;

  // Cuando recibimos el token de Webpay, auto-submit del form oculto.
  useEffect(() => {
    if (webpay && formRef.current) {
      formRef.current.submit();
    }
  }, [webpay]);

  if (items.length === 0 && !submitting && !webpay) {
    return <Navigate to="/carrito" replace />;
  }

  const update = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validateForm = (): boolean => {
    if (!form.customer_email || !form.customer_name || !form.customer_phone || !form.customer_rut) {
      setError('Completa todos los datos de contacto.');
      return false;
    }
    if (shippingMethod !== 'pickup' && (!form.shipping_address || !form.shipping_comuna)) {
      setError('Completa la dirección y comuna del despacho.');
      return false;
    }
    return true;
  };

  const handlePayment = async (method: 'webpay' | 'khipu' | 'bank_transfer') => {
    setError(null);
    if (!validateForm()) return;
    setSubmitting(method);
    ecommerceEvents.beginCheckout(
      items.map((i) => ({
        item_id: i.productSlug,
        item_name: i.productName,
        item_variant: `${i.sizeG}g`,
        price: i.unitPriceClp,
        quantity: i.quantity,
      })),
      total,
    );
    try {
      // Guarda prefill para próximas compras (excluye notas porque cambian)
      try {
        localStorage.setItem(
          PREFILL_KEY,
          JSON.stringify({ ...form, shipping_notes: '' }),
        );
      } catch { /* localStorage lleno o desactivado: ignorar */ }

      const order = await api.createOrder({
        customer_email: form.customer_email.trim(),
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_rut: form.customer_rut.trim(),
        shipping_method: shippingMethod,
        shipping_address: shippingMethod !== 'pickup' ? form.shipping_address.trim() : undefined,
        shipping_comuna: shippingMethod !== 'pickup' ? form.shipping_comuna.trim() : undefined,
        shipping_region: shippingMethod !== 'pickup' ? form.shipping_region : undefined,
        shipping_notes: form.shipping_notes.trim() || undefined,
        payment_method: method,
        items: items.map((i) => ({
          product_slug: i.productSlug,
          size_g: i.sizeG,
          quantity: i.quantity,
        })),
      });

      if (method === 'webpay') {
        const init = await api.initWebpay(order.id);
        setWebpay({ url: init.url, token: init.token });
      } else if (method === 'khipu') {
        const init = await api.initKhipu(order.id);
        const target = init.simplified_transfer_url || init.payment_url;
        if (!target) throw new Error('Khipu no devolvió URL de pago');
        window.location.href = target;
      } else {
        // bank_transfer: la orden queda pending, el cliente paga en BanchilePagos
        // y nos avisa por WhatsApp con comprobante. Thanks.tsx muestra el CTA.
        navigate(`/thanks/${order.id}?method=bank_transfer`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(null);
    }
  };

  if (webpay) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-tengu-dark/10 border-t-tengu-ink" />
        <p className="mt-6 font-display text-xl">Te estamos llevando a Webpay…</p>
        <p className="mt-2 text-sm text-tengu-dark/60">Si no se redirige automáticamente, no cierres esta pestaña.</p>
        <form ref={formRef} method="POST" action={webpay.url} className="hidden">
          <input type="hidden" name="token_ws" value={webpay.token} />
        </form>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-tengu-dark/60">
        Procesamos tu pago vía <strong>BanchilePagos</strong>. Webpay y Khipu llegan pronto.
      </p>

      {!jwt && (
        <div className="mt-4 rounded-md border border-tengu-ink/15 bg-tengu-ink/5 px-4 py-3 text-sm">
          <strong>¿Tienes cuenta o quieres crear una?</strong>{' '}
          <Link to="/cuenta/login" className="font-semibold text-tengu-ink hover:underline">
            Entrá con tu email
          </Link>{' '}
          y te prellenamos los datos. Tu cuenta se crea sola, sin contraseña.
        </div>
      )}

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <fieldset className="rounded-xl bg-white p-6 shadow-sm">
            <legend className="px-2 font-display text-lg">Datos de contacto</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <FormField label="Nombre completo" required>
                <input type="text" required value={form.customer_name} onChange={update('customer_name')} className={inputClass} />
              </FormField>
              <FormField label="Email" required>
                <input type="email" required value={form.customer_email} onChange={update('customer_email')} className={inputClass} />
              </FormField>
              <FormField label="Teléfono" required>
                <input type="tel" required value={form.customer_phone} onChange={update('customer_phone')} placeholder="+56 9 XXXX XXXX" className={inputClass} />
              </FormField>
              <FormField label="RUT" required>
                <input type="text" required value={form.customer_rut} onChange={update('customer_rut')} placeholder="11.111.111-1" className={inputClass} />
              </FormField>
            </div>
          </fieldset>

          <fieldset className="rounded-xl bg-white p-6 shadow-sm">
            <legend className="px-2 font-display text-lg">Envío</legend>
            <div className="mt-2 space-y-2">
              {SHIPPING_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center justify-between rounded-md border p-4 transition ${
                    shippingMethod === opt.value
                      ? 'border-tengu-ink bg-tengu-ink/5'
                      : 'border-tengu-dark/15 hover:border-tengu-ink/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.value}
                      checked={shippingMethod === opt.value}
                      onChange={() => setShippingMethod(opt.value)}
                      className="accent-tengu-ink"
                    />
                    <div>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-tengu-dark/60">{opt.help}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {opt.cost === 0 ? 'Gratis' : formatCLP(opt.cost)}
                  </span>
                </label>
              ))}
            </div>

            {shippingMethod !== 'pickup' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField label="Dirección" required>
                    <input
                      type="text"
                      required
                      value={form.shipping_address}
                      onChange={update('shipping_address')}
                      placeholder="Av. Providencia 1234, dpto 56"
                      className={inputClass}
                    />
                  </FormField>
                </div>
                <FormField label="Comuna" required>
                  <input type="text" required value={form.shipping_comuna} onChange={update('shipping_comuna')} className={inputClass} />
                </FormField>
                <FormField label="Región" required>
                  <select required value={form.shipping_region} onChange={update('shipping_region')} className={inputClass}>
                    {REGIONES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="Notas para el despacho (opcional)">
                    <textarea
                      value={form.shipping_notes}
                      onChange={update('shipping_notes')}
                      placeholder="Ej: dejar en conserjería"
                      rows={2}
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </fieldset>

          {error && (
            <div className="rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-4 text-sm text-tengu-coral">
              {error}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg">Tu pedido</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.key} className="flex justify-between gap-3">
                <span className="flex-1">
                  <span className="font-medium">{item.productName}</span>
                  <span className="block text-xs text-tengu-dark/60">
                    {formatSize(item.sizeG)} · {item.quantity}x
                  </span>
                </span>
                <span className="font-semibold">{formatCLP(item.unitPriceClp * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-tengu-dark/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatCLP(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Envío</dt>
              <dd>{shippingCost === 0 ? 'Gratis' : formatCLP(shippingCost)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-tengu-dark/10 pt-4">
            <span className="text-sm uppercase tracking-wider text-tengu-dark/60">Total</span>
            <span className="font-display text-2xl text-tengu-ink">{formatCLP(total)}</span>
          </div>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => handlePayment('bank_transfer')}
              disabled={submitting !== null}
              className="w-full rounded-md bg-tengu-ink px-4 py-3 font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark disabled:opacity-50"
            >
              {submitting === 'bank_transfer' ? 'Creando tu pedido…' : 'Pagar con BanchilePagos'}
            </button>

            <div className="relative">
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-md border border-tengu-dark/15 bg-tengu-dark/5 px-4 py-3 font-semibold uppercase tracking-wider text-tengu-dark/40"
              >
                Tarjeta · Webpay
              </button>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-tengu-mustard px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-tengu-dark">
                Próximamente
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-md border border-tengu-dark/15 bg-tengu-dark/5 px-4 py-3 font-semibold uppercase tracking-wider text-tengu-dark/40"
              >
                Transferencia · Khipu
              </button>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-tengu-mustard px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-tengu-dark">
                Próximamente
              </span>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-tengu-dark/50">
            🔒 Pago seguro vía BanchilePagos
          </p>
          <p className="mt-1 text-center text-xs text-tengu-dark/40">
            Al pagar te llevamos al portal del banco. El pedido queda confirmado cuando recibimos comprobante.
          </p>
        </aside>
      </div>
    </section>
  );
}

const inputClass =
  'w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm focus:border-tengu-ink focus:outline-none';

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-tengu-dark/70">
        {label}
        {required && <span className="ml-0.5 text-tengu-coral">*</span>}
      </span>
      {children}
    </label>
  );
}
