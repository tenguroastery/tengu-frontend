import { useEffect, useMemo, useState } from 'react';

import ProductCard from '../components/ProductCard';
import { api } from '../lib/api';
import { useSeo } from '../lib/seo';
import type { Product } from '../types';

const CATEGORIES = ['Todos', 'Filtrado', 'Espresso'] as const;
type Category = (typeof CATEGORIES)[number];

export default function Shop() {
  useSeo({
    title: 'Tienda de café de especialidad',
    description:
      'Catálogo Tengu Roastery: 8 cafés de origen único, perfiles para filtrado y espresso. Despacho 24-48h en todo Chile.',
    canonical: '/shop',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('Todos');

  useEffect(() => {
    api.listProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (category === 'Todos' ? products : products.filter((p) => p.category === category)),
    [products, category],
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl">Nuestros Cafés</h1>
      <p className="mt-2 text-tengu-dark/60">
        {products.length} variedades de origen único y blends.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm uppercase tracking-wider transition ${
              category === cat
                ? 'bg-tengu-ink text-white'
                : 'bg-white text-tengu-dark/70 hover:bg-tengu-ink/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {loading ? (
          <p className="text-tengu-dark/60">Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className="text-tengu-dark/60">No hay cafés en esta categoría.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
