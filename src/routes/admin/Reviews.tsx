import { useEffect, useState } from 'react';

import { adminApi, type AdminReview, type ReviewModeratePayload } from '../../lib/admin-api';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_LABEL: Record<AdminReview['status'], string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const STATUS_BADGE: Record<AdminReview['status'], string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-rose-100 text-rose-900',
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<{ title: string; body: string; admin_notes: string }>({
    title: '',
    body: '',
    admin_notes: '',
  });

  const load = (status: Filter) => {
    setLoading(true);
    adminApi
      .listReviews(status === 'all' ? undefined : status)
      .then(setReviews)
      .catch((err) => alert(`Error cargando reseñas: ${err}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  const startEdit = (r: AdminReview) => {
    setEditingId(r.id);
    setDraft({
      title: r.title ?? '',
      body: r.body,
      admin_notes: r.admin_notes ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const moderate = async (id: number, payload: ReviewModeratePayload) => {
    try {
      const updated = await adminApi.moderateReview(id, payload);
      setReviews((rs) => rs.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
    } catch (err) {
      alert(`Error guardando: ${err}`);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('¿Borrar esta reseña? Esta acción no se puede deshacer.')) return;
    try {
      await adminApi.deleteReview(id);
      setReviews((rs) => rs.filter((r) => r.id !== id));
    } catch (err) {
      alert(`Error borrando: ${err}`);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Reseñas</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">
            Modera valoraciones, edita texto injurioso o elimina reseñas.
          </p>
        </div>
        <div className="flex gap-2 text-xs uppercase tracking-wider">
          {(['pending', 'approved', 'rejected', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md border px-3 py-1.5 transition ${
                filter === f
                  ? 'border-tengu-ink bg-tengu-ink text-tengu-cream'
                  : 'border-tengu-dark/20 text-tengu-dark/70 hover:border-tengu-ink'
              }`}
            >
              {f === 'all' ? 'Todas' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-8 text-tengu-dark/60">Sin reseñas en esta vista.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => {
            const isEditing = editingId === r.id;
            return (
              <article
                key={r.id}
                className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-tengu-dark/5"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-tengu-dark">{r.customer_name}</span>
                      <span className="text-xs text-tengu-dark/50">{r.customer_email}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-tengu-dark/60">
                      {new Date(r.created_at).toLocaleString('es-CL')} · {r.product_slug} ·{' '}
                      <span className="text-tengu-mustard">{'★'.repeat(r.rating)}</span>
                      <span className="opacity-30">{'★'.repeat(5 - r.rating)}</span> ({r.rating}/5)
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_BADGE[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </header>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-tengu-dark/70">
                        Título
                      </span>
                      <input
                        value={draft.title}
                        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                        maxLength={200}
                        className="mt-1 w-full rounded-md border border-tengu-dark/20 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-tengu-dark/70">
                        Cuerpo
                      </span>
                      <textarea
                        value={draft.body}
                        onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                        minLength={10}
                        maxLength={2000}
                        rows={4}
                        className="mt-1 w-full rounded-md border border-tengu-dark/20 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wider text-tengu-dark/70">
                        Notas internas (no se muestran al público)
                      </span>
                      <textarea
                        value={draft.admin_notes}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, admin_notes: e.target.value }))
                        }
                        rows={2}
                        className="mt-1 w-full rounded-md border border-tengu-dark/20 px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          moderate(r.id, {
                            title: draft.title,
                            body: draft.body,
                            admin_notes: draft.admin_notes,
                          })
                        }
                        className="rounded-md bg-tengu-ink px-4 py-2 text-sm font-semibold text-tengu-cream hover:bg-tengu-dark"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-md border border-tengu-dark/20 px-4 py-2 text-sm hover:bg-tengu-dark/5"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    {r.title && <p className="font-semibold text-tengu-dark">{r.title}</p>}
                    <p className="mt-1 whitespace-pre-wrap text-sm text-tengu-dark/80">{r.body}</p>
                    {r.admin_notes && (
                      <p className="mt-2 rounded-md bg-tengu-dark/5 px-3 py-2 text-xs italic text-tengu-dark/60">
                        Nota interna: {r.admin_notes}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-wider">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => moderate(r.id, { status: 'approved' })}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
                    >
                      Aprobar
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => moderate(r.id, { status: 'rejected' })}
                      className="rounded-md bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-700"
                    >
                      Rechazar
                    </button>
                  )}
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(r)}
                      className="rounded-md border border-tengu-dark/20 px-3 py-1.5 font-semibold hover:bg-tengu-dark/5"
                    >
                      Editar texto
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    className="ml-auto rounded-md border border-rose-300 px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Borrar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
