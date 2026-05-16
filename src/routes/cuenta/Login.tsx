import { Link } from 'react-router-dom';

/** Pantalla "Próximamente" mientras decidimos provider de auth (Google OAuth
 * o magic link con SMTP). El sistema de cuenta + dashboard ya existe en
 * Callback.tsx + Dashboard.tsx, solo está oculto. Para reactivar, restaura
 * el componente desde git history. */
export default function CuentaLogin() {
  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="text-5xl">☕</p>
      <h1 className="mt-6 font-display text-3xl text-tengu-ink">Cuentas de cliente</h1>
      <p className="mt-3 inline-block rounded-full bg-tengu-mustard px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-tengu-dark">
        Próximamente
      </p>
      <p className="mt-6 text-sm text-tengu-dark/70">
        Estamos terminando el flujo de cuenta y suscripción. Mientras tanto, podés
        comprar como invitado — tus datos quedan guardados igual y la próxima vez
        coordinamos por WhatsApp.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          to="/tienda"
          className="rounded-md bg-tengu-ink px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark"
        >
          Ir a la tienda
        </Link>
        <a
          href="https://wa.me/56950013366"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-tengu-ink hover:underline"
        >
          ¿Necesitas tu historial? Escribinos por WhatsApp →
        </a>
      </div>
    </section>
  );
}
