import { useEffect, useState } from 'react';

import { adminApi, type AdminProduct, type ProductCreatePayload } from '../../lib/admin-api';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  product?: AdminProduct;
  onClose: () => void;
  onSaved: () => void;
};

const ROAST_PROFILES = ['Filtrado', 'Espresso'] as const;

export default function ProductForm({ mode, product, onClose, onSaved }: Props) {
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [origin, setOrigin] = useState(product?.origin ?? '');
  const [region, setRegion] = useState(product?.region ?? '');
  const [variety, setVariety] = useState(product?.variety ?? '');
  const [process, setProcess] = useState(product?.process ?? '');
  const [altitudeMasl, setAltitudeMasl] = useState(product?.altitude_masl ?? '');
  const [harvest, setHarvest] = useState(product?.harvest ?? '');
  const [roastProfile, setRoastProfile] = useState(product?.roast_profile ?? 'Filtrado');
  const [producer, setProducer] = useState(product?.producer ?? '');
  const [bodyTxt, setBodyTxt] = useState(product?.body ?? '');
  const [acidity, setAcidity] = useState(product?.acidity ?? '');
  const [tastingNotesCsv, setTastingNotesCsv] = useState((product?.tasting_notes ?? []).join(', '));
  const [category, setCategory] = useState(product?.category ?? 'Filtrado');
  const [description, setDescription] = useState(product?.description ?? '');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isPublished, setIsPublished] = useState(product?.is_published ?? true);
  // 'cafe' muestra todos los campos de café. 'equipo' los oculta y usa una variante única.
  const [productKind, setProductKind] = useState<'cafe' | 'equipo'>(
    product && !product.roast_profile ? 'equipo' : 'cafe',
  );
  const [variants, setVariants] = useState<{ size_g: number; price_clp: number; stock_qty: number }[]>(
    product?.variants.map((v) => ({ size_g: v.size_g, price_clp: v.price_clp, stock_qty: v.stock_qty })) ?? [
      { size_g: 250, price_clp: 12000, stock_qty: 50 },
      { size_g: 500, price_clp: 22000, stock_qty: 50 },
      { size_g: 1000, price_clp: 40000, stock_qty: 50 },
    ],
  );

  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.listCategories().then(setCategories).catch(() => {});
  }, []);

  // Slug: solo [a-z0-9-]. Sanitiza on-the-fly para que el usuario no pueda
  // tipear nada que el backend vaya a rechazar (mayúsculas, tildes, espacios).
  // Mantiene guiones trailing mientras tipea; los recorta al submit.
  const sanitizeSlug = (raw: string): string =>
    raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-{2,}/g, '-');

  // Auto-generate slug from name on create
  useEffect(() => {
    if (mode === 'create' && name && !slug) {
      setSlug(sanitizeSlug(name).replace(/(^-|-$)+/g, ''));
    }
  }, [name, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const setVariant = (i: number, field: 'size_g' | 'price_clp' | 'stock_qty', value: number) => {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  };
  const addVariantRow = () => {
    const max = Math.max(0, ...variants.map((v) => v.size_g));
    setVariants((prev) => [...prev, { size_g: max + 250, price_clp: 0, stock_qty: 50 }]);
  };
  const removeVariantRow = (i: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const tasting_notes = tastingNotesCsv
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);

      const isCoffee = productKind === 'cafe';
      const payload: ProductCreatePayload = {
        slug: sanitizeSlug(slug).replace(/(^-|-$)+/g, ''),
        name: name.trim(),
        origin: origin.trim(),
        region: region.trim() || null,
        variety: isCoffee ? (variety.trim() || null) : null,
        process: isCoffee ? (process.trim() || null) : null,
        altitude_masl: isCoffee ? (altitudeMasl.trim() || null) : null,
        harvest: isCoffee ? (harvest.trim() || null) : null,
        roast_profile: isCoffee ? roastProfile : '',
        producer: isCoffee ? (producer.trim() || null) : null,
        body: isCoffee ? (bodyTxt.trim() || null) : null,
        acidity: isCoffee ? (acidity.trim() || null) : null,
        tasting_notes: isCoffee ? tasting_notes : [],
        category: category.trim(),
        featured,
        is_published: isPublished,
        description: description.trim() || null,
        variants,
      };

      if (mode === 'create') {
        await adminApi.createProduct(payload);
      } else if (product) {
        // Update producto: campos sin slug ni variants
        await adminApi.updateProduct(product.slug, {
          name: payload.name,
          origin: payload.origin,
          region: payload.region,
          variety: payload.variety,
          process: payload.process,
          altitude_masl: payload.altitude_masl,
          harvest: payload.harvest,
          roast_profile: payload.roast_profile,
          producer: payload.producer,
          body: payload.body,
          acidity: payload.acidity,
          tasting_notes: payload.tasting_notes,
          category: payload.category,
          featured: payload.featured,
          is_published: payload.is_published,
          description: payload.description,
        });
        // Variantes: solo agregar nuevas (no editar existentes, eso lo hace inline en la lista)
        const existingSizes = new Set(product.variants.map((v) => v.size_g));
        for (const v of variants) {
          if (!existingSizes.has(v.size_g)) {
            await adminApi.addVariant(product.slug, v);
          }
        }
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tengu-dark/60 p-4">
      <div className="my-8 w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">
            {mode === 'create' ? 'Nuevo producto' : `Editar ${product?.name}`}
          </h2>
          <button onClick={onClose} className="text-2xl text-tengu-dark/40 hover:text-tengu-dark">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Tipo de producto */}
          <div className="rounded-lg bg-tengu-cream/40 p-4">
            <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Tipo de producto</p>
            <div className="mt-2 flex gap-3">
              <label className={`flex-1 cursor-pointer rounded-md border p-3 text-center text-sm ${productKind === 'cafe' ? 'border-tengu-ink bg-white' : 'border-tengu-dark/15 bg-white/50'}`}>
                <input type="radio" checked={productKind === 'cafe'} onChange={() => setProductKind('cafe')} className="sr-only" />
                ☕ Café (todos los campos de origen)
              </label>
              <label className={`flex-1 cursor-pointer rounded-md border p-3 text-center text-sm ${productKind === 'equipo' ? 'border-tengu-ink bg-white' : 'border-tengu-dark/15 bg-white/50'}`}>
                <input type="radio" checked={productKind === 'equipo'} onChange={() => setProductKind('equipo')} className="sr-only" />
                🛠 Equipo / Taza / Otro (campos de café opcionales)
              </label>
            </div>
            <p className="mt-2 text-xs text-tengu-dark/60">
              Si vendes una taza, un molinillo o equipo: usa "Equipo". Te oculta los campos específicos de café (variedad, proceso, altitud, etc.).
            </p>
          </div>

          {/* Visibilidad */}
          <div className="flex items-center gap-3 rounded-lg border border-tengu-dark/10 bg-white p-4">
            <input
              id="is-published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-5 w-5 accent-tengu-ink"
            />
            <label htmlFor="is-published" className="flex-1 cursor-pointer">
              <p className="text-sm font-semibold">
                {isPublished ? '✓ Publicado en la tienda' : '⊘ Oculto en la tienda (solo admin lo ve)'}
              </p>
              <p className="text-xs text-tengu-dark/60">
                Desactivar para borradores, productos descontinuados o testing. No se borra, solo se oculta.
              </p>
            </label>
          </div>

          {/* Identidad */}
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="col-span-full px-2 font-display text-sm uppercase tracking-wider text-tengu-dark/60">
              Identidad
            </legend>
            <Field label="Nombre" required>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={input} />
            </Field>
            <Field label={`Slug${mode === 'edit' ? ' (no editable)' : ''}`} required>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
                onBlur={(e) => setSlug(sanitizeSlug(e.target.value).replace(/(^-|-$)+/g, ''))}
                disabled={mode === 'edit'}
                pattern="[a-z0-9-]+"
                placeholder="ej: rwanda-natural"
                className={`${input} ${mode === 'edit' ? 'opacity-50' : ''}`}
              />
              {mode === 'create' && (
                <p className="mt-1 text-xs text-tengu-dark/50">
                  Solo minúsculas, números y guiones. Se autocompleta desde el nombre.
                </p>
              )}
            </Field>
            <Field label="Categoría" required>
              <CategoryPicker
                category={category}
                setCategory={setCategory}
                categories={categories}
              />
              <p className="mt-1 text-xs text-tengu-dark/50">
                Elige de las existentes o crea una nueva. Evita typos: "Filtrado" ≠ "filtrado".
              </p>
            </Field>
            {productKind === 'cafe' && (
              <Field label="Perfil de tueste" required>
                <select value={roastProfile} onChange={(e) => setRoastProfile(e.target.value)} className={input}>
                  {ROAST_PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            )}
            <div className="col-span-full">
              <Field label="Descripción corta (opcional, para productos no-café)">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="ej: Taza de cerámica artesanal 250ml. Apta para microondas."
                  className={input}
                />
              </Field>
            </div>
            <label className="col-span-full flex items-center gap-2">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <span className="text-sm">Marcar como destacado (aparece en home)</span>
            </label>
          </fieldset>

          {/* Origen */}
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="col-span-full px-2 font-display text-sm uppercase tracking-wider text-tengu-dark/60">
              {productKind === 'cafe' ? 'Origen' : 'Procedencia / Marca'}
            </legend>
            <Field label={productKind === 'cafe' ? 'País / Origen' : 'Marca / Procedencia'} required>
              <input
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder={productKind === 'cafe' ? 'Colombia' : 'ej: Hario, Tengu, Importado'}
                className={input}
              />
            </Field>
            <Field label={productKind === 'cafe' ? 'Región / Finca' : 'Línea / Modelo (opcional)'}>
              <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder={productKind === 'cafe' ? 'Huila, Finca XX' : 'V60 02 cerámica'} className={input} />
            </Field>
            {productKind === 'cafe' && (
              <>
                <Field label="Productor">
                  <input value={producer} onChange={(e) => setProducer(e.target.value)} className={input} />
                </Field>
                <Field label="Variedad">
                  <input value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="Caturra, Bourbon" className={input} />
                </Field>
                <Field label="Proceso">
                  <input value={process} onChange={(e) => setProcess(e.target.value)} placeholder="Lavado, Natural" className={input} />
                </Field>
                <Field label="Altitud (m.s.n.m.)">
                  <input value={altitudeMasl} onChange={(e) => setAltitudeMasl(e.target.value)} placeholder="1600-2100" className={input} />
                </Field>
                <Field label="Cosecha">
                  <input value={harvest} onChange={(e) => setHarvest(e.target.value)} placeholder="Sept-Nov 2025" className={input} />
                </Field>
              </>
            )}
          </fieldset>

          {/* Perfil sensorial — solo café */}
          {productKind === 'cafe' && <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="col-span-full px-2 font-display text-sm uppercase tracking-wider text-tengu-dark/60">
              Perfil de cata
            </legend>
            <Field label="Cuerpo">
              <input value={bodyTxt} onChange={(e) => setBodyTxt(e.target.value)} placeholder="Medio, sedoso" className={input} />
            </Field>
            <Field label="Acidez">
              <input value={acidity} onChange={(e) => setAcidity(e.target.value)} placeholder="Cítrica, brillante" className={input} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notas de cata (separadas por coma)">
                <input
                  value={tastingNotesCsv}
                  onChange={(e) => setTastingNotesCsv(e.target.value)}
                  placeholder="Chocolate, Caramelo, Frutos rojos"
                  className={input}
                />
              </Field>
            </div>
          </fieldset>}

          {/* Variantes */}
          <fieldset>
            <legend className="px-2 font-display text-sm uppercase tracking-wider text-tengu-dark/60">
              {productKind === 'cafe' ? 'Formatos y precios' : 'Variantes / SKU y precios'}
            </legend>
            {productKind === 'equipo' && (
              <p className="mt-1 text-xs text-tengu-dark/60">
                Para una taza o equipo: agrega una sola variante con tamaño 1 (significa "1 unidad") y el precio.
              </p>
            )}
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-tengu-dark/60">
                  <th className="pb-2">Tamaño (g)</th>
                  <th className="pb-2">Precio (CLP)</th>
                  <th className="pb-2">Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} className="border-t border-tengu-dark/10">
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min={1}
                        value={v.size_g}
                        onChange={(e) => setVariant(i, 'size_g', Number(e.target.value))}
                        className="w-24 rounded-md border border-tengu-dark/15 px-2 py-1"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min={0}
                        value={v.price_clp}
                        onChange={(e) => setVariant(i, 'price_clp', Number(e.target.value))}
                        className="w-28 rounded-md border border-tengu-dark/15 px-2 py-1"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min={0}
                        value={v.stock_qty}
                        onChange={(e) => setVariant(i, 'stock_qty', Number(e.target.value))}
                        className="w-20 rounded-md border border-tengu-dark/15 px-2 py-1"
                      />
                    </td>
                    <td className="py-2">
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariantRow(i)}
                          className="text-xs uppercase tracking-wider text-tengu-coral hover:underline"
                        >
                          Quitar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={addVariantRow}
              className="mt-2 text-xs uppercase tracking-wider text-tengu-ink hover:underline"
            >
              + Agregar formato
            </button>
          </fieldset>

          {error && (
            <div className="rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-tengu-dark/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-sm uppercase tracking-wider text-tengu-dark/60 hover:text-tengu-dark"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-tengu-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark disabled:opacity-50"
            >
              {saving ? 'Guardando…' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const input = 'w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm focus:border-tengu-ink focus:outline-none';

function CategoryPicker({
  category,
  setCategory,
  categories,
}: {
  category: string;
  setCategory: (v: string) => void;
  categories: string[];
}) {
  // Si la categoría actual no está en la lista existente, asumimos que el
  // usuario está creando una nueva → entramos en modo input free-text.
  const isExisting = categories.includes(category);
  const [creating, setCreating] = useState(!isExisting && category !== '');

  if (creating) {
    return (
      <div className="flex gap-2">
        <input
          required
          autoFocus
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onBlur={(e) => setCategory(e.target.value.trim())}
          placeholder="Nombre de la categoría nueva"
          className={`${input} flex-1`}
        />
        <button
          type="button"
          onClick={() => { setCreating(false); setCategory(categories[0] ?? ''); }}
          className="text-xs uppercase tracking-wider text-tengu-dark/60 hover:text-tengu-dark"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        required
        value={isExisting ? category : ''}
        onChange={(e) => {
          if (e.target.value === '__new__') {
            setCategory('');
            setCreating(true);
          } else {
            setCategory(e.target.value);
          }
        }}
        className={`${input} flex-1`}
      >
        {!isExisting && <option value="" disabled>Elige una categoría</option>}
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
        <option value="__new__">+ Crear categoría nueva…</option>
      </select>
    </div>
  );
}

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
