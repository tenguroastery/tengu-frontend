import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Slide = {
  src: string;
  alt: string;
  /** Texto pequeño rotativo opcional. Si no se pasa, se mantiene constante. */
  eyebrow?: string;
};

const SLIDES: Slide[] = [
  { src: 'hero-bg', alt: 'Tostando café en lotes pequeños', eyebrow: 'Tostado en Chile' },
  { src: 'hero-bag', alt: 'Bolsa de Marie Gorette Rwanda Natural', eyebrow: 'Origen único' },
  { src: 'hero-atmosphere', alt: 'Aroma del café recién extraído', eyebrow: 'Café de especialidad' },
];

const ADVANCE_MS = 6500;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const go = (delta: number) =>
    setCurrent((c) => (c + delta + SLIDES.length) % SLIDES.length);

  return (
    <section
      className="relative isolate overflow-hidden bg-tengu-dark text-tengu-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <picture
          key={slide.src}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-1000 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source
            type="image/webp"
            srcSet={`/${slide.src}-768w.webp 768w, /${slide.src}-1280w.webp 1280w, /${slide.src}.webp 1920w`}
            sizes="100vw"
          />
          <img
            src={`/${slide.src}.jpg`}
            srcSet={`/${slide.src}-768w.jpg 768w, /${slide.src}-1280w.jpg 1280w, /${slide.src}.jpg 1920w`}
            sizes="100vw"
            alt=""
            className="h-full w-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'low'}
            decoding="async"
            width={1920}
            height={1080}
          />
        </picture>
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
            key={current}
            className="animate-[fadeIn_500ms_ease-out] text-xs uppercase tracking-[0.5em] text-tengu-mustard"
          >
            {SLIDES[current].eyebrow ?? 'Tostado en Chile'}
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
            Café que<br />
            <span className="text-tengu-mustard">cuenta</span> de dónde viene.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-tengu-cream/85">
            Granos de Colombia, Perú y Rwanda. Tostados frescos, en pequeños lotes, para que cada
            taza honre el trabajo del productor.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/tienda"
              className="inline-block rounded-md bg-tengu-mustard px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-tengu-dark transition hover:bg-tengu-cream"
            >
              Comprar café →
            </Link>
            <Link
              to="/sobre-nosotros"
              className="text-sm uppercase tracking-wider text-tengu-cream/70 hover:text-tengu-mustard"
            >
              Conoce nuestra historia
            </Link>
          </div>
        </div>

        {/* Lado derecho: indicadores y un poco de aire */}
        <div className="relative hidden md:block" aria-hidden="true">
          <div className="absolute -right-10 top-10 h-72 w-72 rounded-full bg-tengu-mustard/15 blur-3xl" />
        </div>
      </div>

      {/* Flechas prev/next — siempre visibles (semi-transparentes) */}
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

      {/* Dots indicator */}
      <div
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
        role="tablist"
        aria-label="Slides del hero"
      >
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            role="tab"
            aria-selected={i === current}
            aria-label={`Mostrar imagen ${i + 1} de ${SLIDES.length}`}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current
                ? 'w-10 bg-tengu-mustard'
                : 'w-2 bg-tengu-cream/30 hover:bg-tengu-cream/60'
            }`}
          />
        ))}
      </div>
    </section>
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
