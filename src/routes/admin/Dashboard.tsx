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
  const totalSold = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_clp, 0);

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-tengu-dark/60">Resumen rápido de Tengu Roastery</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Productos" value={products.length} accent="ink" />
        <Stat label="Pedidos totales" value={orders.length} accent="mustard" />
        <Stat label="Ingresos confirmados" value={formatCLP(totalSold)} accent="ink" small />
        <Stat label="Suscriptores" value={subs.length} accent="mustard" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
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

function Stat({ label, value, accent, small = false }: { label: string; value: string | number; accent: 'ink' | 'mustard'; small?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-tengu-dark/60">{label}</p>
      <p className={`mt-2 font-display ${small ? 'text-2xl' : 'text-3xl'} ${accent === 'ink' ? 'text-tengu-ink' : 'text-tengu-mustard'}`}>
        {value}
      </p>
    </div>
  );
}
