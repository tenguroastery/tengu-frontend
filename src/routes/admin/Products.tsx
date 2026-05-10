import { useEffect, useRef, useState } from 'react';

import { adminApi, type AdminProduct, type AdminVariant } from '../../lib/admin-api';
import { formatCLP } from '../../lib/api';

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVariant, setSavingVariant] = useState<number | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const reload = () => {
    setLoading(true);
    adminApi
      .listProducts()
      .then(setProducts)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleVariantUpdate = async (variant: AdminVariant, field: 'price_clp' | 'stock_qty', value: number) => {
    setSavingVariant(variant.id);
    setError(null);
    try {
      const updated = await adminApi.updateVariant(variant.id, { [field]: value });
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          variants: p.variants.map((v) => (v.id === variant.id ? { ...v, ...updated } : v)),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingVariant(null);
    }
  };

  const handleImageUpload = async (slug: string, file: File) => {
    setUploadingFor(slug);
    setError(null);
    try {
      const updated = await adminApi.uploadProductImage(slug, file);
      setProducts((prev) => prev.map((p) => (p.slug === slug ? { ...p, image: updated.image } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadingFor(null);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">{products.length} cafés en catálogo</p>
        </div>
        <button onClick={reload} className="text-xs uppercase tracking-wider text-tengu-ink hover:underline">
          ↻ Recargar
        </button>
      </header>

      {error && (
        <div className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : (
        <div className="mt-8 space-y-4">
          {products.map((p) => (
            <article key={p.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="grid gap-5 md:grid-cols-[120px_1fr]">
                <div>
                  <div className="aspect-[3/4] overflow-hidden rounded-md bg-tengu-cream">
                    {p.image ? (
                      <img src={`/uploads/${p.image}?v=${Date.now()}`} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-tengu-dark/40">Sin foto</div>
                    )}
                  </div>
                  <input
                    ref={(el) => { fileInputs.current[p.slug] = el; }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(p.slug, f);
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => fileInputs.current[p.slug]?.click()}
                    disabled={uploadingFor === p.slug}
                    className="mt-2 w-full rounded-md border border-tengu-dark/15 px-3 py-1.5 text-xs uppercase tracking-wider transition hover:border-tengu-ink disabled:opacity-50"
                  >
                    {uploadingFor === p.slug ? 'Subiendo…' : 'Cambiar foto'}
                  </button>
                </div>

                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-xl">{p.name}</h2>
                    <p className="text-xs uppercase tracking-wider text-tengu-mustard">
                      {p.origin} · {p.category} {p.featured && '· ⭐ destacado'}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-tengu-dark/50">slug: <code>{p.slug}</code></p>

                  <table className="mt-4 w-full text-sm">
                    <thead>
                      <tr className="border-b border-tengu-dark/10 text-left text-xs uppercase tracking-wider text-tengu-dark/60">
                        <th className="py-2">Formato</th>
                        <th className="py-2">Precio CLP</th>
                        <th className="py-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.variants.map((v) => (
                        <VariantRow
                          key={v.id}
                          variant={v}
                          saving={savingVariant === v.id}
                          onUpdate={(field, value) => handleVariantUpdate(v, field, value)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function VariantRow({
  variant,
  saving,
  onUpdate,
}: {
  variant: AdminVariant;
  saving: boolean;
  onUpdate: (field: 'price_clp' | 'stock_qty', value: number) => void;
}) {
  const [price, setPrice] = useState(variant.price_clp);
  const [stock, setStock] = useState(variant.stock_qty);

  useEffect(() => setPrice(variant.price_clp), [variant.price_clp]);
  useEffect(() => setStock(variant.stock_qty), [variant.stock_qty]);

  const sizeLabel = variant.size_g >= 1000 ? `${variant.size_g / 1000} kg` : `${variant.size_g} g`;

  const commitPrice = () => {
    if (price !== variant.price_clp) onUpdate('price_clp', price);
  };
  const commitStock = () => {
    if (stock !== variant.stock_qty) onUpdate('stock_qty', stock);
  };

  return (
    <tr className="border-b border-tengu-dark/5">
      <td className="py-2 font-medium">{sizeLabel}</td>
      <td className="py-2">
        <div className="inline-flex items-center gap-2">
          <span className="text-tengu-dark/60">$</span>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            onBlur={commitPrice}
            onKeyDown={(e) => e.key === 'Enter' && commitPrice()}
            className="w-28 rounded-md border border-tengu-dark/15 px-2 py-1 text-right"
          />
          <span className="text-xs text-tengu-dark/50">{formatCLP(price)}</span>
        </div>
      </td>
      <td className="py-2">
        <div className="inline-flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            onBlur={commitStock}
            onKeyDown={(e) => e.key === 'Enter' && commitStock()}
            className={`w-20 rounded-md border px-2 py-1 text-right ${
              stock === 0 ? 'border-tengu-coral/40 bg-tengu-coral/5' : 'border-tengu-dark/15'
            }`}
          />
          <span className="text-xs text-tengu-dark/50">u.</span>
          {saving && <span className="text-xs text-tengu-mustard">guardando…</span>}
        </div>
      </td>
    </tr>
  );
}
