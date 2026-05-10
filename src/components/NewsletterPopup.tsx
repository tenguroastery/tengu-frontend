import { useEffect, useState } from 'react';

import NewsletterForm from './NewsletterForm';

const STORAGE_KEY = 'tengu-newsletter-popup';
/** Tiempo mínimo antes de poder mostrar el popup en mobile (ms). */
const MIN_DWELL_MS = 30_000;
/** % de scroll vertical mínimo en mobile para gatillar. */
const SCROLL_THRESHOLD = 0.6;

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === 'dismissed') return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const start = Date.now();
    let triggered = false;

    const show = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
    };

    // Desktop: exit-intent (cursor sale por arriba del viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    // Mobile: scroll 60% Y al menos 30s en el sitio
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? scrolled / max : 0;
      const dwellOk = Date.now() - start >= MIN_DWELL_MS;
      if (pct >= SCROLL_THRESHOLD && dwellOk) show();
    };

    if (isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      document.addEventListener('mouseleave', handleMouseLeave);
      // Fallback para sesiones largas en desktop sin exit-intent
      const fallback = setTimeout(show, 60_000);
      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
        clearTimeout(fallback);
      };
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
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
            <h2 id="newsletter-popup-title" className="mt-3 font-display text-3xl leading-tight">
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
              width={160}
              height={400}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
