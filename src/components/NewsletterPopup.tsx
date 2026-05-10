import { useEffect, useState } from 'react';

import NewsletterForm from './NewsletterForm';

const STORAGE_KEY = 'tengu-newsletter-popup';
const SHOW_AFTER_MS = 8000;

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === 'dismissed') return;

    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-tengu-dark/60 px-4 pb-4 backdrop-blur-sm sm:items-center sm:pb-0"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-tengu-dark text-tengu-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 text-tengu-cream/60 transition hover:text-tengu-cream"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="grid sm:grid-cols-[1fr_auto]">
          <div className="p-8 sm:pr-4">
            <p className="text-xs uppercase tracking-[0.3em] text-tengu-mustard">Tengu Roastery</p>
            <h2 className="mt-3 font-display text-3xl leading-tight">
              -10% en tu primera<br />compra
            </h2>
            <p className="mt-3 text-sm text-tengu-cream/80">
              Suscríbete y recibe novedades de nuevos orígenes, tueste de la semana y guías de
              preparación. Te avisamos primero.
            </p>
            <div className="mt-5">
              <NewsletterForm variant="dark" buttonLabel="Suscribirme" />
            </div>
            <button
              onClick={dismiss}
              className="mt-3 text-xs uppercase tracking-wider text-tengu-cream/40 hover:text-tengu-cream/70"
            >
              No, gracias
            </button>
          </div>

          <div className="hidden bg-tengu-ink/30 sm:block">
            <img
              src="/uploads/rwanda-marie-gorette-natural.jpg"
              alt=""
              className="h-full w-40 object-cover opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
