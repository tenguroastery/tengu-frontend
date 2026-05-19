import { Link } from 'react-router-dom';

import { useSiteSettings } from '../../store/site';

/** Pantalla "Próximamente" si las cuentas están deshabilitadas desde
 * /admin/settings. Si están activas (customer_accounts_enabled=true), este
 * componente debería redirigir al flujo real de magic link — todavía pendiente
 * de implementación, mientras tanto sigue mostrando "próximamente" con un
 * cartel un poco distinto para no confundir al admin. */
export default function CuentaLogin() {
  const settings = useSiteSettings();
  const accountsEnabled = settings?.customer_accounts_enabled === true;

  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="text-5xl">☕</p>
      <h1 className="mt-6 font-display text-3xl text-tengu-ink">Cuentas de cliente</h1>
      <p className="mt-3 inline-block rounded-full bg-tengu-mustard px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-tengu-dark">
        {accountsEnabled ? 'En desarrollo' : 'Próximamente'}
      </p>
      <p className="mt-6 text-sm text-tengu-dark/70">
        {accountsEnabled
          ? 'El flujo de login con magic link aún no está terminado. Mientras tanto, puedes comprar como invitado.'
          : 'Estamos terminando el flujo de cuenta y suscripción. Mientras tanto, puedes comprar como invitado — tus datos quedan guardados igual y la próxima vez coordinamos por WhatsApp.'}
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
          ¿Necesitas tu historial? Escríbenos por WhatsApp →
        </a>
      </div>
    </section>
  );
}
