import { Link } from 'react-router-dom';

import Breadcrumbs from '../components/Breadcrumbs';
import { useSeo } from '../lib/seo';

const VALUES = [
  {
    title: 'Trazabilidad real',
    body: 'Cada bolsa lleva el nombre del productor, finca, variedad, proceso, altitud y cosecha. Información verificable, no marketing.',
  },
  {
    title: 'Tueste fresco',
    body: 'Tostamos en lotes pequeños cada semana. La fecha de tueste va impresa en cada bolsa. Nunca vendemos café con más de 30 días.',
  },
  {
    title: 'Relación directa',
    body: 'Compramos café verde de productores que conocemos por nombre, pagando precios que reconocen el trabajo bajo el árbol.',
  },
  {
    title: 'Sin endulzantes',
    body: 'Solo grano. Lo dulce, frutal o achocolatado viene de la variedad y del proceso, no de aromatizantes ni jarabes.',
  },
];

const STATS = [
  { value: '8', label: 'orígenes activos' },
  { value: '3', label: 'países productores' },
  { value: '100%', label: 'arábica' },
  { value: '<7d', label: 'edad promedio del café que enviamos' },
];

export default function About() {
  useSeo({
    title: 'Sobre nosotros · café que cuenta de dónde viene',
    description:
      'Tengu Roastery es una tostaduría chilena de café de especialidad. Trabajamos con productores reales en Colombia, Perú y Rwanda, con trazabilidad de finca a taza.',
    canonical: '/sobre-nosotros',
  });

  return (
    <>
      {/* Hero */}
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

      {/* Manifiesto / Por qué */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.4em] text-tengu-mustard">Manifiesto</p>
        <h2 className="mt-3 font-display text-3xl">Por qué hacemos esto</h2>
        <div className="mt-6 space-y-4 leading-relaxed text-tengu-dark/80">
          <p>
            Empezamos Tengu porque el café industrial nos aburre. Esa taza tibia, amarga, que sale
            de cualquier máquina sin distinción — esa no nos representa.
          </p>
          <p>
            Hay productores en altura, en fincas pequeñas, que cosechan grano por grano y procesan
            cuidadosamente. Cuando ese trabajo llega bien tostado a tu casa, una taza de café puede
            ser una experiencia. Frutos rojos brillantes en un Rwanda. Chocolate denso en un
            Colombia. Cuerpo cremoso en un Perú.
          </p>
          <p>
            Lo que hacemos es traer ese café acá, tostarlo en pequeños lotes, y mandártelo fresco.
            Sin marketing inflado. Solo café real, con su historia.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-tengu-cream/40">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-4xl text-tengu-ink md:text-5xl">{s.value}</p>
                <p className="mt-2 text-xs uppercase tracking-wider text-tengu-dark/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.4em] text-tengu-mustard">En lo que creemos</p>
        <h2 className="mt-3 font-display text-3xl">Nuestros valores</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {VALUES.map((v) => (
            <article key={v.title} className="border-t-2 border-tengu-mustard pt-5">
              <h3 className="font-display text-xl">{v.title}</h3>
              <p className="mt-2 leading-relaxed text-tengu-dark/70">{v.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="bg-tengu-dark text-tengu-cream">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.4em] text-tengu-mustard">Cómo trabajamos</p>
          <h2 className="mt-3 font-display text-3xl">De la finca a tu taza</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            <li className="border-t-2 border-tengu-mustard pt-5">
              <p className="font-display text-3xl text-tengu-mustard">01</p>
              <h3 className="mt-2 font-display text-xl">Selección en origen</h3>
              <p className="mt-2 text-sm leading-relaxed text-tengu-cream/70">
                Probamos muestras antes de comprar. Buscamos finca por finca, no compramos
                "café de Colombia" genérico.
              </p>
            </li>
            <li className="border-t-2 border-tengu-mustard pt-5">
              <p className="font-display text-3xl text-tengu-mustard">02</p>
              <h3 className="mt-2 font-display text-xl">Tueste en pequeños lotes</h3>
              <p className="mt-2 text-sm leading-relaxed text-tengu-cream/70">
                Cada perfil de tueste se desarrolla pensando en cómo lo vas a preparar tú: filtrado
                limpio o espresso cremoso.
              </p>
            </li>
            <li className="border-t-2 border-tengu-mustard pt-5">
              <p className="font-display text-3xl text-tengu-mustard">03</p>
              <h3 className="mt-2 font-display text-xl">Despacho fresco</h3>
              <p className="mt-2 text-sm leading-relaxed text-tengu-cream/70">
                Empacamos al pedido y enviamos en 24-48h. Llega antes de los 7 días de tueste — la
                ventana ideal para tomarlo.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Productores */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.4em] text-tengu-mustard">Con quiénes trabajamos</p>
        <h2 className="mt-3 font-display text-3xl">Productores y fincas</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-3xl">🇷🇼</p>
            <h3 className="mt-3 font-display text-xl">Marie Gorette Mukamurenzi</h3>
            <p className="mt-1 text-xs uppercase tracking-wider text-tengu-mustard">
              Sur de Rwanda · Bourbon Rojo
            </p>
            <p className="mt-3 text-sm text-tengu-dark/70">
              Productora de Bourbon Rojo a 1.600-2.100 m.s.n.m. Procesos lavado y natural
              anaeróbico, frutos rojos brillantes y chocolate con leche.
            </p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-3xl">🇨🇴</p>
            <h3 className="mt-3 font-display text-xl">Familia Zambrano</h3>
            <p className="mt-1 text-xs uppercase tracking-wider text-tengu-mustard">
              Huila, Colombia · Variedad Colombia
            </p>
            <p className="mt-3 text-sm text-tengu-dark/70">
              Finca familiar a 1.700-1.900 m.s.n.m. Proceso natural, perfil dulce con notas a
              frutos amarillos, chocolate y caramelo.
            </p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-3xl">🇵🇪</p>
            <h3 className="mt-3 font-display text-xl">Cooperativa Pangoa</h3>
            <p className="mt-1 text-xs uppercase tracking-wider text-tengu-mustard">
              Junín, Perú · Caturra y Bourbon
            </p>
            <p className="mt-3 text-sm text-tengu-dark/70">
              Cooperativa de pequeños productores. Cuerpo sedoso, dulzor a panela, notas a
              chocolate y frutos secos. Base de nuestro Espresso Blend.
            </p>
          </article>
        </div>
      </section>

      {/* CTA + opciones */}
      <section className="bg-tengu-cream/40">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-display text-3xl">¿Quieres probar?</h2>
          <p className="mt-3 text-tengu-dark/70">
            Empieza con uno de nuestros cafés destacados. Si es tu primera vez con café de
            especialidad, te recomendamos los perfiles de filtrado.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/tienda"
              className="rounded-md bg-tengu-mustard px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
            >
              Ver tienda
            </Link>
            <Link
              to="/blog/como-elegir-cafe-de-especialidad-chile"
              className="rounded-md border border-tengu-dark/15 px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-tengu-dark transition hover:border-tengu-ink"
            >
              Cómo elegir café
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
