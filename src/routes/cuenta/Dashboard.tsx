import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { api, formatCLP } from '../../lib/api';
import { useAuth } from '../../store/auth';
import type { Order } from '../../types';

export default function CuentaDashboard() {
  const navigate = useNavigate();
  const jwt = useAuth((s) => s.jwt);
  const customer = useAuth((s) => s.customer);
  const setCustomer = useAuth((s) => s.setCustomer);
  const logout = useAuth((s) => s.logout);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    rut: '',
    shipping_address: '',
    shipping_comuna: '',
    shipping_region: '',
    shipping_notes: '',
  });

  // Sync form con customer cuando carga
  useEffect(() => {
    if (!customer) return;
    setForm({
      name: customer.name ?? '',
      phone: customer.phone ?? '',
      rut: customer.rut ?? '',
      shipping_address: customer.shipping_address ?? '',
      shipping_comuna: customer.shipping_comuna ?? '',
      shipping_region: customer.shipping_region ?? '',
      shipping_notes: customer.shipping_notes ?? '',
    });
  }, [customer]);

  // Cargar customer + pedidos
  useEffect(() => {
    if (!jwt) return;
    (async () => {
      try {
        const [me, list] = await Promise.all([api.getMe(jwt), api.listMyOrders(jwt)]);
        setCustomer(me);
        setOrders(list);
      } catch (err) {
        // Si el JWT venció, cerrar sesión y mandar a login
        if (String(err).includes('401')) {
          logout();
          navigate('/cuenta/login');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [jwt, setCustomer, logout, navigate]);

  if (!jwt) return <Navigate to="/cuenta/login" replace />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await api.patchMe(jwt, form);
      setCustomer(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No pudimos guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-tengu-dark/50">Mi cuenta</p>
          <h1 className="mt-1 font-display text-3xl">Hola{customer?.name ? `, ${customer.name.split(' ')[0]}` : ''}</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">{customer?.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-tengu-dark/60 hover:text-tengu-coral hover:underline"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSave} className="space-y-6">
          <fieldset className="rounded-xl bg-white p-6 shadow-sm">
            <legend className="px-2 font-display text-lg">Datos de contacto</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo">
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Teléfono">
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+56 9 XXXX XXXX" className={inputCls} />
              </Field>
              <Field label="RUT">
                <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} placeholder="11.111.111-1" className={inputCls} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="rounded-xl bg-white p-6 shadow-sm">
            <legend className="px-2 font-display text-lg">Dirección de despacho</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Dirección">
                  <input type="text" value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} placeholder="Av. Providencia 1234, dpto 56" className={inputCls} />
                </Field>
              </div>
              <Field label="Comuna">
                <input type="text" value={form.shipping_comuna} onChange={(e) => setForm({ ...form, shipping_comuna: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Región">
                <input type="text" value={form.shipping_region} onChange={(e) => setForm({ ...form, shipping_region: e.target.value })} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Notas para el repartidor (opcional)">
                  <textarea value={form.shipping_notes} onChange={(e) => setForm({ ...form, shipping_notes: e.target.value })} rows={2} className={inputCls} />
                </Field>
              </div>
            </div>
          </fieldset>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-tengu-ink px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            {savedAt && !saveError && Date.now() - savedAt < 5000 && (
              <span className="text-sm text-tengu-ink">✓ Guardado</span>
            )}
            {saveError && (
              <span className="text-sm text-tengu-coral">{saveError}</span>
            )}
          </div>
        </form>

        <aside className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg">Mis pedidos</h2>
          {loading ? (
            <p className="mt-4 text-sm text-tengu-dark/60">Cargando…</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-sm text-tengu-dark/60">
              Aún no tienes pedidos. <Link to="/tienda" className="text-tengu-ink hover:underline">Mira el catálogo</Link>.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-tengu-dark/10">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    to={o.access_token ? `/thanks/${o.id}?token=${encodeURIComponent(o.access_token)}` : `/thanks/${o.id}`}
                    className="block py-3 transition hover:bg-tengu-cream/40"
                  >
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="font-mono">#{o.id}</span>
                      <span className="font-semibold">{formatCLP(o.total_clp)}</span>
                    </div>
                    <div className="mt-1 flex justify-between gap-2 text-xs text-tengu-dark/60">
                      <span>{new Date(o.created_at).toLocaleDateString('es-CL')}</span>
                      <span className={statusColor(o.status)}>{statusLabel(o.status)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}

const inputCls = 'w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm focus:border-tengu-ink focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-tengu-dark/70">{label}</span>
      {children}
    </label>
  );
}

function statusLabel(s: string) {
  return {
    pending: 'Pendiente',
    paid: 'Pagado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    failed: 'Falló',
    canceled: 'Cancelado',
  }[s] ?? s;
}

function statusColor(s: string) {
  if (s === 'paid' || s === 'delivered') return 'text-tengu-ink';
  if (s === 'shipped') return 'text-tengu-mustard';
  if (s === 'failed' || s === 'canceled') return 'text-tengu-coral';
  return 'text-tengu-dark/60';
}
