import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Breadcrumbs from '../components/Breadcrumbs';
import { api, formatCLP, formatSize, pricePerKg } from '../lib/api';
import { useSeo } from '../lib/seo';
import { useSiteSettings } from '../store/site';
import type { Product, ShippingMethod } from '../types';

const FREQUENCIES = [
  { days: 30, label: 'Mensual', help: 'Cada 4 semanas. Ideal si tomas café diario.' },
  { days: 45, label: 'Cada 6 semanas', help: 'Café siempre fresco sin que se acumule.' },
  { days: 60, label: 'Bimensual', help: 'Para quien comparte y consume con calma.' },
] as const;

const SIZES = [
  { size_g: 250, label: '250 g' },
  { size_g: 500, label: '500 g' },
  { size_g: 1000, label: '1 kg' },
] as const;

const SHIPPING_OPTIONS: { value: ShippingMethod; label: string; cost: number; help: string }[] = [
  { value: 'rm', label: 'Despacho Región Metropolitana', cost: 3500, help: '2-3 días hábiles' },
  { value: 'regiones', label: 'Despacho regiones', cost: 5500, help: '3-7 días hábiles' },
  { value: 'pickup', label: 'Retiro en local', cost: 0, help: 'Coordinamos por WhatsApp' },
];

type RegionTree = { name: string; comunas: string[] };

const DISCOUNT_PCT = 10;

