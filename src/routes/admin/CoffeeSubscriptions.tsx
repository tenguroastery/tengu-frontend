import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { adminApi, type AdminCoffeeSubscription } from '../../lib/admin-api';
import { formatCLP, formatSize } from '../../lib/api';

type Filter = 'all' | 'active' | 'paused' | 'due' | 'canceled';

export default function CoffeeSubscriptions() {
  const [subs, setSubs] = useState<AdminCoffeeSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    adminApi
      .listCoffeeSubscriptions()
      .then(setSubs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const filtered = subs.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'active') return s.is_active;
    if (filter === 'paused') return !s.is_active;
    if (filter === 'canceled') return Boolean(s.canceled_at);
    if (filter === 'due') {
      if (!s.is_active || !s.next_charge_at) return false;
      return new Date(s.next_charge_at) <= new Date();
    }
    return true;
  });

  const stats = {
    total: subs.length,
    active: subs.filter((s) => s.is_active).length,
    due: subs.filter((s) => s.is_active && s.next_charge_at && new Date(s.next_charge_at) <= new Date()).length,
    monthlyRevenue: subs
      .filter((s) => s.is_active)
      .reduce((sum) => sum + 0, 0), // calculado abajo con productos si quisieras
  };

  const updateSub = async (id: number, payload: Parameters<typeof adminApi.updateCoffeeSubscription>[1]) => {
    setBusy(id);
    try {
      const updated = await adminApi.updateCoffeeSubscription(id, payload);
      setSubs((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error actualizando suscripción');
    } finally {
      setBusy(null);
    }
  };

  const processNow = async (id: number) => {
    if (!confirm('Crear una nueva orden pending para esta suscripción? Después debes gestionar el cobro.')) return;
    setBusy(id);
    try {
      const res = await adminApi.processCoffeeSubscription(id);
      setSubs((prev) => prev.map((s) => (s.id === id ? res.subscription : s)));
      setFlash(`Orden #${res.order.id} creada por ${formatCLP(res.order.total_clp)}`);
      setTimeout(() => setFlash(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setBusy(null);
    }
  };

  const pauseSub = (id: number) => updateSub(id, { is_active: false });
  const resumeSub = (id: number) => updateSub(id, { is_active: true });
  const cancelSub = (id: number) => {
    const reason = prompt('Motivo de cancelación (opcional):') ?? '';
    return updateSub(id, { is_active: false, cancel_reason: reason });
  };

  const stateBadge = (s: AdminCoffeeSubscription) => {
    if (!s.is_active) {
      return <span className="rounded-full bg-tengu-dark/10 px-2 py-0.5 text-xs uppercase tracking-wider text-tengu-dark/60">Pausada</span>;
    }
    if (s.next_charge_at && new Date(s.next_charge_at) <= new Date()) {
      return <span className="rounded-full bg-tengu-coral/15 px-2 py-0.5 text-xs uppercase tracking-wider text-tengu-coral">Vencida</span>;
    }
    return <span className="rounded-full bg-tengu-mustard/20 px-2 py-0.5 text-xs uppercase tracking-wider text-tengu-mustard">Activa</span>;
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Suscripciones café</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">
            Entregas recurrentes mensuales/bimestrales. {stats.total} totales · {stats.active} activas · {stats.due} con cargo vencido
          </p>
        </div>
        <button onClick={reload} className="text-xs uppercase tracking-wider text-tengu-ink hover:underline">↻ Recargar</button>
      </header>

      {flash && (
        <div className="mt-4 rounded-md border border-tengu-mustard/30 bg-tengu-mustard/10 p-3 text-sm text-tengu-dark">
          {flash}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', 'active', 'due', 'paused', 'canceled'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-wider transition ${
              filter === f ? 'bg-tengu-ink text-white' : 'bg-white hover:bg-tengu-ink/10'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : f === 'due' ? 'Vencidas hoy' : f === 'paused' ? 'Pausadas' : 'Canceladas'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-tengu-dark/60">Sin suscripciones para este filtro.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-tengu-cream/40 text-left text-xs uppercase tracking-wider text-tengu-dark/60">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Próximo cargo</th>
                <th className="px-4 py-3">Entregas</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <Fragment key={s.id}>
                  <tr className="border-t border-tengu-dark/5">
                    <td className="px-4 py-3 font-mono">{s.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{s.customer_name}</p>
                      <p className="text-xs text-tengu-dark/60">{s.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      Cada <strong>{s.frequency_days}d</strong>
                      <br />
                      {s.is_surprise ? '✨ Sorpresa' : s.product_slug}
                      {' · '}{formatSize(s.size_g)}
                      <br />
                      <span className="text-tengu-mustard">-{s.discount_pct}%</span>
                    </td>
                    <td className="px-4 py-3">{stateBadge(s)}</td>
                    <td className="px-4 py-3 text-xs">
                      {s.next_charge_at ? (
                        <span className={new Date(s.next_charge_at) <= new Date() ? 'font-bold text-tengu-coral' : ''}>
                          {new Date(s.next_charge_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">{s.orders_count}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                        className="text-xs uppercase tracking-wider text-tengu-ink hover:underline"
                      >
                        {expanded === s.id ? 'Cerrar' : 'Detalle'}
                      </button>
                    </td>
                  </tr>
                  {expanded === s.id && (
                    <tr className="bg-tengu-cream/30">
                      <td colSpan={7} className="px-4 py-5">
                        <SubDetail
                          sub={s}
                          busy={busy === s.id}
                          onPause={() => pauseSub(s.id)}
                          onResume={() => resumeSub(s.id)}
                          onCancel={() => cancelSub(s.id)}
                          onProcess={() => processNow(s.id)}
                          onUpdateNextCharge={(iso) => updateSub(s.id, { next_charge_at: iso })}
                          onUpdateNotes={(notes) => updateSub(s.id, { admin_notes: notes })}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SubDetail({
  sub,
  busy,
  onPause,
  onResume,
  onCancel,
  onProcess,
  onUpdateNextCharge,
  onUpdateNotes,
}: {
  sub: AdminCoffeeSubscription;
  busy: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onProcess: () => void;
  onUpdateNextCharge: (iso: string) => void;
  onUpdateNotes: (notes: string) => void;
}) {
  const [nextDateInput, setNextDateInput] = useState(
    sub.next_charge_at ? sub.next_charge_at.slice(0, 10) : '',
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Cliente</p>
            <p className="mt-1 font-semibold">{sub.customer_name}</p>
            <p className="text-tengu-dark/70">{sub.customer_email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Plan</p>
            <p className="mt-1">Cada {sub.frequency_days} días</p>
            <p className="text-tengu-dark/70">
              {sub.is_surprise ? '✨ Sorpresa del barista' : sub.product_slug} · {formatSize(sub.size_g)}
            </p>
            <p className="text-xs text-tengu-mustard">-{sub.discount_pct}% por entrega</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Última entrega</p>
            <p className="mt-1">
              {sub.last_charge_at
                ? new Date(sub.last_charge_at).toLocaleDateString('es-CL', { dateStyle: 'medium' })
                : 'Sin entregas aún'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Primera orden</p>
            <p className="mt-1">
              {sub.first_order_id ? (
                <Link to="/admin/orders" className="text-tengu-ink underline">
                  #{sub.first_order_id}
                </Link>
              ) : (
                '—'
              )}
            </p>
          </div>
        </div>

        <div>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-tengu-dark/60">Próximo cargo</span>
            <div className="mt-1 flex gap-2">
              <input
                type="date"
                value={nextDateInput}
                onChange={(e) => setNextDateInput(e.target.value)}
                className="rounded-md border border-tengu-dark/15 px-3 py-1.5 text-sm"
              />
              <button
                onClick={() => {
                  // YYYY-MM-DD se parsea como UTC midnight → en Chile sería el día previo.
                  // Anclamos al mediodía local para que la fecha mostrada quede estable.
                  onUpdateNextCharge(new Date(`${nextDateInput}T12:00:00`).toISOString());
                }}
                disabled={busy || !nextDateInput}
                className="rounded-md bg-tengu-ink px-3 py-1.5 text-xs uppercase tracking-wider text-white disabled:opacity-50"
              >
                Guardar fecha
              </button>
            </div>
          </label>
        </div>

        <div>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-tengu-dark/60">Notas internas</span>
            <textarea
              defaultValue={sub.admin_notes ?? ''}
              onBlur={(e) => {
                if (e.target.value !== (sub.admin_notes ?? '')) {
                  onUpdateNotes(e.target.value);
                }
              }}
              rows={2}
              className="mt-1 w-full rounded-md border border-tengu-dark/15 px-3 py-1.5 text-sm"
              placeholder="ej: cliente cambió preferencia a Rwanda, confirmar por mail"
            />
          </label>
        </div>
      </div>

      <aside className="rounded-xl border border-tengu-dark/10 bg-white p-4">
        <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Acciones</p>
        <div className="mt-3 space-y-2">
          {sub.is_active ? (
            <>
              <button
                onClick={onProcess}
                disabled={busy}
                className="w-full rounded-md bg-tengu-mustard px-3 py-2 text-xs font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white disabled:opacity-50"
              >
                Procesar próximo cargo ahora
              </button>
              <button
                onClick={onPause}
                disabled={busy}
                className="w-full rounded-md border border-tengu-dark/20 px-3 py-2 text-xs uppercase tracking-wider hover:border-tengu-ink disabled:opacity-50"
              >
                ⏸ Pausar
              </button>
              <button
                onClick={onCancel}
                disabled={busy}
                className="w-full rounded-md border border-tengu-coral/30 px-3 py-2 text-xs uppercase tracking-wider text-tengu-coral hover:bg-tengu-coral hover:text-white disabled:opacity-50"
              >
                Cancelar suscripción
              </button>
            </>
          ) : (
            <button
              onClick={onResume}
              disabled={busy}
              className="w-full rounded-md bg-tengu-ink px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark disabled:opacity-50"
            >
              ▶ Reactivar
            </button>
          )}
        </div>
        <p className="mt-4 text-xs text-tengu-dark/40">
          El cron auto-procesa subs vencidas cada hora. Usa "Procesar ahora" para forzar el cargo manualmente.
        </p>
      </aside>
    </div>
  );
}
