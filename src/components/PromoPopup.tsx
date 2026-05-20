import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useSiteSettings } from '../store/site';

const COOKIE_NAME = 'tengu_promo_dismissed';
const MIN_DWELL_MS = 15_000;
const SCROLL_THRESHOLD = 0.4;

function setDismissCookie(days: number) {
  const expires = new Date(Date.now() + Math.max(1, days) * 24 * 60 * 60 * 1000);
  document.cookie = `${COOKIE_NAME}=1; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function hasDismissCookie() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
}

function notExpired(iso: string | null): boolean {
  if (!iso) return true;
  // promo_expires_at = 'YYYY-MM-DD' inclusive: hasta el final de ese día.
  const expiresEnd = new Date(`${iso}T23:59:59`);
  return Date.now() <= expiresEnd.getTime();
}

export default function PromoPopup() {
  const settings = useSiteSettings();
  const [visible, setVisible] = useState(false);

  const enabled = !!settings?.promo_enabled && notExpired(settings?.promo_expires_at ?? null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (hasDismissCookie()) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const start = Date.now();
    let triggered = false;

    const show = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? scrolled / max : 0;
      const dwellOk = Date.now() - start >= MIN_DWELL_MS;
      if (pct >= SCROLL_THRESHOLD && dwellOk) show();
    };

    if (isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      document.addEventListener('mouseleave', handleMouseLeave);
      const fallback = setTimeout(show, 45_000);
      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
        clearTimeout(fallback);
      };
    }
  }, [enabled]);

  if (!enabled || !visible || !settings) return null;

  const dismiss = () => {
    setDismissCookie(settings.promo_dismiss_days || 7);
    setVisible(false);
  };

  const isExternal = /^https?:\/\//i.test(settings.promo_cta_url);
  const ctaLabel = settings.promo_cta_label || 'Ver oferta';

  const ctaButton = (
    <span className="mt-5 inline-block rounded-md bg-tengu-mustard px-6 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white">
      {ctaLabel}
    </span>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-tengu-dark/70 px-4 pb-4 backdrop-blur-sm sm:items-center sm:pb-0"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-title"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-tengu-dark text-tengu-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 z-10 text-tengu-cream/60 transition hover:text-tengu-cream"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="grid sm:grid-cols-[1fr_auto]">
          <div className="p-8 sm:pr-4">
            {settings.promo_badge && (
              <p className="text-xs uppercase tracking-[0.3em] text-tengu-mustard">
                {settings.promo_badge}
              </p>
            )}
            <h2
              id="promo-popup-title"
              className="mt-3 font-display text-3xl leading-tight"
            >
              {settings.promo_title || '¡Oferta especial!'}
            </h2>
            {settings.promo_subtitle && (
              <p className="mt-2 text-sm text-tengu-mustard">
                {settings.promo_subtitle}
              </p>
            )}
            {settings.promo_body && (
              <p className="mt-3 text-sm text-tengu-cream/80 whitespace-pre-line">
                {settings.promo_body}
              </p>
            )}
            {isExternal ? (
              <a
                href={settings.promo_cta_url}
                target="_blank"
                rel="noopener"
                onClick={dismiss}
              >
                {ctaButton}
              </a>
            ) : (
              <Link to={settings.promo_cta_url || '/tienda'} onClick={dismiss}>
                {ctaButton}
              </Link>
            )}
            <button
              onClick={dismiss}
              className="ml-4 mt-5 text-xs uppercase tracking-wider text-tengu-cream/50 hover:text-tengu-cream/80"
            >
              No, gracias
            </button>
          </div>

          {settings.promo_image && (
            <div className="hidden bg-tengu-ink/30 sm:block">
              <img
                src={settings.promo_image}
                alt=""
                className="h-full w-40 object-cover opacity-90"
                width={160}
                height={400}
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
