import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import SafeImg from '../components/SafeImg';
import { api, formatCLP, formatSize } from '../lib/api';
import { selectCartSubtotal, useCart } from '../store/cart';
import { useSiteSettings } from '../store/site';

export default function Cart() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectCartSubtotal);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const reconcile = useCart((s) => s.reconcile);
  const siteSettings = useSiteSettings();
  const [reconcileNotice, setReconcileNotice] = useState<string | null>(null);

  // Al montar /carrito, refrescamos precios y removemos items huérfanos
  // (producto despublicado o variante eliminada). Si algo cambió, lo
  // mostramos al cliente como aviso no-bloqueante.
  useEffect(() => {
    let cancelled = false;
    api.listProducts()
      .then((fresh) => {
        if (cancelled) return;
        const report = reconcile(fresh);
        const parts: string[] = [];
        if (report.removed.length) {
          parts.push(`Sacamos ${report.removed.join(', ')} (ya no está disponible)`);
        }
        if (report.priceUpdated.length) {
          parts.push(`Actualizamos precios: ${report.priceUpdated.join(', ')}`);
        }
        if (parts.length) setReconcileNotice(parts.join('. ') + '.');
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [reconcile]);

  const freeShippingThreshold = siteSettings?.free_shipping_threshold_clp ?? 0;
  const remaining = freeShippingThreshold > 0 ? freeShippingThreshold - subtotal : 0;
  const progressPct =
    freeShippingThreshold > 0
      ? Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
      : 0;

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Tu carrito está vacío</h1>
        <p className="mt-3 text-tengu-dark/60">Vamos a llenarlo con un buen café.</p>
        <Link
          to="/tienda"
          className="mt-8 inline-block rounded-md bg-tengu-mustard px-8 py-3 font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
        >
          Ir a la tienda
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl">Tu carrito</h1>
      <p className="mt-1 text-sm text-tengu-dark/60">
        {items.length} producto{items.length === 1 ? '' : 's'}
      </p>

      {reconcileNotice && (
        <div className="mt-4 rounded-md border border-tengu-mustard/40 bg-tengu-mustard/10 p-3 text-sm text-tengu-dark/80">
          {reconcileNotice}
        </div>
      )}

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-tengu-dark/10">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 py-4">
              <Link to={`/cafe/${item.productSlug}`} className="flex-shrink-0">
                <SafeImg
                  src={item.productImage ? `/uploads/${item.productImage}` : undefined}
                  alt={item.productName}
                  className="h-24 w-20 rounded-md object-cover"
                  width={80}
                  height={96}
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/cafe/${item.productSlug}`}
                    className="font-semibold leading-tight hover:text-tengu-ink"
                  >
                    {item.productName}
                  </Link>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-xs uppercase tracking-wider text-tengu-dark/50 hover:text-tengu-coral"
                  >
                    Quitar
                  </button>
                </div>
                <p className="text-sm text-tengu-dark/60">Formato: {formatSize(item.sizeG)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-md border border-tengu-dark/20 bg-white">
                    <button
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      className="px-3 py-1.5 text-tengu-dark/70 hover:text-tengu-dark"
                      aria-label="Disminuir"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.key, Math.min(99, item.quantity + 1))}
                      disabled={item.quantity >= 99}
                      className="px-3 py-1.5 text-tengu-dark/70 hover:text-tengu-dark disabled:opacity-30"
                      aria-label="Aumentar"
                      title={item.quantity >= 99 ? 'Máximo 99 por formato' : undefined}
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold text-tengu-ink">
                    {formatCLP(item.unitPriceClp * item.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl">Resumen</h2>

          {freeShippingThreshold > 0 && (
            <div className="mt-3 rounded-md bg-tengu-cream p-3 text-xs">
              {remaining <= 0 ? (
                <p className="font-semibold text-tengu-ink">🎉 Envío gratis aplicado</p>
              ) : (
                <>
                  <p>
                    Te faltan <strong>{formatCLP(remaining)}</strong> para envío gratis.
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-tengu-dark/10">
                    <div
                      className="h-full bg-tengu-ink transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-semibold">{formatCLP(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-tengu-dark/60">
              <dt>Envío</dt>
              <dd>Calculado en checkout</dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-tengu-dark/10 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm uppercase tracking-wider text-tengu-dark/60">Total</span>
              <span className="font-display text-2xl text-tengu-ink">{formatCLP(subtotal)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 block w-full rounded-md bg-tengu-mustard px-4 py-3 text-center font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
          >
            Ir a pagar
          </Link>
          <button
            onClick={() => clear()}
            className="mt-6 w-full text-xs uppercase tracking-wider text-tengu-dark/50 hover:text-tengu-coral"
          >
            Vaciar carrito
          </button>
        </aside>
      </div>
    </section>
  );
}
