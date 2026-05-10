import { Link } from 'react-router-dom';

import type { Product } from '../types';
import { formatCLP } from '../lib/api';

export default function ProductCard({ product }: { product: Product }) {
  const minPrice = Math.min(...product.variants.map((v) => v.price_clp));

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-tengu-cream">
        {product.image && (
          <img
            src={`/product-images/${product.image}`}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        )}
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
        <p className="mt-auto pt-2 text-sm font-semibold text-tengu-ink">
          desde {formatCLP(minPrice)}
        </p>
      </div>
    </Link>
  );
}
