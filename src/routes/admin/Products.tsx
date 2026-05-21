import { useEffect, useRef, useState } from 'react';

import SafeImg from '../../components/SafeImg';
import { adminApi, type AdminProduct, type AdminVariant } from '../../lib/admin-api';
import { formatCLP } from '../../lib/api';
import { formatBytes, optimizeImage } from '../../lib/imageOptimize';
import ProductForm from './ProductForm';

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVariant, setSavingVariant] = useState<number | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<null | 'create' | { mode: 'edit'; product: AdminProduct }>(null);
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

  const handleVariantUpdate = async (variant: AdminVariant, field: 'price_clp' | 'stock_qty' | 'compare_at_price_clp', value: number) => {
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
      // Comprime en el browser antes de subir (Canvas → WebP). Bypass del
      // problema de Pillow en Azure y reduce ~95% el tamaño que va a la red.
      const opt = await optimizeImage(file);
      const updated = await adminApi.uploadProductImage(slug, opt.file);
      setProducts((prev) => prev.map((p) => (p.slug === slug ? { ...p, image: updated.image } : p)));
      if (opt.optimized) {
        // Toast informativo — usamos error state como banner neutral.
        setError(`✓ ${slug}: ${formatBytes(opt.originalBytes)} → ${formatBytes(opt.optimizedBytes)} optimizada y subida`);
        // Limpia el aviso después de 5s
        setTimeout(() => setError((e) => (e?.startsWith('✓ ' + slug) ? null : e)), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDeleteProduct = async (slug: string, name: string) => {
    if (!confirm(`¿Eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    try {
      await adminApi.deleteProduct(slug);
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm('¿Quitar este formato del producto?')) return;
    setError(null);
    try {
      await adminApi.deleteVariant(variantId);
      setProducts((prev) =>
        prev.map((p) => ({ ...p, variants: p.variants.filter((v) => v.id !== variantId) })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">{products.length} cafés en catálogo</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={reload} className="text-xs uppercase tracking-wider text-tengu-ink hover:underline">
            ↻ Recargar
          </button>
          <button
            onClick={async () => {
              if (!confirm('Restaurar imágenes faltantes a las del seed inicial. Solo afecta productos cuya imagen actual da 404. ¿Continuar?')) return;
              try {
                const res = await adminApi.restoreSeedImages();
                alert(`Actualizados: ${res.updated.length}. Sin match: ${res.unmatched.length || 'ninguno'}.`);
                reload();
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
              }
            }}
            className="text-xs uppercase tracking-wider text-tengu-ink hover:underline"
          >
            ↻ Restaurar fotos del seed
          </button>
          <button
            onClick={async () => {
              if (!confirm('Borrar imágenes en /uploads que ya no están en uso por ningún producto o post. Los archivos seed se mantienen. ¿Continuar?')) return;
              try {
                const res = await adminApi.cleanupOrphanImages();
                const mb = (res.bytes_freed / 1024 / 1024).toFixed(2);
                alert(`Borradas: ${res.deleted.length} (${mb} MB liberados). En uso: ${res.kept}.`);
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
              }
            }}
            className="text-xs uppercase tracking-wider text-tengu-dark/60 hover:text-tengu-coral hover:underline"
          >
            🗑 Limpiar huérfanas
          </button>
          <button
            onClick={() => setFormMode('create')}
            className="rounded-md bg-tengu-mustard px-4 py-2 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
          >
            + Nuevo producto
          </button>
        </div>
      </header>

      {formMode && (
        <ProductForm
          mode={formMode === 'create' ? 'create' : 'edit'}
          product={formMode !== 'create' ? formMode.product : undefined}
          onClose={() => setFormMode(null)}
          onSaved={() => {
            setFormMode(null);
            reload();
          }}
        />
      )}

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
                      <SafeImg
                        src={`/uploads/${p.image}`}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        fallbackLabel="Sin foto"
                      />
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
                    <h2 className="font-display text-xl">
                      {p.name}
                      {!p.is_published && (
                        <span className="ml-2 rounded-full bg-tengu-dark/10 px-2 py-0.5 align-middle text-xs uppercase tracking-wider text-tengu-dark/60">
                          Oculto
                        </span>
                      )}
                    </h2>
                    <p className="text-xs uppercase tracking-wider text-tengu-mustard">
                      {p.origin} · {p.category} {p.featured && '· ⭐ destacado'}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-tengu-dark/50">slug: <code>{p.slug}</code></p>

                  <div className="mt-2 flex gap-3 text-xs">
                    <button
                      onClick={() => setFormMode({ mode: 'edit', product: p })}
                      className="uppercase tracking-wider text-tengu-ink hover:underline"
                    >
                      Editar metadata
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.slug, p.name)}
                      className="uppercase tracking-wider text-tengu-coral hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>

                  <table className="mt-4 w-full text-sm">
                    <thead>
                      <tr className="border-b border-tengu-dark/10 text-left text-xs uppercase tracking-wider text-tengu-dark/60">
                        <th className="py-2">Formato</th>
                        <th className="py-2">Precio CLP</th>
                        <th className="py-2" title="Precio anterior tachado (oferta). 0 = sin oferta.">
                          Antes <span className="text-[10px] text-tengu-dark/40">(opcional)</span>
                        </th>
                        <th className="py-2">Stock</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {p.variants.map((v) => (
                        <VariantRow
                          key={v.id}
                          variant={v}
                          saving={savingVariant === v.id}
                          onUpdate={(field, value) => handleVariantUpdate(v, field, value)}
                          onDelete={() => handleDeleteVariant(v.id)}
                          canDelete={p.variants.length > 1}
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
  onDelete,
  canDelete,
}: {
  variant: AdminVariant;
  saving: boolean;
  onUpdate: (field: 'price_clp' | 'stock_qty' | 'compare_at_price_clp', value: number) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [price, setPrice] = useState(variant.price_clp);
  const [stock, setStock] = useState(variant.stock_qty);
  const [compareAt, setCompareAt] = useState(variant.compare_at_price_clp ?? 0);

  useEffect(() => setPrice(variant.price_clp), [variant.price_clp]);
  useEffect(() => setStock(variant.stock_qty), [variant.stock_qty]);
  useEffect(() => setCompareAt(variant.compare_at_price_clp ?? 0), [variant.compare_at_price_clp]);

  const sizeLabel = variant.size_g >= 1000 ? `${variant.size_g / 1000} kg` : `${variant.size_g} g`;

  const commitPrice = () => {
    if (price !== variant.price_clp) onUpdate('price_clp', price);
  };
  const commitStock = () => {
    if (stock !== variant.stock_qty) onUpdate('stock_qty', stock);
  };
  const commitCompareAt = () => {
    if (compareAt !== (variant.compare_at_price_clp ?? 0)) {
      onUpdate('compare_at_price_clp', compareAt);
    }
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
          <span className="text-tengu-dark/60">$</span>
          <input
            type="number"
            min={0}
            value={compareAt}
            onChange={(e) => setCompareAt(Number(e.target.value))}
            onBlur={commitCompareAt}
            onKeyDown={(e) => e.key === 'Enter' && commitCompareAt()}
            placeholder="0"
            title="Precio antes de la oferta. Vacío o 0 = sin oferta."
            className="w-24 rounded-md border border-tengu-dark/15 px-2 py-1 text-right"
          />
          {compareAt > price && (
            <span className="rounded-full bg-tengu-coral/10 px-2 py-0.5 text-[10px] font-bold text-tengu-coral">
              -{Math.round((1 - price / compareAt) * 100)}%
            </span>
          )}
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
      <td className="py-2 text-right">
        {canDelete && (
          <button
            onClick={onDelete}
            className="text-xs uppercase tracking-wider text-tengu-coral/70 hover:text-tengu-coral"
            aria-label="Quitar formato"
          >
            ✕
          </button>
        )}
      </td>
    </tr>
  );
}
