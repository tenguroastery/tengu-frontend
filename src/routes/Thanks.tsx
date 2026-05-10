import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { ecommerceEvents } from '../lib/analytics';
import { api, formatCLP, formatSize } from '../lib/api';
import { useCart } from '../store/cart';
import type { Order } from '../types';

const STATUS_COPY = {
  paid: {
    title: '¡Gracias por tu compra!',
    body: 'Tu pago fue confirmado. Te enviamos un email con los detalles.',
    color: 'text-tengu-ink',
  },
  pending: {
    title: 'Estamos procesando tu pedido',
    body: 'Confirmaremos por email cuando esté listo.',
    color: 'text-tengu-mustard',
  },
  failed: {
    title: 'Tu pago no se pudo procesar',
    body: 'No se realizó cargo. Puedes intentar de nuevo o usar otro medio.',
    color: 'text-tengu-coral',
  },
  canceled: {
    title: 'Cancelaste el pago',
    body: 'No se realizó cargo. Tu carrito sigue intacto si quieres volver.',
    color: 'text-tengu-coral',
  },
};

export default function Thanks() {
  const { orderId } = useParams<{ orderId: string }>();
  const [params] = useSearchParams();
  const queryStatus = params.get('status');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearCart = useCart((s) => s.clear);

  useEffect(() => {
    if (!orderId) return;
    api.getOrder(Number(orderId))
      .then((o) => {
        setOrder(o);
        if (o.status === 'paid') {
          clearCart();
          ecommerceEvents.purchase(
            o.id,
            o.items.map((i) => ({
              item_id: i.product_slug,
              item_name: i.product_name,
              item_variant: `${i.size_g}g`,
              price: i.unit_price_clp,
              quantity: i.quantity,
            })),
            o.total_clp,
          );
        }
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-tengu-dark/60">Cargando tu pedido…</p>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-tengu-coral">No encontramos esa orden</h1>
        <p className="mt-3 text-tengu-dark/60">{error}</p>
        <Link to="/tienda" className="mt-6 inline-block text-tengu-ink hover:underline">← Volver a la tienda</Link>
      </div>
    );
  }

  const effectiveStatus = (queryStatus === 'paid' || queryStatus === 'failed' || queryStatus === 'canceled')
    ? queryStatus
    : order.status;
  const copy = STATUS_COPY[effectiveStatus as keyof typeof STATUS_COPY] ?? STATUS_COPY.pending;

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-tengu-dark/50">Pedido #{order.id}</p>
      <h1 className={`mt-3 font-display text-4xl ${copy.color}`}>{copy.title}</h1>
      <p className="mt-2 text-tengu-dark/70">{copy.body}</p>

      {order.status === 'paid' && order.webpay_authorization_code && (
        <p className="mt-3 text-xs text-tengu-dark/50">
          Código de autorización Webpay: <code className="font-mono">{order.webpay_authorization_code}</code>
        </p>
      )}

      <div className="mt-10 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg">Resumen</h2>
        <ul className="mt-4 divide-y divide-tengu-dark/10">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span className="flex-1">
                {item.product_name}
                <span className="ml-2 text-xs text-tengu-dark/60">
                  {formatSize(item.size_g)} · {item.quantity}x
                </span>
              </span>
              <span className="font-semibold">{formatCLP(item.subtotal_clp)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-tengu-dark/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatCLP(order.subtotal_clp)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Envío</dt>
            <dd>{order.shipping_cost_clp === 0 ? 'Gratis' : formatCLP(order.shipping_cost_clp)}</dd>
          </div>
          <div className="flex justify-between border-t border-tengu-dark/10 pt-2 font-semibold">
            <dt>Total</dt>
            <dd className="font-display text-tengu-ink">{formatCLP(order.total_clp)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid gap-4 rounded-xl bg-white p-6 shadow-sm sm:grid-cols-2 sm:text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Cliente</p>
          <p className="mt-1">{order.customer_name}</p>
          <p className="text-tengu-dark/70">{order.customer_email}</p>
          <p className="text-tengu-dark/70">{order.customer_phone}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-tengu-dark/60">Despacho</p>
          {order.shipping_method === 'pickup' ? (
            <p className="mt-1">Retiro en local — coordinaremos por WhatsApp</p>
          ) : (
            <>
              <p className="mt-1">{order.shipping_address}</p>
              <p className="text-tengu-dark/70">{order.shipping_comuna}, {order.shipping_region}</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/tienda"
          className="rounded-md bg-tengu-ink px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark"
        >
          Seguir comprando
        </Link>
        {(effectiveStatus === 'failed' || effectiveStatus === 'canceled') && (
          <Link
            to="/carrito"
            className="rounded-md border border-tengu-dark/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:border-tengu-ink"
          >
            Volver al carrito
          </Link>
        )}
      </div>
    </section>
  );
}
