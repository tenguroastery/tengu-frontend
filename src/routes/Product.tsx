import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { api, formatCLP } from '../lib/api';
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
            url: `https://tenguroastery.cl/shop/${p.slug}`,
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
    title: product ? `${product.name} — ${product.origin}` : 'Café de especialidad',
    description: product
      ? `${product.origin} · ${product.process ?? ''} · Notas: ${product.tasting_notes.join(', ')}.`
      : 'Café de especialidad chileno.',
    canonical: `/shop/${slug}`,
    image: product?.image ? `/uploads/${product.image}` : undefined,
    type: 'product',
  });

  if (loading) return <p className="mx-auto max-w-6xl px-6 py-16 text-tengu-dark/60">Cargando…</p>;
  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-tengu-coral">Producto no encontrado.</p>
        <Link to="/shop" className="mt-4 inline-block text-tengu-ink hover:underline">
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
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <article className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/shop" className="text-sm text-tengu-ink hover:underline">← Tienda</Link>

      <div className="mt-6 grid gap-12 md:grid-cols-2">
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-white">
          {product.image && (
            <img
              src={`/uploads/${product.image}`}
              alt={product.name}
              className="h-full w-full object-cover"
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
            <p className="font-display text-3xl text-tengu-ink">{formatCLP(variant.price_clp * quantity)}</p>
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
