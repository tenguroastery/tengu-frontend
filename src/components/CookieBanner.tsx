import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { setConsent } from '../lib/analytics';

const COOKIE_KEY = 'tengu-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  const choose = (value: 'accepted' | 'rejected') => {
    setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-tengu-dark/10 bg-white p-4 shadow-2xl sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:rounded-xl sm:border"
    >
      <p className="text-sm text-tengu-dark">
        Usamos cookies propias y de terceros para entender cómo navegas y mejorar la tienda.
        Más detalles en nuestra{' '}
        <Link to="/privacidad" className="underline hover:text-tengu-ink">
          política de privacidad
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => choose('accepted')}
          className="flex-1 rounded-md bg-tengu-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark"
        >
          Aceptar
        </button>
        <button
          onClick={() => choose('rejected')}
          className="flex-1 rounded-md border border-tengu-dark/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-tengu-dark/70 transition hover:border-tengu-ink"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
