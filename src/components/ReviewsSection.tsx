import { useEffect, useState, type FormEvent } from 'react';

import { api } from '../lib/api';
import type { Review, ReviewSummary } from '../types';
import Stars from './Stars';

type Props = {
  productSlug: string;
  productName: string;
};

const LS_REVIEWED = 'tengu-reviewed-products';

function getReviewedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_REVIEWED);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markReviewed(slug: string) {
  const s = getReviewedSet();
  s.add(slug);
  localStorage.setItem(LS_REVIEWED, JSON.stringify([...s]));
}

export default function ReviewsSection({ productSlug, productName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ count: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setAlreadyReviewed(getReviewedSet().has(productSlug));
    let cancelled = false;
    Promise.all([api.listReviews(productSlug), api.reviewSummary(productSlug)])
      .then(([list, s]) => {
        if (cancelled) return;
        setReviews(list);
        setSummary(s);
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [productSlug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitState('loading');
    setSubmitError(null);
    try {
      await api.submitReview({
        product_slug: productSlug,
        customer_name: name.trim(),
        customer_email: email.trim(),
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });
      markReviewed(productSlug);
      setAlreadyReviewed(true);
      setSubmitState('ok');
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-tengu-dark/10 pt-12">
        <div>
          <h2 id="reviews-heading" className="font-display text-3xl">Reseñas</h2>
          {summary.count > 0 ? (
            <div className="mt-2 flex items-center gap-3">
              <Stars rating={summary.average} size="md" />
              <span className="text-sm text-tengu-dark/70">
                <strong>{summary.average.toFixed(1)}</strong> de 5 ·{' '}
                {summary.count} {summary.count === 1 ? 'reseña' : 'reseñas'}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-tengu-dark/60">Aún no hay reseñas. Sé el primero.</p>
          )}
        </div>
        {!alreadyReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-tengu-ink px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {showForm && submitState !== 'ok' && (
        <form onSubmit={handleSubmit} className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg">Cuéntanos cómo te fue con {productName}</h3>
          <p className="mt-1 text-xs text-tengu-dark/60">
            Las reseñas pasan por revisión antes de publicarse (en general &lt; 24h).
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-tengu-dark/70">Nombre *</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-tengu-dark/70">Email *</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-4">
            <span className="block text-xs uppercase tracking-wider text-tengu-dark/70">Tu valoración *</span>
            <div className="mt-2 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                  className="transition hover:scale-110"
                >
                  <Stars rating={n <= rating ? 5 : 0} size="lg" className={n > rating ? 'opacity-40' : ''} />
                </button>
              ))}
              <span className="ml-2 text-sm text-tengu-dark/60">{rating} / 5</span>
            </div>
            {/* Simplificado: una sola fila de 5 estrellas que rellena hasta el rating. Mejor: clickeable cada estrella */}
          </div>

          <label className="mt-4 block">
            <span className="block text-xs uppercase tracking-wider text-tengu-dark/70">Título (opcional)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej: Excelente sabor cítrico"
              className="mt-1 w-full rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
            />
          </label>

          <label className="mt-4 block">
            <span className="block text-xs uppercase tracking-wider text-tengu-dark/70">
              Tu reseña *
            </span>
            <textarea
              required
              minLength={10}
              maxLength={2000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="¿Cómo lo preparaste? ¿Qué notas sentiste? ¿Lo recomiendas?"
              className="mt-1 w-full rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-tengu-dark/50">{body.length} / 2000 caracteres</span>
          </label>

          {submitError && (
            <div className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
              {submitError}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitState === 'loading'}
              className="rounded-md bg-tengu-mustard px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white disabled:opacity-50"
            >
              {submitState === 'loading' ? 'Enviando…' : 'Publicar reseña'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs uppercase tracking-wider text-tengu-dark/60 hover:text-tengu-dark"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {submitState === 'ok' && (
        <div className="mt-8 rounded-xl bg-tengu-mustard/10 p-6 text-center">
          <p className="text-2xl">✓</p>
          <p className="mt-2 font-display text-lg">¡Gracias por tu reseña!</p>
          <p className="mt-1 text-sm text-tengu-dark/60">
            La revisamos en menos de 24h y la publicamos. Te avisamos cuando esté visible.
          </p>
        </div>
      )}

      <div className="mt-10">
        {loading ? (
          <p className="text-tengu-dark/60">Cargando…</p>
        ) : reviews.length === 0 ? (
          !showForm && (
            <p className="text-tengu-dark/60">
              Aún no hay reseñas publicadas de este café.
            </p>
          )
        ) : (
          <ul className="space-y-6">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars rating={r.rating} size="sm" />
                  <span className="text-xs text-tengu-dark/50">
                    {new Date(r.created_at).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {r.title && <h4 className="mt-2 font-semibold">{r.title}</h4>}
                <p className="mt-2 leading-relaxed text-tengu-dark/80">{r.body}</p>
                <p className="mt-3 text-xs uppercase tracking-wider text-tengu-dark/50">
                  — {r.customer_name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
