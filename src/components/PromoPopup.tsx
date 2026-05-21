import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useSiteSettings } from '../store/site';

const COOKIE_NAME = 'tengu_promo_dismissed';
// Fallback en exit-intent si nunca dispara (sesiones largas sin mouse leave)
const EXIT_FALLBACK_MS = 60_000;
const MOBILE_SCROLL_THRESHOLD = 0.4;
const MOBILE_DWELL_MS = 15_000;

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
  return Date.now() <= new Date(`${iso}T23:59:59`).getTime();
}

export default function PromoPopup() {
  const settings = useSiteSettings();
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const enabled = !!settings?.promo_enabled && notExpired(settings?.promo_expires_at ?? null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (hasDismissCookie()) return;

    const trigger = settings?.promo_trigger ?? 'exit';
    const delayMs = (settings?.promo_delay_seconds ?? 10) * 1000;
    let triggered = false;

    const show = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
      // 50ms para que la transición CSS se inicie desde scale-95/opacity-0 → 100
      setTimeout(() => setAnimateIn(true), 50);
    };

    if (trigger === 'immediate') {
      // Pequeño delay (500ms) para no chocar con la carga inicial — más profesional
      const t = setTimeout(show, 500);
      return () => clearTimeout(t);
    }

    if (trigger === 'delay') {
      const t = setTimeout(show, delayMs);
      return () => clearTimeout(t);
    }

    if (trigger === 'scroll') {
      const handleScroll = () => {
        const scrolled = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? scrolled / max : 0;
        if (pct >= 0.25) show();
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // 'exit' (default): desktop = exit-intent + fallback; mobile = scroll + dwell.
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const start = Date.now();
    if (isMobile) {
      const handleScroll = () => {
        const scrolled = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? scrolled / max : 0;
        if (pct >= MOBILE_SCROLL_THRESHOLD && Date.now() - start >= MOBILE_DWELL_MS) show();
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) show();
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      const fallback = setTimeout(show, EXIT_FALLBACK_MS);
      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
        clearTimeout(fallback);
      };
    }
  }, [enabled, settings?.promo_trigger, settings?.promo_delay_seconds]);

  if (!enabled || !visible || !settings) return null;

  const dismiss = () => {
    setDismissCookie(settings.promo_dismiss_days || 7);
    setVisible(false);
  };

  const isExternal = /^https?:\/\//i.test(settings.promo_cta_url);
  const ctaLabel = settings.promo_cta_label || 'Ver oferta';

  const ctaButton = (
    <span className="relative inline-flex overflow-hidden rounded-md bg-tengu-mustard px-6 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark shadow-lg shadow-tengu-mustard/30 transition hover:bg-tengu-coral hover:text-white">
      {ctaLabel}
      <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-1000 group-hover:translate-x-full" />
    </span>
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-tengu-dark/70 px-4 pb-4 backdrop-blur-sm transition-opacity duration-300 sm:items-center sm:pb-0 ${
        animateIn ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-title"
    >
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-2xl bg-tengu-dark text-tengu-cream shadow-2xl transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
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
              <p className="inline-block animate-pulse text-xs uppercase tracking-[0.3em] text-tengu-mustard">
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
              <p className="mt-2 text-sm text-tengu-mustard">{settings.promo_subtitle}</p>
            )}
            {settings.promo_body && (
              <p className="mt-3 whitespace-pre-line text-sm text-tengu-cream/80">
                {settings.promo_body}
              </p>
            )}
            {settings.promo_show_countdown && settings.promo_expires_at && (
              <Countdown isoEnd={settings.promo_expires_at} />
            )}
            <div className="group mt-5 inline-block">
              {isExternal ? (
                <a href={settings.promo_cta_url} target="_blank" rel="noopener" onClick={dismiss}>
                  {ctaButton}
                </a>
              ) : (
                <Link to={settings.promo_cta_url || '/tienda'} onClick={dismiss}>
                  {ctaButton}
                </Link>
              )}
            </div>
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

function Countdown({ isoEnd }: { isoEnd: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const endMs = new Date(`${isoEnd}T23:59:59`).getTime();
  const diff = Math.max(0, endMs - now);
  if (diff === 0) return null;

  const days = Math.floor(diff / (24 * 3600 * 1000));
  const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
  const minutes = Math.floor((diff % (3600 * 1000)) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center rounded-md bg-tengu-coral/20 px-3 py-2">
      <span className="font-display text-2xl leading-none text-tengu-mustard">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-tengu-cream/60">
        {label}
      </span>
    </div>
  );

  return (
    <div className="mt-4 flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-tengu-cream/50">Termina en</span>
      <div className="flex gap-1.5">
        {days > 0 && <Box value={days} label="días" />}
        <Box value={hours} label="hrs" />
        <Box value={minutes} label="min" />
        <Box value={seconds} label="seg" />
      </div>
    </div>
  );
}
