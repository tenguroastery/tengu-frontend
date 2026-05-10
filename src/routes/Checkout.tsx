import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { ecommerceEvents } from '../lib/analytics';
import { api, formatCLP, formatSize } from '../lib/api';
import { selectCartSubtotal, useCart } from '../store/cart';
import type { ShippingMethod } from '../types';

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

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('rm');
  const [form, setForm] = useState({
    customer_email: '',
    customer_name: '',
    customer_phone: '',
    customer_rut: '',
    shipping_address: '',
    shipping_comuna: '',
    shipping_region: 'Región Metropolitana',
    shipping_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
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
        items: items.map((i) => ({
          product_slug: i.productSlug,
          size_g: i.sizeG,
          quantity: i.quantity,
        })),
      });

      const init = await api.initWebpay(order.id);
      setWebpay({ url: init.url, token: init.token });
      // El form oculto se enviará automáticamente vía useEffect arriba.
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
      // ignora navigate — no se llama
      void navigate;
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
        Procesamos tu pago con Webpay (Transbank). Tarjetas chilenas crédito y débito.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 md:grid-cols-[1fr_360px]">
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
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-tengu-mustard px-4 py-3 font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white disabled:opacity-50"
          >
            {submitting ? 'Procesando…' : 'Pagar con Webpay'}
          </button>
          <p className="mt-3 text-center text-xs text-tengu-dark/50">
            🔒 Sandbox Transbank · No se cobra dinero real
          </p>
        </aside>
      </form>
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
