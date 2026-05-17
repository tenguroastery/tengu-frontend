import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Breadcrumbs from '../components/Breadcrumbs';
import ReviewsSection from '../components/ReviewsSection';
import { ecommerceEvents } from '../lib/analytics';
import { api, formatCLP, pricePerKg } from '../lib/api';
import { setStructuredData, useSeo } from '../lib/seo';
import { useCart } from '../store/cart';
import type { Product as ProductT } from '../types';

export default function Product() {
  const { slug = '' } = useParams();
  const [product, setProduct] = useState<ProductT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useCart((s) => s.addItem);

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
  }, [slug]);

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

  const handleAdd = () => {
    addItem(
      {
        productSlug: product.slug,
        productName: product.name,
        productImage: product.image,
        sizeG: variant.size_g,
        unitPriceClp: variant.price_clp,
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
          {product.image && (
            <img
              src={`/uploads/${product.image}`}
              alt={`Bolsa de ${product.name} — café ${product.origin}`}
              className="h-full w-full object-cover"
              width={600}
              height={800}
              fetchPriority="high"
              decoding="async"
            />
          )}
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
              <p className="font-display text-3xl text-tengu-ink">{formatCLP(variant.price_clp * quantity)}</p>
              <p className="mt-1 text-xs text-tengu-dark/50">
                {variant.size_g >= 1000
                  ? `${formatCLP(pricePerKg(variant.price_clp, variant.size_g))} por kilo`
                  : `equivale a ${formatCLP(pricePerKg(variant.price_clp, variant.size_g))}/kg`}
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="rounded-md bg-tengu-mustard px-6 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
            >
              Agregar al carrito
            </button>
          </div>
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
