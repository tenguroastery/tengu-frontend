import { Link, useSearchParams } from 'react-router-dom';

const REASONS: Record<string, string> = {
  timeout: 'La pasarela expiró antes de completar el pago.',
  not_found: 'No encontramos la transacción asociada.',
  canceled: 'Cancelaste el proceso de pago.',
};

export default function CheckoutError() {
  const [params] = useSearchParams();
  const status = params.get('status') ?? 'unknown';
  const reason = REASONS[status] ?? 'Algo no salió bien con el pago.';

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-tengu-coral">No pudimos procesar el pago</h1>
      <p className="mt-3 text-tengu-dark/70">{reason}</p>
      <p className="mt-6 text-sm text-tengu-dark/50">
        Tu carrito sigue intacto. Puedes intentarlo nuevamente.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/carrito"
          className="rounded-md bg-tengu-mustard px-6 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
        >
          Volver al carrito
        </Link>
        <Link
          to="/tienda"
          className="rounded-md border border-tengu-dark/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:border-tengu-ink"
        >
          Ver tienda
        </Link>
      </div>
    </section>
  );
}