export default function Subscription() {
  useSeo({
    title: 'Suscripción mensual de café',
    description:
      'Suscríbete y recibe café de especialidad fresco cada mes en tu casa, con 10% de descuento. Cancela cuando quieras.',
    canonical: '/suscripcion',
  });

  const settings = useSiteSettings();
  const subscriptionEnabled = settings?.subscription_enabled !== false;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan state
  const [frequencyDays, setFrequencyDays] = useState<30 | 45 | 60>(30);
  const [isSurprise, setIsSurprise] = useState(false);
  const [productSlug, setProductSlug] = useState<string>('');
  const [sizeG, setSizeG] = useState<250 | 500 | 1000>(250);

  // Customer + shipping
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

  const [error] = useState<string | null>(null);
  const [regions, setRegions] = useState<RegionTree[]>([]);
  // submitting / navigate / handlePayment / setError removidos: flujo de pago
  // automático deshabilitado hasta que Webpay/Khipu vuelvan online. Se
  // conservan en git history (commit anterior) para restaurar cuando se
  // reactiven. El form ahora redirige a WhatsApp para coordinar manual.

  useEffect(() => {
    api.listProducts()
      .then((p) => {
        setProducts(p);
        if (!productSlug && p.length > 0) {
          const featured = p.find((x) => x.featured) ?? p[0];
          setProductSlug(featured.slug);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    api.listRegions().then(setRegions).catch(() => undefined);
  }, []);

  const comunasOfRegion = useMemo(() => {
    const r = regions.find((x) => x.name === form.shipping_region);
    return r?.comunas ?? [];
  }, [regions, form.shipping_region]);

  useEffect(() => {
    if (!regions.length) return;
    if (form.shipping_comuna && !comunasOfRegion.includes(form.shipping_comuna)) {
      setForm((f) => ({ ...f, shipping_comuna: '' }));
    }
  }, [regions, comunasOfRegion, form.shipping_comuna]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.slug === productSlug),
    [products, productSlug],
  );

  const variant = useMemo(
    () => selectedProduct?.variants.find((v) => v.size_g === sizeG),
    [selectedProduct, sizeG],
  );

  const basePriceClp = variant?.price_clp ?? 0;
  const subscribedPrice = Math.round(basePriceClp * (1 - DISCOUNT_PCT / 100));
  const shippingCost = SHIPPING_OPTIONS.find((o) => o.value === shippingMethod)?.cost ?? 0;
  const totalFirstCharge = subscribedPrice + shippingCost;

  const update = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));


  if (!subscriptionEnabled) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Suscripción' }]} />
        <p className="mt-12 text-5xl">☕</p>
        <h1 className="mt-6 font-display text-3xl text-tengu-ink md:text-4xl">Suscripciones</h1>
        <p className="mt-3 inline-block rounded-full bg-tengu-mustard px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-tengu-dark">
          Próximamente
        </p>
        <p className="mt-6 text-sm text-tengu-dark/70">
          Estamos terminando de activar los cobros recurrentes automáticos.
          Mientras tanto, escríbenos por WhatsApp con el café y la frecuencia
          que te interesan y coordinamos manual.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="https://wa.me/56950013366?text=Hola,%20quiero%20suscribirme%20a%20la%20entrega%20regular%20de%20caf%C3%A9."
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-tengu-ink px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark"
          >
            Coordinar por WhatsApp →
          </a>
          <Link
            to="/tienda"
            className="text-sm text-tengu-ink hover:underline"
          >
            Mientras tanto, mira la tienda
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-tengu-dark text-tengu-cream">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Suscripción' }]} />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-tengu-mustard">Café fresco automático</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
            Suscríbete y nunca<br />
            <span className="text-tengu-mustard">te quedes sin café.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-tengu-cream/85">
            Elige tu café favorito o deja que nuestro barista te sorprenda. Llega fresco a tu casa
            según la frecuencia que elijas. Con <strong>{DISCOUNT_PCT}% de descuento</strong> en cada
            entrega. Cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Benefit
            icon="☕"
            title={`${DISCOUNT_PCT}% off siempre`}
            body="Descuento automático aplicado en cada entrega mientras estés activo."
          />
          <Benefit
            icon="🔔"
            title="Sin compromiso"
            body="Pausas o cancelas cuando quieras desde tu email. Sin letra chica."
          />
          <Benefit
            icon="🚚"
            title="Tueste de la semana"
            body="Cada envío se tuesta y empaca antes de salir. Llega antes de los 7 días."
          />
        </div>
      </section>

      {loading ? (
        <p className="mx-auto max-w-3xl px-6 py-12 text-tengu-dark/60">Cargando…</p>
      ) : (
        <>
          {/* Plan + form */}
          <section className="bg-tengu-cream/40">
            <div className="mx-auto max-w-5xl px-6 py-16">
              <h2 className="font-display text-3xl">Arma tu plan</h2>
              <p className="mt-2 text-tengu-dark/70">3 pasos.</p>

              <div className="mt-10 space-y-8">
                {/* Frecuencia */}
                <fieldset className="rounded-xl bg-white p-6 shadow-sm">
                  <legend className="px-2 font-display text-lg">1. Frecuencia</legend>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {FREQUENCIES.map((f) => (
                      <label
                        key={f.days}
                        className={`cursor-pointer rounded-md border p-4 transition ${
                          frequencyDays === f.days
                            ? 'border-tengu-ink bg-tengu-ink/5'
                            : 'border-tengu-dark/15 hover:border-tengu-ink/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="freq"
                          value={f.days}
                          checked={frequencyDays === f.days}
                          onChange={() => setFrequencyDays(f.days)}
                          className="sr-only"
                        />
                        <p className="font-display text-lg">{f.label}</p>
                        <p className="mt-1 text-xs text-tengu-dark/60">{f.help}</p>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Café */}
                <fieldset className="rounded-xl bg-white p-6 shadow-sm">
                  <legend className="px-2 font-display text-lg">2. Tu café</legend>
                  <div className="mt-2 flex gap-3">
                    <label
                      className={`flex-1 cursor-pointer rounded-md border p-3 text-center transition ${
                        !isSurprise
                          ? 'border-tengu-ink bg-tengu-ink/5'
                          : 'border-tengu-dark/15 hover:border-tengu-ink/40'
                      }`}
                    >
                      <input type="radio" checked={!isSurprise} onChange={() => setIsSurprise(false)} className="sr-only" />
                      <p className="text-sm font-semibold">Elijo yo</p>
                    </label>
                    <label
                      className={`flex-1 cursor-pointer rounded-md border p-3 text-center transition ${
                        isSurprise
                          ? 'border-tengu-mustard bg-tengu-mustard/10'
                          : 'border-tengu-dark/15 hover:border-tengu-ink/40'
                      }`}
                    >
                      <input type="radio" checked={isSurprise} onChange={() => setIsSurprise(true)} className="sr-only" />
                      <p className="text-sm font-semibold">Sorpresa del barista ✨</p>
                    </label>
                  </div>

                  {!isSurprise && (
                    <div className="mt-4">
                      <label className="block">
                        <span className="block text-xs uppercase tracking-wider text-tengu-dark/60">Café</span>
                        <select
                          value={productSlug}
                          onChange={(e) => setProductSlug(e.target.value)}
                          className="mt-1 w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2"
                        >
                          {products.map((p) => (
                            <option key={p.slug} value={p.slug}>
                              {p.name} — {p.origin} · {p.roast_profile}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Formato</p>
                    <div className="mt-2 flex gap-2">
                      {SIZES.map((s) => (
                        <button
                          key={s.size_g}
                          type="button"
                          onClick={() => setSizeG(s.size_g as 250 | 500 | 1000)}
                          className={`rounded-md border px-4 py-2 text-sm transition ${
                            sizeG === s.size_g
                              ? 'border-tengu-ink bg-tengu-ink text-white'
                              : 'border-tengu-dark/15 bg-white hover:border-tengu-ink'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {variant && (
                    <div className="mt-5 rounded-md bg-tengu-mustard/10 p-4 text-sm">
                      <p className="text-tengu-dark/70">
                        <span className="line-through opacity-60">{formatCLP(basePriceClp)}</span>{' '}
                        <strong className="font-display text-lg text-tengu-ink">{formatCLP(subscribedPrice)}</strong>{' '}
                        por entrega
                        {sizeG >= 1000
                          ? ` · ${formatCLP(pricePerKg(subscribedPrice, sizeG))}/kg`
                          : ` · equivale a ${formatCLP(pricePerKg(subscribedPrice, sizeG))}/kg`}
                      </p>
                      <p className="mt-1 text-xs text-tengu-mustard">
                        Ahorras {formatCLP(basePriceClp - subscribedPrice)} cada vez · {DISCOUNT_PCT}% descuento
                      </p>
                    </div>
                  )}
                </fieldset>

                {/* Datos */}
                <fieldset className="rounded-xl bg-white p-6 shadow-sm">
                  <legend className="px-2 font-display text-lg">3. Tus datos y entrega</legend>
                  <div className="mt-2 grid gap-4 sm:grid-cols-2">
                    <Field label="Nombre completo" required>
                      <input type="text" required value={form.customer_name} onChange={update('customer_name')} className={inputClass} />
                    </Field>
                    <Field label="Email" required>
                      <input type="email" required value={form.customer_email} onChange={update('customer_email')} className={inputClass} />
                    </Field>
                    <Field label="Teléfono" required>
                      <input type="tel" required value={form.customer_phone} onChange={update('customer_phone')} placeholder="+56 9 XXXX XXXX" className={inputClass} />
                    </Field>
                    <Field label="RUT" required>
                      <input type="text" required value={form.customer_rut} onChange={update('customer_rut')} placeholder="11.111.111-1" className={inputClass} />
                    </Field>
                  </div>

                  <div className="mt-6 space-y-2">
                    {SHIPPING_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition ${
                          shippingMethod === opt.value
                            ? 'border-tengu-ink bg-tengu-ink/5'
                            : 'border-tengu-dark/15 hover:border-tengu-ink/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
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
                        <Field label="Dirección" required>
                          <input type="text" required value={form.shipping_address} onChange={update('shipping_address')} placeholder="Av. Providencia 1234, dpto 56" className={inputClass} />
                        </Field>
                      </div>
                      <Field label="Región" required>
                        <select required value={form.shipping_region} onChange={update('shipping_region')} className={inputClass}>
                          {regions.length === 0 && (
                            <option value={form.shipping_region}>{form.shipping_region}</option>
                          )}
                          {regions.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Comuna" required>
                        <select required value={form.shipping_comuna} onChange={update('shipping_comuna')} className={inputClass} disabled={comunasOfRegion.length === 0}>
                          <option value="">
                            {comunasOfRegion.length === 0 ? 'Selecciona una región primero' : 'Elige tu comuna'}
                          </option>
                          {comunasOfRegion.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                    </div>
                  )}
                </fieldset>

                {/* Resumen + pago */}
                <div className="rounded-xl bg-tengu-dark p-6 text-tengu-cream shadow-sm">
                  <h3 className="font-display text-lg">Tu suscripción</h3>
                  <ul className="mt-3 space-y-1 text-sm">
                    <li>
                      Frecuencia: <strong>{FREQUENCIES.find((f) => f.days === frequencyDays)?.label}</strong>
                    </li>
                    <li>
                      Café:{' '}
                      <strong>
                        {isSurprise ? 'Sorpresa del barista' : (selectedProduct?.name ?? '—')}
                      </strong>{' '}
                      · {formatSize(sizeG)}
                    </li>
                    <li>Envío: <strong>{shippingCost === 0 ? 'Gratis' : formatCLP(shippingCost)}</strong></li>
                  </ul>
                  <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                    <span className="text-sm uppercase tracking-wider text-tengu-cream/60">
                      Primer cobro
                    </span>
                    <span className="font-display text-2xl text-tengu-mustard">
                      {formatCLP(totalFirstCharge)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-tengu-cream/50">
                    Después se cobra {formatCLP(subscribedPrice + shippingCost)} cada {frequencyDays} días.
                    Te avisamos por email antes del próximo cargo.
                  </p>

                  {error && (
                    <div className="mt-4 rounded-md border border-tengu-coral/40 bg-tengu-coral/15 p-3 text-sm text-tengu-coral">
                      {error}
                    </div>
                  )}

                  {/* Suscripciones requieren cobro recurrente automático. BanchilePagos
                      no soporta tokenización, así que mientras Webpay/Khipu no estén
                      activos el flujo queda como lead — el cliente nos contacta por
                      WhatsApp y coordinamos manual. */}
                  <div className="mt-4 space-y-3">
                    <div className="rounded-md border border-white/20 bg-white/5 p-4 text-sm text-tengu-cream/80">
                      <p className="font-semibold text-tengu-cream">Suscripciones llegan pronto</p>
                      <p className="mt-1 text-xs">
                        Estamos activando los pagos recurrentes. Escríbenos por WhatsApp
                        con tu plan elegido y coordinamos la primera entrega.
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/56950013366?text=${encodeURIComponent(
                        `Hola, quiero suscribirme: ${isSurprise ? 'sorpresa del barista' : (selectedProduct?.name ?? 'café')} ${formatSize(sizeG)} cada ${frequencyDays} días.`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-md bg-tengu-mustard px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-cream"
                    >
                      Coordinar por WhatsApp →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ corta */}
          <section className="mx-auto max-w-3xl px-6 py-16">
            <h2 className="font-display text-2xl">Preguntas frecuentes</h2>
            <dl className="mt-6 space-y-5 text-sm">
              <Faq q="¿Cuándo me cobran?">
                El primer cobro es ahora vía Webpay o Khipu. Los siguientes son automáticos cada {frequencyDays} días.
                Te enviamos un email un día antes recordando.
              </Faq>
              <Faq q="¿Puedo cambiar el café o la frecuencia?">
                Sí. Escríbenos a hola@tenguroastery.cl o por WhatsApp con tu email de suscripción y lo ajustamos.
              </Faq>
              <Faq q="¿Y si quiero cancelar?">
                Sin preguntas. Mismo email o WhatsApp. Damos de baja en menos de 24h.
              </Faq>
              <Faq q="¿Qué es la 'sorpresa del barista'?">
                Cada entrega elegimos uno de nuestros cafés destacados — variando entre orígenes para que vayas
                probando. Si hay algo que no te guste, lo cambiamos sin costo.
              </Faq>
            </dl>
            <p className="mt-8 text-xs text-tengu-dark/50">
              ¿Prefieres una sola compra? <Link to="/tienda" className="underline">Ver tienda</Link>
            </p>
          </section>
        </>
      )}
    </>
  );
}

function Benefit({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-3xl">{icon}</p>
      <h3 className="mt-3 font-display text-lg">{title}</h3>
      <p className="mt-2 text-sm text-tengu-dark/70">{body}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border-l-2 border-tengu-mustard pl-5">
      <dt className="font-display text-base">{q}</dt>
      <dd className="mt-1 text-tengu-dark/70">{children}</dd>
    </div>
  );
}

const inputClass = 'w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm focus:border-tengu-ink focus:outline-none';

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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
