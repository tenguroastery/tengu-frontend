import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { adminApi, type AdminProduct, type AdminSubscription } from '../../lib/admin-api';
import { formatCLP } from '../../lib/api';
import type { Order } from '../../types';

export default function AdminDashboard() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subs, setSubs] = useState<AdminSubscription[]>([]);

  useEffect(() => {
    adminApi.listProducts().then(setProducts).catch(console.error);
    adminApi.listOrders().then(setOrders).catch(console.error);
    adminApi.listSubscriptions().then(setSubs).catch(console.error);
  }, []);

  const lowStock = products
    .flatMap((p) => p.variants.map((v) => ({ product: p, variant: v })))
    .filter(({ variant }) => variant.stock_qty <= 5);

  const recent = orders.slice(0, 5);
  const PAID = new Set(['paid', 'shipped', 'delivered']);
  const paidOrders = orders.filter((o) => PAID.has(o.status));
  const totalSold = paidOrders.reduce((sum, o) => sum + o.total_clp, 0);

  // Ventas del mes en curso (por fecha de pago, o creación si falta).
  const now = new Date();
  const inThisMonth = (iso: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };
  const monthPaid = paidOrders.filter((o) => inThisMonth(o.paid_at ?? o.created_at));
  const revenueMonth = monthPaid.reduce((sum, o) => sum + o.total_clp, 0);

  // Top productos por unidades vendidas (pedidos pagados).
  const byProduct = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of paidOrders) {
    for (const it of o.items) {
      const cur = byProduct.get(it.product_name) ?? { name: it.product_name, qty: 0, revenue: 0 };
      cur.qty += it.quantity;
      cur.revenue += it.subtotal_clp;
      byProduct.set(it.product_name, cur);
    }
  }
  const topProducts = [...byProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const maxQty = topProducts[0]?.qty ?? 1;

  // Conteo por estado.
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const STATUS_ES: Record<string, string> = {
    pending: 'Pendientes', paid: 'Pagados', shipped: 'Enviados',
    delivered: 'Entregados', failed: 'Fallados', canceled: 'Cancelados',
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-tengu-dark/60">Resumen rápido de Tengu Roastery</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Ventas del mes" value={formatCLP(revenueMonth)} accent="mustard" small sub={`${monthPaid.length} pedido${monthPaid.length === 1 ? '' : 's'}`} />
        <Stat label="Ingresos confirmados (total)" value={formatCLP(totalSold)} accent="ink" small />
        <Stat label="Pedidos totales" value={orders.length} accent="mustard" />
        <Stat label="Productos · Suscriptores" value={`${products.length} · ${subs.length}`} accent="ink" small />
      </div>

      {/* Conteo por estado */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([st, n]) => (
          <span key={st} className="rounded-full bg-white px-3 py-1 text-xs shadow-sm">
            <span className="text-tengu-dark/60">{STATUS_ES[st] ?? st}:</span>{' '}
            <span className="font-semibold">{n}</span>
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-display text-lg">Más vendidos (pedidos pagados)</h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-tengu-dark/60">Aún no hay ventas pagadas.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topProducts.map((p) => (
                <li key={p.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-tengu-dark/60">{p.qty} u. · {formatCLP(p.revenue)}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-tengu-dark/10">
                    <div className="h-full bg-tengu-mustard" style={{ width: `${Math.round((p.qty / maxQty) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <h2 className="font-display text-lg">Stock bajo (≤ 5 unidades)</h2>
            <Link to="/admin/products" className="text-xs uppercase tracking-wider text-tengu-ink hover:underline">
              Ver todos →
            </Link>
          </header>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-tengu-dark/60">Todo OK 🎉</p>
          ) : (
            <ul className="mt-4 divide-y divide-tengu-dark/10 text-sm">
              {lowStock.map(({ product, variant }) => (
                <li key={variant.id} className="flex items-center justify-between py-2">
                  <span>{product.name} · {variant.size_g >= 1000 ? `${variant.size_g / 1000} kg` : `${variant.size_g} g`}</span>
                  <span className={variant.stock_qty === 0 ? 'font-bold text-tengu-coral' : 'text-tengu-mustard'}>
                    {variant.stock_qty} u.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <h2 className="font-display text-lg">Últimos pedidos</h2>
            <Link to="/admin/orders" className="text-xs uppercase tracking-wider text-tengu-ink hover:underline">
              Ver todos →
            </Link>
          </header>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-tengu-dark/60">Aún no hay pedidos.</p>
          ) : (
            <ul className="mt-4 divide-y divide-tengu-dark/10 text-sm">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2">
                  <span>#{o.id} · {o.customer_name} · <em className="text-xs uppercase tracking-wider text-tengu-dark/50">{o.status}</em></span>
                  <span className="font-semibold">{formatCLP(o.total_clp)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, small = false, sub }: { label: string; value: string | number; accent: 'ink' | 'mustard'; small?: boolean; sub?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-tengu-dark/60">{label}</p>
      <p className={`mt-2 font-display ${small ? 'text-2xl' : 'text-3xl'} ${accent === 'ink' ? 'text-tengu-ink' : 'text-tengu-mustard'}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-tengu-dark/50">{sub}</p>}
    </div>
  );
}
