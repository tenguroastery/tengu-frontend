import { useEffect, useState } from 'react';

import { adminApi, type AbandonedCart } from '../../lib/admin-api';
import { formatCLP } from '../../lib/api';

type Filter = 'open' | 'recovered' | 'dismissed' | 'all';

const STATUS_LABEL: Record<AbandonedCart['status'], string> = {
  open: 'Abierto',
  recovered: 'Recuperado',
  dismissed: 'Descartado',
};

const STATUS_BADGE: Record<AbandonedCart['status'], string> = {
  open: 'bg-amber-100 text-amber-900',
  recovered: 'bg-emerald-100 text-emerald-900',
  dismissed: 'bg-tengu-dark/10 text-tengu-dark/60',
};

function formatRelative(iso: string): string {
  const ts = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'recién';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `hace ${diffD} d`;
}

function whatsappLink(phone: string | null, name: string | null, cart: AbandonedCart): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null;
  const firstName = (name || '').split(' ')[0] || '';
  const itemsList = cart.items.map((i) => `${i.product_name} ${i.size_g}g x${i.quantity}`).join(', ');
  const msg = `Hola${firstName ? ' ' + firstName : ''}, te escribo desde Tengu Roastery ☕. Vi que dejaste un pedido en el carrito (${itemsList}). ¿Te ayudo a finalizar la compra?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export default function AdminAbandonedCarts() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [filter, setFilter] = useState<Filter>('open');
  const [loading, setLoading] = useState(true);

  const load = (status: Filter) => {
    setLoading(true);
    adminApi
      .listAbandonedCarts(status === 'all' ? undefined : status)
      .then(setCarts)
      .catch((err) => alert(`Error: ${err}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  const dismiss = async (id: number) => {
    if (!confirm('¿Marcar como descartado? No vuelve a aparecer en "abiertos".')) return;
    try {
      const upd = await adminApi.updateAbandonedCart(id, { status: 'dismissed' });
      setCarts((cs) => cs.map((c) => (c.id === id ? upd : c)));
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const markReminded = async (id: number) => {
    try {
      const upd = await adminApi.updateAbandonedCart(id, { mark_reminded: true });
      setCarts((cs) => cs.map((c) => (c.id === id ? upd : c)));
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('¿Borrar definitivamente?')) return;
    try {
      await adminApi.deleteAbandonedCart(id);
      setCarts((cs) => cs.filter((c) => c.id !== id));
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Carritos abandonados</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">
            Clientes que empezaron el checkout pero no completaron la orden. Contactalos por WhatsApp para cerrar la venta.
          </p>
        </div>
        <div className="flex gap-2 text-xs uppercase tracking-wider">
          {(['open', 'recovered', 'dismissed', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md border px-3 py-1.5 transition ${
                filter === f
                  ? 'border-tengu-ink bg-tengu-ink text-tengu-cream'
                  : 'border-tengu-dark/20 text-tengu-dark/70 hover:border-tengu-ink'
              }`}
            >
              {f === 'all' ? 'Todos' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : carts.length === 0 ? (
        <p className="mt-8 text-tengu-dark/60">
          {filter === 'open' ? 'No hay carritos abiertos. Buen trabajo 💪' : 'Sin carritos en esta vista.'}
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {carts.map((c) => {
            const wa = whatsappLink(c.customer_phone, c.customer_name, c);
            return (
              <article
                key={c.id}
                className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-tengu-dark/5"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-tengu-dark">
                        {c.customer_name || '(sin nombre)'}
                      </span>
                      <span className="text-tengu-dark/50">{c.customer_email}</span>
                      {c.customer_phone && (
                        <span className="text-tengu-dark/50">· {c.customer_phone}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-tengu-dark/60">
                      Actualizado {formatRelative(c.updated_at)} ·
                      {c.last_reminder_at && (
                        <span className="ml-1 text-tengu-ink">
                          recordatorio enviado {formatRelative(c.last_reminder_at)}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_BADGE[c.status]}`}
                  >
                    {STATUS_LABEL[c.status]}
                    {c.recovered_order_id && c.status === 'recovered' && ` · #${c.recovered_order_id}`}
                  </span>
                </header>

                <div className="mt-3 space-y-1 text-sm">
                  {c.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-tengu-dark/80">
                      <span>{it.product_name} {it.size_g}g × {it.quantity}</span>
                      <span>{formatCLP(it.unit_price_clp * it.quantity)}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between border-t border-tengu-dark/10 pt-2 font-semibold">
                    <span>Subtotal</span>
                    <span>{formatCLP(c.subtotal_clp)}</span>
                  </div>
                </div>

                {c.admin_notes && (
                  <p className="mt-2 rounded-md bg-tengu-dark/5 px-3 py-2 text-xs italic text-tengu-dark/60">
                    Nota: {c.admin_notes}
                  </p>
                )}

                {c.status === 'open' && (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-wider">
                    {wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener"
                        onClick={() => markReminded(c.id)}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
                      >
                        Mensaje WhatsApp
                      </a>
                    ) : (
                      <span className="rounded-md border border-tengu-dark/20 px-3 py-1.5 text-tengu-dark/40">
                        Sin teléfono
                      </span>
                    )}
                    <a
                      href={`mailto:${c.customer_email}?subject=${encodeURIComponent('Tu pedido en Tengu Roastery te espera')}&body=${encodeURIComponent(`Hola ${(c.customer_name || '').split(' ')[0]}, vi que dejaste un pedido en tu carrito. ¿Te ayudo a finalizarlo?`)}`}
                      className="rounded-md border border-tengu-dark/20 px-3 py-1.5 font-semibold hover:bg-tengu-dark/5"
                    >
                      Email
                    </a>
                    <button
                      onClick={() => dismiss(c.id)}
                      className="ml-auto rounded-md border border-tengu-dark/20 px-3 py-1.5 font-semibold text-tengu-dark/60 hover:bg-tengu-dark/5"
                    >
                      Descartar
                    </button>
                  </div>
                )}
                {c.status !== 'open' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => remove(c.id)}
                      className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 hover:bg-rose-50"
                    >
                      Borrar
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
