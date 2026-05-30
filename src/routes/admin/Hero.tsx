import { useEffect, useState } from 'react';

import {
  adminApi,
  type AdminHeroSlide,
  type HeroSlideCreatePayload,
} from '../../lib/admin-api';
import { isoToLocalInput, localInputToIso } from '../../lib/datetime';

function emptyDraft(): HeroSlideCreatePayload {
  return {
    image: '',
    eyebrow: '',
    title: '',
    subtitle: '',
    cta_label: '',
    cta_url: '',
    image_has_text: false,
    sort_order: 100,
    is_active: true,
    starts_at: null,
    ends_at: null,
  };
}

export default function AdminHero() {
  const [slides, setSlides] = useState<AdminHeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<HeroSlideCreatePayload | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listHeroSlides()
      .then(setSlides)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startCreate = () => {
    setDraft({ ...emptyDraft(), sort_order: (slides.at(-1)?.sort_order ?? 0) + 10 });
    setEditingId(null);
  };

  const startEdit = (s: AdminHeroSlide) => {
    setDraft({
      image: s.image,
      eyebrow: s.eyebrow,
      title: s.title,
      subtitle: s.subtitle,
      cta_label: s.cta_label,
      cta_url: s.cta_url,
      image_has_text: s.image_has_text,
      sort_order: s.sort_order,
      is_active: s.is_active,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
    });
    setEditingId(s.id);
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.image.trim()) {
      setError('Falta la imagen del slide (subí una o pegá una ruta).');
      return;
    }
    setError(null);
    try {
      if (editingId === null) await adminApi.createHeroSlide(draft);
      else await adminApi.updateHeroSlide(editingId, draft);
      setDraft(null);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggleActive = async (s: AdminHeroSlide) => {
    try {
      await adminApi.updateHeroSlide(s.id, { is_active: !s.is_active });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const remove = async (s: AdminHeroSlide) => {
    if (!confirm('¿Borrar este slide del carrusel?')) return;
    try {
      await adminApi.deleteHeroSlide(s.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Carrusel del home</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">
            Slides del hero. Sirven para promos (Cyber, Black Friday): título, subtítulo, botón,
            imagen y ventana de fechas. Si dejás el título vacío, se usa el titular por defecto.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="rounded-md bg-tengu-mustard px-5 py-2 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
        >
          + Nuevo slide
        </button>
      </header>

      {error && (
        <div className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
          {error}
        </div>
      )}

      {draft && (
        <SlideForm
          draft={draft}
          setDraft={setDraft}
          editing={editingId !== null}
          onCancel={() => { setDraft(null); setEditingId(null); }}
          onSave={save}
          onError={setError}
        />
      )}

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : slides.length === 0 ? (
        <p className="mt-8 text-tengu-dark/60">No hay slides. Creá uno con "+ Nuevo slide".</p>
      ) : (
        <div className="mt-6 space-y-3">
          {slides.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
            >
              <SlidePreviewImg image={s.image} />
              <div className="min-w-48 flex-1">
                <p className="text-xs uppercase tracking-wider text-tengu-mustard">{s.eyebrow || '—'}</p>
                <p className="font-display text-lg">{s.title || <span className="text-tengu-dark/40">(titular por defecto)</span>}</p>
                {s.subtitle && <p className="text-sm text-tengu-dark/60">{s.subtitle}</p>}
                <p className="mt-1 text-xs text-tengu-dark/50">
                  orden {s.sort_order}
                  {s.cta_url && <> · botón: {s.cta_label || 'Ver oferta'} → {s.cta_url}</>}
                  {(s.starts_at || s.ends_at) && (
                    <> · vigencia: {fmt(s.starts_at) || '…'} → {fmt(s.ends_at) || '…'}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => toggleActive(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  s.is_active ? 'bg-emerald-100 text-emerald-900' : 'bg-tengu-dark/10 text-tengu-dark/60'
                }`}
              >
                {s.is_active ? 'Activo' : 'Inactivo'}
              </button>
              <div className="flex gap-3">
                <button onClick={() => startEdit(s)} className="text-xs uppercase tracking-wider text-tengu-ink hover:underline">
                  Editar
                </button>
                <button onClick={() => remove(s)} className="text-xs uppercase tracking-wider text-tengu-coral hover:underline">
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmt(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
}

function SlidePreviewImg({ image }: { image: string }) {
  const isBase = !image.includes('/') && !image.includes('.');
  const src = isBase ? `/${image}-768w.webp` : image;
  return (
    <img
      src={src}
      alt=""
      className="h-16 w-28 shrink-0 rounded-md bg-tengu-dark/10 object-cover"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
    />
  );
}

function SlideForm({
  draft,
  setDraft,
  editing,
  onCancel,
  onSave,
  onError,
}: {
  draft: HeroSlideCreatePayload;
  setDraft: (d: HeroSlideCreatePayload) => void;
  editing: boolean;
  onCancel: () => void;
  onSave: () => void;
  onError: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const update = <K extends keyof HeroSlideCreatePayload>(field: K, value: HeroSlideCreatePayload[K]) =>
    setDraft({ ...draft, [field]: value });

  const input = 'w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm';

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await adminApi.uploadImage(file);
      update('image', url);
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-tengu-mustard/40 bg-tengu-cream/30 p-6">
      <h2 className="font-display text-xl">{editing ? 'Editar slide' : 'Nuevo slide'}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Imagen</span>
          <div className="mt-1 flex items-center gap-3">
            {draft.image && <SlidePreviewImg image={draft.image} />}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
              className="text-sm"
            />
            {uploading && <span className="text-xs text-tengu-dark/50">Subiendo…</span>}
          </div>
          <input
            value={draft.image}
            onChange={(e) => update('image', e.target.value)}
            placeholder="/uploads/cyber.webp  o  hero-bg"
            className={`${input} mt-2 font-mono text-xs`}
          />
        </label>
        <label className="flex items-start gap-2 sm:col-span-2 rounded-md bg-white/60 p-3">
          <input
            type="checkbox"
            checked={draft.image_has_text ?? false}
            onChange={(e) => update('image_has_text', e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-tengu-mustard"
          />
          <span className="text-sm">
            La imagen ya trae el texto
            <span className="mt-0.5 block text-xs text-tengu-dark/60">
              No superpone título/botón y la muestra completa sin recortar. Ideal para banners de promo (ej. tu imagen del Cyber). Los campos de texto de abajo se ignoran.
            </span>
          </span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Eyebrow (texto chico arriba)</span>
          <input value={draft.eyebrow ?? ''} onChange={(e) => update('eyebrow', e.target.value)} maxLength={80} placeholder="CYBER" className={input} />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Orden</span>
          <input type="number" min={0} value={draft.sort_order ?? 100} onChange={(e) => update('sort_order', parseInt(e.target.value || '0', 10))} className={input} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Título (vacío = titular por defecto)</span>
          <input value={draft.title ?? ''} onChange={(e) => update('title', e.target.value)} maxLength={160} placeholder="CYBER en Tengu — 20% en todo" className={input} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Subtítulo</span>
          <input value={draft.subtitle ?? ''} onChange={(e) => update('subtitle', e.target.value)} maxLength={400} placeholder="Solo 1, 2 y 3 de junio. Con el código CYBER2026." className={input} />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Texto del botón</span>
          <input value={draft.cta_label ?? ''} onChange={(e) => update('cta_label', e.target.value)} maxLength={60} placeholder="Comprar café" className={input} />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Link del botón</span>
          <input value={draft.cta_url ?? ''} onChange={(e) => update('cta_url', e.target.value)} maxLength={300} placeholder="/tienda" className={input} />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Mostrar desde (opcional)</span>
          <input
            type="datetime-local"
            value={isoToLocalInput(draft.starts_at)}
            onChange={(e) => update('starts_at', localInputToIso(e.target.value))}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Mostrar hasta (opcional)</span>
          <input
            type="datetime-local"
            value={isoToLocalInput(draft.ends_at)}
            onChange={(e) => update('ends_at', localInputToIso(e.target.value))}
            className={input}
          />
        </label>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" checked={draft.is_active ?? true} onChange={(e) => update('is_active', e.target.checked)} className="h-4 w-4 accent-tengu-mustard" />
          <span className="text-sm">Activo</span>
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={onSave} className="rounded-md bg-tengu-ink px-5 py-2 text-sm font-semibold uppercase tracking-wider text-tengu-cream hover:bg-tengu-dark">
          Guardar
        </button>
        <button onClick={onCancel} className="rounded-md border border-tengu-dark/20 px-5 py-2 text-sm hover:bg-tengu-dark/5">
          Cancelar
        </button>
      </div>
    </div>
  );
}
