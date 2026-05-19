import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import SafeImg from '../components/SafeImg';
import { api } from '../lib/api';
import { useSeo } from '../lib/seo';
import type { Product } from '../types';

type OriginStory = {
  code: string;
  name: string;
  flag: string;
  headline: string;
  body: string;
};

// La imagen de cada origen sale del producto vivo en DB (primer match por
// origin). Si no hay productos publicados para ese origen, la historia se
// oculta — así al eliminar todo de un origen desaparece del Home automático.
const STORIES: OriginStory[] = [
  {
    code: 'Colombia',
    name: 'Colombia',
    flag: '🇨🇴',
    headline: 'Caldas · Huila · Risaralda',
    body: 'Pequeñas fincas en altura, recolección manual y procesos lavados o naturales. Notas dulces a chocolate y caramelo.',
  },
  {
    code: 'Perú',
    name: 'Perú',
    flag: '🇵🇪',
    headline: 'Cajamarca · Pangoa',
    body: 'Cafés cooperativos a más de 1.700 m.s.n.m. Cuerpo cremoso, perfil cítrico y dulzor de panela.',
  },
  {
    code: 'Rwanda',
    name: 'Rwanda',
    flag: '🇷🇼',
    headline: 'Sur de Rwanda',
    body: 'Bourbon Rojo de Marie Gorette, lavado y natural. Frutos rojos brillantes, retrogusto limpio.',
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
      <HeroCarousel />

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
          {STORIES.map((story) => {
            // Imagen viene de un producto vivo del origen. Si no hay ninguno, la historia se oculta.
            const product = products.find((p) => p.origin === story.code && p.image);
            if (!product) return null;
            return (
              <article key={story.code} className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/5] overflow-hidden bg-tengu-cream">
                  <SafeImg
                    src={product.image ? `/uploads/${product.image}` : undefined}
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
            );
          })}
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
