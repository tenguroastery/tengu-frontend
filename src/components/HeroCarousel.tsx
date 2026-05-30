import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../lib/api';
import type { HeroSlide } from '../types';

type RenderSlide = {
  /** Nombre base (ej. 'hero-bg') → <picture> responsive de /public.
   *  Ruta/URL (ej. '/uploads/x.webp') → <img> directo. */
  image: string;
  alt: string;
  eyebrow: string;
  /** Vacío → usa el titular por defecto del hero (conserva el diseño). */
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
};

// Fallback si el backend aún no devolvió slides (o falló): los 3 originales.
const DEFAULT_SLIDES: RenderSlide[] = [
  { image: 'hero-bg', alt: 'Tostando café en lotes pequeños', eyebrow: 'Tostado en Chile', title: '', subtitle: '', ctaLabel: '', ctaUrl: '' },
  { image: 'hero-bag', alt: 'Bolsa de Marie Gorette Rwanda Natural', eyebrow: 'Origen único', title: '', subtitle: '', ctaLabel: '', ctaUrl: '' },
  { image: 'hero-atmosphere', alt: 'Aroma del café recién extraído', eyebrow: 'Café de especialidad', title: '', subtitle: '', ctaLabel: '', ctaUrl: '' },
];

const DEFAULT_TITLE = (
  <>
    Café que<br />
    <span className="text-tengu-mustard">cuenta</span> de dónde viene.
  </>
);
const DEFAULT_SUBTITLE =
  'Granos de Colombia, Perú y Rwanda. Tostados frescos, en pequeños lotes, para que cada taza honre el trabajo del productor.';

const ADVANCE_MS = 6500;

function toRenderSlide(s: HeroSlide): RenderSlide {
  return {
    image: s.image,
    alt: s.eyebrow || 'Tengu Roastery',
    eyebrow: s.eyebrow,
    title: s.title,
    subtitle: s.subtitle,
    ctaLabel: s.cta_label,
    ctaUrl: s.cta_url,
  };
}

export default function HeroCarousel() {
  const [slides, setSlides] = useState<RenderSlide[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .getHeroSlides()
      .then((data) => {
        if (mounted && data.length) {
          setSlides(data.map(toRenderSlide));
          setCurrent(0);
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const go = (delta: number) =>
    setCurrent((c) => (c + delta + slides.length) % slides.length);

  const safe = Math.min(current, slides.length - 1);
  const active = slides[safe];
  const hasCustomTitle = active.title.trim().length > 0;
  const ctaUrl = active.ctaUrl || '/tienda';
  const ctaLabel = active.ctaLabel || 'Comprar café';

  return (
    <section
      className="relative isolate overflow-hidden bg-tengu-dark text-tengu-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <SlideImage key={`${slide.image}-${i}`} slide={slide} active={i === safe} eager={i === 0} />
      ))}

      {/* Vignette suave para que el texto se lea, pero sin tapar la imagen */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-tengu-dark/85 via-tengu-dark/35 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-tengu-dark/70 to-transparent"
        aria-hidden="true"
      />

      {/* Contenido */}
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2 md:items-center md:py-36">
        <div className="relative">
          <p
            key={`eyebrow-${safe}`}
            className="animate-[fadeIn_500ms_ease-out] text-xs uppercase tracking-[0.5em] text-tengu-mustard"
          >
            {active.eyebrow || 'Tostado en Chile'}
          </p>
          <h1 key={`title-${safe}`} className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
            {hasCustomTitle ? active.title : DEFAULT_TITLE}
          </h1>
          {(active.subtitle || !hasCustomTitle) && (
            <p className="mt-7 max-w-md text-lg leading-relaxed text-tengu-cream/85">
              {active.subtitle || DEFAULT_SUBTITLE}
            </p>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Cta url={ctaUrl} label={ctaLabel} />
            {!hasCustomTitle && (
              <Link
                to="/sobre-nosotros"
                className="text-sm uppercase tracking-wider text-tengu-cream/70 hover:text-tengu-mustard"
              >
                Conoce nuestra historia
              </Link>
            )}
          </div>
        </div>

        {/* Lado derecho: un poco de aire */}
        <div className="relative hidden md:block" aria-hidden="true">
          <div className="absolute -right-10 top-10 h-72 w-72 rounded-full bg-tengu-mustard/15 blur-3xl" />
        </div>
      </div>

      {/* Flechas prev/next — solo si hay más de un slide */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-tengu-dark/40 text-tengu-cream ring-1 ring-tengu-cream/30 backdrop-blur transition hover:bg-tengu-dark/75 hover:text-tengu-mustard sm:left-5"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-tengu-dark/40 text-tengu-cream ring-1 ring-tengu-cream/30 backdrop-blur transition hover:bg-tengu-dark/75 hover:text-tengu-mustard sm:right-5"
          >
            <Chevron dir="right" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
          role="tablist"
          aria-label="Slides del hero"
        >
          {slides.map((slide, i) => (
            <button
              key={`dot-${slide.image}-${i}`}
              role="tab"
              aria-selected={i === safe}
              aria-label={`Mostrar imagen ${i + 1} de ${slides.length}`}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === safe ? 'w-10 bg-tengu-mustard' : 'w-2 bg-tengu-cream/30 hover:bg-tengu-cream/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SlideImage({ slide, active, eager }: { slide: RenderSlide; active: boolean; eager: boolean }) {
  const className = `pointer-events-none absolute inset-0 -z-10 transition-opacity duration-1000 ease-in-out ${
    active ? 'opacity-100' : 'opacity-0'
  }`;
  // Nombre base (sin '/' ni extensión) → set responsive servido desde /public.
  const isResponsiveBase = !slide.image.includes('/') && !slide.image.includes('.');

  if (isResponsiveBase) {
    const b = slide.image;
    return (
      <picture aria-hidden="true" className={className}>
        <source
          type="image/webp"
          srcSet={`/${b}-768w.webp 768w, /${b}-1280w.webp 1280w, /${b}.webp 1920w`}
          sizes="100vw"
        />
        <img
          src={`/${b}.jpg`}
          srcSet={`/${b}-768w.jpg 768w, /${b}-1280w.jpg 1280w, /${b}.jpg 1920w`}
          sizes="100vw"
          alt=""
          className="h-full w-full object-cover"
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'low'}
          decoding="async"
          width={1920}
          height={1080}
        />
      </picture>
    );
  }

  return (
    <div aria-hidden="true" className={className}>
      <img
        src={slide.image}
        alt=""
        className="h-full w-full object-cover"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'low'}
        decoding="async"
        width={1920}
        height={1080}
      />
    </div>
  );
}

function Cta({ url, label }: { url: string; label: string }) {
  const className =
    'inline-block rounded-md bg-tengu-mustard px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-tengu-dark transition hover:bg-tengu-cream';
  const isExternal = /^https?:\/\//i.test(url);
  if (isExternal) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {label} →
      </a>
    );
  }
  return (
    <Link to={url} className={className}>
      {label} →
    </Link>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}
