import { Link } from 'react-router-dom';

import SafeImg from './SafeImg';
import type { Product } from '../types';
import { formatCLP, formatSize, pricePerKg } from '../lib/api';

export default function ProductCard({ product }: { product: Product }) {
  const cheapest = product.variants.reduce(
    (min, v) => (v.price_clp < min.price_clp ? v : min),
    product.variants[0],
  );
  // El "$/kg" debe reflejar el mejor precio real de la línea (variante más grande),
  // no extrapolar desde una bolsa chica. Asumimos que más gramos = mejor $/kg.
  const bestByKg = product.variants.reduce(
    (best, v) => (v.size_g > best.size_g ? v : best),
    product.variants[0],
  );
  const perKgBest = pricePerKg(bestByKg.price_clp, bestByKg.size_g);

  return (
    <Link
      to={`/cafe/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-tengu-cream">
        <SafeImg
          src={product.image ? `/uploads/${product.image}` : undefined}
          alt={`Bolsa de ${product.name} — café de ${product.origin} tostado en Chile`}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
          decoding="async"
          width={400}
          height={533}
        />
        <span className="absolute right-3 top-3 rounded-full bg-tengu-dark/90 px-3 py-1 text-xs uppercase tracking-wider text-tengu-cream">
          {product.roast_profile}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs uppercase tracking-wider text-tengu-mustard">{product.origin}</p>
        <h3 className="font-display text-lg leading-tight">{product.name}</h3>
        {product.tasting_notes.length > 0 && (
          <p className="text-sm text-tengu-dark/70">
            {product.tasting_notes.slice(0, 3).join(' · ')}
          </p>
        )}
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <p className="text-sm font-semibold text-tengu-ink">
            desde {formatCLP(cheapest.price_clp)}
          </p>
          <p className="text-xs text-tengu-dark/50">
            {formatSize(bestByKg.size_g)} a {formatCLP(perKgBest)}/kg
          </p>
        </div>
      </div>
    </Link>
  );
}
