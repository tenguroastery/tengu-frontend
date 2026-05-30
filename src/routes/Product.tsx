import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Breadcrumbs from '../components/Breadcrumbs';
import ReviewsSection from '../components/ReviewsSection';
import SafeImg from '../components/SafeImg';
import { ecommerceEvents } from '../lib/analytics';
import { api, formatCLP, pricePerKg } from '../lib/api';
import { GRIND_LABELS, type GrindValue } from '../lib/grind';
import { setStructuredData, useSeo } from '../lib/seo';
import { useRevalidationTick } from '../lib/useRevalidateOnFocus';
import { useCart } from '../store/cart';
import type { Product as ProductT } from '../types';

export default function Product() {
  const { slug = '' } = useParams();
  const [product, setProduct] = useState<ProductT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [grindMode, setGrindMode] = useState<'grano' | 'molido'>('grano');
  const [grindMethod, setGrindMethod] = useState<string>('molido');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [related, setRelated] = useState<ProductT[]>([]);

  const addItem = useCart((s) => s.addItem);
  const tick = useRevalidationTick();

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getProduct(slug)
      .then((p) => {
        setProduct(p);
        setSelectedSize(p.variants[0]?.size_g ?? null);
        setQuantity(1);
        ecommerceEvents.viewItem({
          item_id: p.slug,
          item_name: p.name,
          price: p.variants[0]?.price_clp ?? 0,
        });
        setStructuredData('product', {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          description: `Café de especialidad ${p.origin} — ${p.tasting_notes.join(', ')}.`,
          image: p.image ? `https://tenguroastery.cl/uploads/${p.image}` : undefined,
          sku: p.slug,
          brand: { '@type': 'Brand', name: 'Tengu Roastery' },
          category: p.category,
          offers: p.variants.map((v) => ({
            '@type': 'Offer',
            price: v.price_clp,
            priceCurrency: 'CLP',
            availability: 'https://schema.org/InStock',
            url: `https://tenguroastery.cl/cafe/${p.slug}`,
            itemOffered: {
              '@type': 'Product',
              name: `${p.name} — ${v.size_g >= 1000 ? `${v.size_g / 1000} kg` : `${v.size_g} g`}`,
            },
          })),
        });
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [slug, tick]);

  // Cross-sell: hasta 4 productos relacionados (misma categoría primero),
  // excluyendo el actual y los sin stock. Sube el ticket promedio.
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    api.listProducts()
      .then((all) => {
        if (cancelled) return;
        const candidates = all.filter(
          (p) => p.slug !== product.slug && !p.variants.every((v) => v.stock_low === 0),
        );
        const sameCat = candidates.filter((p) => p.category === product.category);
        const others = candidates.filter((p) => p.category !== product.category);
        setRelated([...sameCat, ...others].slice(0, 4));
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [product?.slug, product?.category]);

  useSeo({
    title: product ? shortenProductTitle(product.name, product.origin) : 'Café de especialidad',
    description: product
      ? buildProductDescription(product)
      : 'Café de especialidad chileno tostado fresco.',
    canonical: `/cafe/${slug}`,
    image: product?.image ? `/uploads/${product.image}` : undefined,
    type: 'product',
  });

  if (loading) return <p className="mx-auto max-w-6xl px-6 py-16 text-tengu-dark/60">Cargando…</p>;
  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-tengu-coral">Producto no encontrado.</p>
        <Link to="/tienda" className="mt-4 inline-block text-tengu-ink hover:underline">
          ← Volver a la tienda
        </Link>
      </div>
    );
  }

  const variant = product.variants.find((v) => v.size_g === selectedSize) ?? product.variants[0];

  // Si solo está "grano-entero" y "molido", no hay paso 2; cuando elige
  // "Molido", se guarda como 'molido' genérico. Si hay métodos específicos
  // habilitados (espresso/v60/etc.), el paso 2 se activa.
  const allowed = product.grind_options ?? ['grano-entero', 'molido'];
  const specificMethods = allowed.filter((g) =>
    ['espresso', 'v60', 'aeropress', 'prensa-francesa', 'moka'].includes(g),
  );
  const hasMolido = allowed.includes('molido');
  const hasGrano = allowed.includes('grano-entero');
  const showStep2 = grindMode === 'molido' && specificMethods.length > 0;

  // Resolver el slug final que se guarda como `grind`:
  const finalGrind =
    grindMode === 'grano'
      ? 'grano-entero'
      : showStep2
      ? grindMethod
      : 'molido';

  const handleAdd = () => {
    addItem(
      {
        productSlug: product.slug,
        productName: product.name,
        productImage: product.image,
        sizeG: variant.size_g,
        unitPriceClp: variant.price_clp,
        grind: finalGrind,
      },
      quantity,
    );
    ecommerceEvents.addToCart({
      item_id: product.slug,
      item_name: product.name,
      item_variant: `${variant.size_g}g`,
      price: variant.price_clp,
      quantity,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <article className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Tienda', href: '/tienda' },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-12 md:grid-cols-2">
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white">
          <SafeImg
            src={product.image ? `/uploads/${product.image}` : undefined}
            alt={`Bolsa de ${product.name} — café ${product.origin}`}
            className="h-full w-full object-cover"
            width={600}
            height={800}
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-tengu-mustard">
            {product.origin} · {product.roast_profile}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight">{product.name}</h1>

          {product.producer && (
            <p className="mt-3 text-sm text-tengu-dark/70">Productor: {product.producer}</p>
          )}

          {product.tasting_notes.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Notas de cata</p>
              <p className="mt-1 text-lg">{product.tasting_notes.join(' · ')}</p>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {product.region && <Field label="Región" value={product.region} />}
            {product.variety && <Field label="Variedad" value={product.variety} />}
            {product.process && <Field label="Proceso" value={product.process} />}
            {product.altitude_masl && <Field label="Altitud" value={`${product.altitude_masl} m.s.n.m.`} />}
            {product.body && <Field label="Cuerpo" value={product.body} />}
            {product.acidity && <Field label="Acidez" value={product.acidity} />}
            {product.harvest && <Field label="Cosecha" value={product.harvest} />}
          </dl>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Formato</p>
            <div className="mt-2 flex gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedSize(v.size_g)}
                  className={`rounded-md border px-4 py-2 text-sm transition ${
                    selectedSize === v.size_g
                      ? 'border-tengu-ink bg-tengu-ink text-white'
                      : 'border-tengu-dark/20 bg-white hover:border-tengu-ink'
                  }`}
                >
                  {v.size_g >= 1000 ? `${v.size_g / 1000} kg` : `${v.size_g} g`}
                </button>
              ))}
            </div>
          </div>

          {(hasGrano || hasMolido) && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Molienda</p>
              <div className="mt-2 flex gap-2">
                {hasGrano && (
                  <button
                    onClick={() => setGrindMode('grano')}
                    className={`rounded-md border px-4 py-2 text-sm transition ${
                      grindMode === 'grano'
                        ? 'border-tengu-ink bg-tengu-ink text-white'
                        : 'border-tengu-dark/20 bg-white hover:border-tengu-ink'
                    }`}
                  >
                    Grano entero
                  </button>
                )}
                {hasMolido && (
                  <button
                    onClick={() => setGrindMode('molido')}
                    className={`rounded-md border px-4 py-2 text-sm transition ${
                      grindMode === 'molido'
                        ? 'border-tengu-ink bg-tengu-ink text-white'
                        : 'border-tengu-dark/20 bg-white hover:border-tengu-ink'
                    }`}
                  >
                    Molido
                  </button>
                )}
              </div>
              {showStep2 && (
                <div className="mt-3">
                  <p className="text-[11px] text-tengu-dark/60">¿Para qué método?</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {specificMethods.map((m) => (
                      <button
                        key={m}
                        onClick={() => setGrindMethod(m)}
                        className={`rounded-md border px-3 py-1.5 text-xs transition ${
                          grindMethod === m
                            ? 'border-tengu-mustard bg-tengu-mustard text-tengu-dark'
                            : 'border-tengu-dark/20 bg-white hover:border-tengu-mustard'
                        }`}
                      >
                        {GRIND_LABELS[m as GrindValue] ?? m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Cantidad</p>
            <div className="mt-2 inline-flex items-center rounded-md border border-tengu-dark/20 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-tengu-dark/70 hover:text-tengu-dark"
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="px-3 py-2 text-tengu-dark/70 hover:text-tengu-dark"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div>
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="font-display text-3xl text-tengu-ink">{formatCLP(variant.price_clp * quantity)}</p>
                {variant.compare_at_price_clp && variant.compare_at_price_clp > variant.price_clp && (
                  <>
                    <p className="text-base text-tengu-dark/40 line-through">
                      {formatCLP(variant.compare_at_price_clp * quantity)}
                    </p>
                    <span className="rounded-full bg-tengu-coral px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      -{Math.round((1 - variant.price_clp / variant.compare_at_price_clp) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-tengu-dark/50">
                {variant.size_g >= 1000
                  ? `${formatCLP(pricePerKg(variant.price_clp, variant.size_g))} por kilo`
                  : `equivale a ${formatCLP(pricePerKg(variant.price_clp, variant.size_g))}/kg`}
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={variant.stock_low === 0}
              className="rounded-md bg-tengu-mustard px-6 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-tengu-mustard disabled:hover:text-tengu-dark"
            >
              {variant.stock_low === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
          {variant.stock_low !== null && variant.stock_low > 0 && variant.stock_low <= 5 && (
            <p className="mt-3 text-sm font-semibold text-tengu-coral">
              ⚠ Últimas {variant.stock_low} unidades — apurate
            </p>
          )}
          {variant.stock_low !== null && variant.stock_low > 5 && (
            <p className="mt-3 text-xs text-tengu-dark/60">
              Quedan {variant.stock_low} unidades disponibles
            </p>
          )}
          {justAdded && (
            <p className="mt-3 text-sm font-medium text-tengu-ink">
              ✓ Agregado al carrito
            </p>
          )}
        </div>
      </div>

      {/* Sticky bottom bar — solo mobile (md y arriba lo oculta) */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-tengu-dark/10 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden"
        aria-label="Agregar al carrito"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs text-tengu-dark/60">
              {variant.size_g >= 1000 ? `${variant.size_g / 1000} kg` : `${variant.size_g} g`} · {quantity}x
            </p>
            <p className="font-display text-lg leading-none text-tengu-ink">
              {formatCLP(variant.price_clp * quantity)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="rounded-md bg-tengu-mustard px-5 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition active:scale-95 hover:bg-tengu-coral hover:text-white"
          >
            {justAdded ? '✓ Agregado' : 'Agregar'}
          </button>
        </div>
      </div>

      <ReviewsSection productSlug={product.slug} productName={product.name} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl">También te puede gustar</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => {
              const cheapest = p.variants.reduce(
                (min, v) => (v.price_clp < min.price_clp ? v : min),
                p.variants[0],
              );
              return (
                <Link
                  key={p.slug}
                  to={`/cafe/${p.slug}`}
                  className="group rounded-lg bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="aspect-square overflow-hidden rounded-md bg-tengu-cream">
                    <SafeImg
                      src={p.image ? `/uploads/${p.image}` : undefined}
                      alt={p.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      width={200}
                      height={200}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-tengu-mustard">{p.origin}</p>
                  <h3 className="font-display text-sm leading-tight">{p.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-tengu-ink">
                    desde {formatCLP(cheapest.price_clp)}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Spacer para que el sticky no tape el último contenido en mobile */}
      <div aria-hidden="true" className="h-24 md:hidden" />
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-tengu-dark/60">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

function shortenProductTitle(name: string, origin: string): string {
  // El title se construye con la fórmula del SEO hook (max 60ch incluyendo " – Tengu Roastery").
  // Disponemos de ~43ch para el título mismo. Limpiamos el nombre largo "Marie Gorette Mukamurenzi — Rwanda Lavado" → "Rwanda Lavado · Marie Gorette".
  const cleaned = name.replace(/^Marie Gorette Mukamurenzi — /i, '');
  // Si el origin ya está en el nombre, no lo dupliques.
  if (cleaned.toLowerCase().includes(origin.toLowerCase())) return cleaned;
  return `${cleaned} · ${origin}`;
}

function buildProductDescription(p: ProductT): string {
  const parts = [
    `${p.origin}${p.process ? ` · ${p.process}` : ''}`,
    p.tasting_notes.length > 0 ? `Notas: ${p.tasting_notes.slice(0, 4).join(', ')}` : '',
    `Tostado en Chile, perfil ${p.roast_profile.toLowerCase()}`,
  ];
  return parts.filter(Boolean).join('. ') + '.';
}
