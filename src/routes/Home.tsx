import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import { api } from '../lib/api';
import { useSeo } from '../lib/seo';
import type { Product } from '../types';

type OriginStory = {
  code: string;
  name: string;
  flag: string;
  headline: string;
  body: string;
  image: string;
};

const STORIES: OriginStory[] = [
  {
    code: 'Colombia',
    name: 'Colombia',
    flag: '🇨🇴',
    headline: 'Caldas · Huila · Risaralda',
    body: 'Pequeñas fincas en altura, recolección manual y procesos lavados o naturales. Notas dulces a chocolate y caramelo.',
    image: 'familia-zambrano-colombia.jpg',
  },
  {
    code: 'Perú',
    name: 'Perú',
    flag: '🇵🇪',
    headline: 'Cajamarca · Pangoa',
    body: 'Cafés cooperativos a más de 1.700 m.s.n.m. Cuerpo cremoso, perfil cítrico y dulzor de panela.',
    image: 'peru-cajamarca-el-bambu.jpg',
  },
  {
    code: 'Rwanda',
    name: 'Rwanda',
    flag: '🇷🇼',
    headline: 'Sur de Rwanda',
    body: 'Bourbon Rojo de Marie Gorette, lavado y natural. Frutos rojos brillantes, retrogusto limpio.',
    image: 'rwanda-marie-gorette-natural.jpg',
  },
];

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Selección',
    body: 'Elegimos productores con cosecha manual y trazabilidad real, finca por finca.',
  },
  {
    n: '02',
    title: 'Importación',
    body: 'El café verde llega en sacos sellados, fresco de cosecha del año.',
  },
  {
    n: '03',
    title: 'Tueste',
    body: 'Tostamos en pequeños lotes cada semana. La fecha de tueste va impresa en cada bolsa.',
  },
  {
    n: '04',
    title: 'Despacho',
    body: 'Empaquetamos al pedido y enviamos a todo Chile. Llega antes que pierda frescura.',
  },
];

export default function Home() {
  useSeo({
    title: 'Café de especialidad tostado en Chile',
    description:
      'Granos seleccionados de Colombia, Perú y Rwanda. Tostados frescos en pequeños lotes para filtrado y espresso. Despacho a todo Chile.',
    canonical: '/',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.featured);

  return (
    <>
      {/* HERO — escena tostador como bg + bag a la derecha */}
      <section className="relative isolate overflow-hidden bg-tengu-dark text-tengu-cream">
        <picture aria-hidden="true" className="absolute inset-0 -z-10">
          <source
            type="image/webp"
            srcSet="/hero-bg-768w.webp 768w, /hero-bg-1280w.webp 1280w, /hero-bg.webp 1920w"
            sizes="100vw"
          />
          <img
            src="/hero-bg.jpg"
            srcSet="/hero-bg-768w.jpg 768w, /hero-bg-1280w.jpg 1280w, /hero-bg.jpg 1920w"
            sizes="100vw"
            alt=""
            className="h-full w-full object-cover opacity-55"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-tengu-dark via-tengu-dark/85 to-tengu-dark/40" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-tengu-dark/90 to-transparent" aria-hidden="true" />

        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2 md:items-center md:py-36">
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.5em] text-tengu-mustard">Tostado en Chile</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
              Café que<br />
              <span className="text-tengu-mustard">cuenta</span> de dónde viene.
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-tengu-cream/85">
              Granos de Colombia, Perú y Rwanda. Tostados frescos, en pequeños lotes, para que cada
              taza honre el trabajo del productor.
            </p>
            <div className="mt-10">
              <Link
                to="/tienda"
                className="inline-block rounded-md bg-tengu-mustard px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-tengu-dark transition hover:bg-tengu-cream"
              >
                Comprar café →
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -right-10 top-10 h-72 w-72 rounded-full bg-tengu-mustard/20 blur-3xl" aria-hidden="true" />
            <div className="relative ml-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <picture>
                <source
                  type="image/webp"
                  srcSet="/hero-bag-480w.webp 480w, /hero-bag.webp 800w"
                  sizes="(max-width: 768px) 80vw, 400px"
                />
                <img
                  src="/hero-bag.jpg"
                  srcSet="/hero-bag-480w.jpg 480w, /hero-bag.jpg 800w"
                  sizes="(max-width: 768px) 80vw, 400px"
                  alt="Bolsa de Marie Gorette Mukamurenzi — Rwanda Natural · Tengu Roastery"
                  className="h-full w-full object-cover"
                  width={400}
                  height={533}
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* DEL ORIGEN A TU TAZA — storytelling */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-tengu-mustard">El origen importa</p>
          <h2 className="mt-3 font-display text-4xl">Del productor a tu taza</h2>
          <p className="mt-4 text-tengu-dark/70">
            Cada café que vendemos viene con nombre y apellido. Sabes la finca, la altitud, la
            variedad, el productor y la cosecha. No es marketing — es información que cambia el sabor
            de lo que tomas.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STORIES.map((story) => (
            <article key={story.code} className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="aspect-[4/5] overflow-hidden bg-tengu-cream">
                <img
                  src={`/uploads/${story.image}`}
                  alt={`Café de ${story.name} — Tengu Roastery`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={500}
                />
              </div>
              <div className="p-6">
                <p className="text-3xl">{story.flag}</p>
                <h3 className="mt-2 font-display text-2xl">{story.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-tengu-mustard">
                  {story.headline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-tengu-dark/70">{story.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-tengu-mustard">Selección de la semana</p>
              <h2 className="mt-2 font-display text-3xl">Destacados</h2>
            </div>
            <Link to="/tienda" className="text-sm uppercase tracking-wider text-tengu-ink hover:underline">
              Ver todos →
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid count={3} />
          ) : featured.length === 0 ? (
            <p className="text-tengu-dark/60">Sin destacados disponibles.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CÓMO LO HACEMOS */}
      <section className="bg-tengu-dark text-tengu-cream">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.4em] text-tengu-mustard">Nuestro proceso</p>
            <h2 className="mt-3 font-display text-4xl">Cómo lo hacemos</h2>
            <p className="mt-4 text-tengu-cream/70">
              No improvisamos. Cada bolsa pasa por estos pasos antes de llegar a ti.
            </p>
          </div>

          <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <li key={step.n} className="border-t-2 border-tengu-mustard pt-5">
                <p className="font-display text-3xl text-tengu-mustard">{step.n}</p>
                <h3 className="mt-2 font-display text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tengu-cream/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl leading-tight md:text-5xl">
          Una taza que se nota.
        </h2>
        <p className="mt-5 text-lg text-tengu-dark/70">
          Si nunca has probado café de especialidad, este es un buen lugar para empezar.
        </p>
        <Link
          to="/tienda"
          className="mt-8 inline-block rounded-md bg-tengu-dark px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-tengu-cream transition hover:bg-tengu-mustard hover:text-tengu-dark"
        >
          Ver toda la tienda
        </Link>
      </section>
    </>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="aspect-[3/4] animate-pulse bg-tengu-dark/5" />
          <div className="space-y-2 p-5">
            <div className="h-3 w-1/3 animate-pulse rounded bg-tengu-dark/10" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-tengu-dark/10" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-tengu-dark/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
