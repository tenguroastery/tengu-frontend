import { Link } from 'react-router-dom';

import Breadcrumbs from '../components/Breadcrumbs';
import { useSeo } from '../lib/seo';

export default function About() {
  useSeo({
    title: 'Sobre nosotros',
    description:
      'Tengu Roastery es una tostaduría chilena de café de especialidad. Trabajamos con productores de Colombia, Perú y Rwanda para traer trazabilidad real a tu taza.',
    canonical: '/sobre-nosotros',
  });

  return (
    <>
      <section className="bg-tengu-dark text-tengu-cream">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Sobre nosotros' }]} />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-tengu-mustard">Quiénes somos</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
            Café que cuenta<br />de dónde viene.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-tengu-cream/85">
            Somos una tostaduría chilena que trabaja con productores reales — no con commodities.
            Cada bolsa que vendemos lleva el nombre de la finca, el productor, la altitud y la
            cosecha. Es información que cambia el sabor de lo que tomas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl">Por qué hacemos esto</h2>
            <p className="mt-4 leading-relaxed text-tengu-dark/80">
              Buscamos construir una relación directa con quienes cultivan el café. Nos interesa
              la trazabilidad porque cuando sabes el camino del grano — finca, proceso, fecha de
              tueste — entiendes lo que estás bebiendo. Y eso ayuda a pagar mejor a quienes lo
              producen.
            </p>
            <p className="mt-4 leading-relaxed text-tengu-dark/80">
              Tostamos en Chile, en lotes pequeños, cada semana. La fecha de tueste va impresa en
              cada bolsa. No vas a tomar café con seis meses encima de una repisa.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl">Cómo trabajamos</h2>
            <ul className="mt-4 space-y-4 text-tengu-dark/80">
              <li>
                <strong className="block text-tengu-ink">Cosecha de productores específicos</strong>
                Compramos café verde de fincas que conocemos por nombre. Esta práctica se llama
                <em> single origin trazable</em> y es lo que distingue al café de especialidad del
                café comercial.
              </li>
              <li>
                <strong className="block text-tengu-ink">Tueste en lotes pequeños</strong>
                Cada perfil de tueste se desarrolla pensando en cómo lo vas a preparar tú: filtrado
                lento (V60, AeroPress, Chemex) o espresso.
              </li>
              <li>
                <strong className="block text-tengu-ink">Sin endulzantes ni aditivos</strong>
                Lo dulce, frutal o chocolatoso del café viene del grano y del proceso. No de
                aromatizantes ni jarabes.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-tengu-cream/40">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-display text-3xl">¿Quieres probar?</h2>
          <p className="mt-3 text-tengu-dark/70">
            Empieza con uno de nuestros cafés destacados. Si es tu primera vez con café de
            especialidad, te recomendamos los perfiles de filtrado.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block rounded-md bg-tengu-mustard px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
          >
            Ver tienda
          </Link>
        </div>
      </section>
    </>
  );
}
