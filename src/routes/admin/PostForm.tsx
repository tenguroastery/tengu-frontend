import { useEffect, useState } from 'react';

import { adminApi } from '../../lib/admin-api';
import type { Post } from '../../types';

type Props = {
  post: Post | null;  // null = crear nuevo
  onClose: () => void;
  onSaved: () => void;
};

const sanitizeSlug = (raw: string): string =>
  raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-');

export default function PostForm({ post, onClose, onSaved }: Props) {
  const isEdit = post !== null;
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [title, setTitle] = useState(post?.title ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? '');
  const [cover, setCover] = useState(post?.cover ?? '');
  const [publishedAt, setPublishedAt] = useState(post?.published_at ?? new Date().toISOString().slice(0, 10));
  const [readingMinutes, setReadingMinutes] = useState(post?.reading_minutes ?? 5);
  const [author, setAuthor] = useState(post?.author ?? 'Equipo Tengu');
  const [tagsCsv, setTagsCsv] = useState((post?.tags ?? []).join(', '));
  const [body, setBody] = useState(post?.body ?? '');
  const [isPublished, setIsPublished] = useState(post?.is_published ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generar slug desde el título al crear
  useEffect(() => {
    if (!isEdit && title && !slug) {
      setSlug(sanitizeSlug(title).replace(/(^-|-$)+/g, ''));
    }
  }, [title, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const cleanSlug = sanitizeSlug(slug).replace(/(^-|-$)+/g, '');
    const tags = tagsCsv.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = {
      slug: cleanSlug,
      title: title.trim(),
      excerpt: excerpt.trim(),
      meta_description: metaDescription.trim(),
      cover: cover.trim(),
      published_at: publishedAt,
      reading_minutes: readingMinutes,
      author: author.trim(),
      tags,
      body: body.trim(),
      is_published: isPublished,
    };
    try {
      if (isEdit && post) {
        const { slug: _omit, ...patch } = payload;
        await adminApi.updatePost(post.slug, patch);
      } else {
        await adminApi.createPost(payload);
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
      <div className="my-8 w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">
            {isEdit ? `Editar: ${post.title}` : 'Nuevo post'}
          </h2>
          <button onClick={onClose} className="text-2xl text-tengu-dark/40 hover:text-tengu-dark">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex items-center gap-3 rounded-lg border border-tengu-dark/10 bg-white p-4">
            <input
              id="post-published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-5 w-5 accent-tengu-ink"
            />
            <label htmlFor="post-published" className="flex-1 cursor-pointer text-sm font-semibold">
              {isPublished ? '✓ Publicado' : '⊘ Borrador (oculto del blog público)'}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título" required>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
            </Field>
            <Field label={`Slug${isEdit ? ' (no editable)' : ''}`} required>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
                onBlur={(e) => setSlug(sanitizeSlug(e.target.value).replace(/(^-|-$)+/g, ''))}
                disabled={isEdit}
                pattern="[a-z0-9-]+"
                className={`${input} ${isEdit ? 'opacity-50' : ''}`}
              />
            </Field>
          </div>

          <Field label="Bajada (excerpt)" required hint="Aparece en la lista del blog. Máx 500 caracteres.">
            <textarea
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              maxLength={500}
              className={input}
            />
          </Field>

          <Field label="Meta description (SEO)" hint="≤200 caracteres. Si vacío usa el excerpt.">
            <input
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={200}
              className={input}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
            <Field label="URL cover" hint="Ej: /uploads/rwanda-natural.jpg">
              <input value={cover} onChange={(e) => setCover(e.target.value)} className={input} />
            </Field>
            <Field label="Fecha publicación" required>
              <input
                required
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={input}
              />
            </Field>
            <Field label="Min lectura">
              <input
                type="number"
                min={1}
                max={120}
                value={readingMinutes}
                onChange={(e) => setReadingMinutes(parseInt(e.target.value || '5', 10))}
                className={input}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Autor">
              <input value={author} onChange={(e) => setAuthor(e.target.value)} className={input} />
            </Field>
            <Field label="Tags (separadas por coma)">
              <input
                value={tagsCsv}
                onChange={(e) => setTagsCsv(e.target.value)}
                placeholder="Proceso, Educación"
                className={input}
              />
            </Field>
          </div>

          <Field label="Cuerpo (Markdown)" required hint="Soporta encabezados ## ###, listas, links, **negrita**.">
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              className={`${input} font-mono text-xs`}
            />
          </Field>

          {error && (
            <div className="rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-tengu-dark/10 pt-4">
            <button type="button" onClick={onClose} className="text-sm uppercase tracking-wider text-tengu-dark/60 hover:text-tengu-dark">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-tengu-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark disabled:opacity-50"
            >
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const input = 'w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm focus:border-tengu-ink focus:outline-none';

function Field({ label, required = false, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-tengu-dark/70">
        {label}
        {required && <span className="ml-0.5 text-tengu-coral">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-tengu-dark/50">{hint}</span>}
    </label>
  );
}
