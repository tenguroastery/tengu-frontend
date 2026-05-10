import { Link } from 'react-router-dom';

import Breadcrumbs from './Breadcrumbs';
import { useSeo, setStructuredData } from '../lib/seo';
import { useEffect } from 'react';

export type MethodStep = {
  time?: string;
  title: string;
  body: string;
};

export type MethodPageProps = {
  slug: string;
  name: string;
  shortName: string;
  /** Title corto (max ~45ch sin sufijo) */
  seoTitle: string;
  seoDescription: string;
  /** Lead bajo el H1 */
  intro: string;
  /** Lista de equipamiento necesario */
  equipment: string[];
  /** Receta paso a paso */
  steps: MethodStep[];
  /** Parámetros de receta clave */
  params: { ratio: string; grindSize: string; waterTemp: string; totalTime: string };
  /** Tips finales */
  tips: string[];
  /** Categoría de café que recomendamos para este método */
  recommendedCategory: 'Filtrado' | 'Espresso';
  recommendationCopy: string;
};

export default function MethodPage(props: MethodPageProps) {
  useSeo({
    title: props.seoTitle,
    description: props.seoDescription,
    canonical: `/metodos/${props.slug}`,
    type: 'article',
  });

  useEffect(() => {
    setStructuredData('howto', {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `Cómo preparar café ${props.shortName}`,
      description: props.seoDescription,
      totalTime: `PT${props.params.totalTime.replace(/\D/g, '')}M`,
      supply: props.equipment.map((e) => ({ '@type': 'HowToSupply', name: e })),
      step: props.steps.map((s, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: s.title,
        text: s.body,
      })),
    });
  }, [props]);

  return (
    <>
      <section className="bg-tengu-dark text-tengu-cream">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Breadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Métodos' },
              { label: props.shortName },
            ]}
          />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-tengu-mustard">Métodos de preparación</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
            Cómo preparar café {props.shortName}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-tengu-cream/85">{props.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-4">
          <Param label="Ratio" value={props.params.ratio} />
          <Param label="Molienda" value={props.params.grindSize} />
          <Param label="Temperatura" value={props.params.waterTemp} />
          <Param label="Tiempo total" value={props.params.totalTime} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-12">
        <h2 className="font-display text-2xl">Lo que necesitas</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {props.equipment.map((eq) => (
            <li key={eq} className="flex items-start gap-2 text-tengu-dark/80">
              <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-tengu-mustard" />
              {eq}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-12">
        <h2 className="font-display text-2xl">Paso a paso</h2>
        <ol className="mt-6 space-y-6">
          {props.steps.map((step, idx) => (
            <li key={idx} className="border-l-2 border-tengu-mustard pl-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl text-tengu-mustard">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {step.time && <span className="text-xs uppercase tracking-wider text-tengu-dark/50">{step.time}</span>}
              </div>
              <h3 className="mt-1 font-display text-xl">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-tengu-dark/80">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {props.tips.length > 0 && (
        <section className="bg-tengu-cream/40">
          <div className="mx-auto max-w-3xl px-6 py-12">
            <h2 className="font-display text-2xl">Tips para que salga mejor</h2>
            <ul className="mt-4 space-y-3 text-tengu-dark/80">
              {props.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-3">
                  <span aria-hidden="true" className="font-display text-tengu-mustard">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl">¿Qué café usar?</h2>
        <p className="mt-3 text-tengu-dark/70">{props.recommendationCopy}</p>
        <Link
          to="/tienda"
          className="mt-6 inline-block rounded-md bg-tengu-mustard px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
        >
          Ver café para {props.shortName}
        </Link>
      </section>
    </>
  );
}

function Param({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-tengu-dark/60">{label}</p>
      <p className="mt-1 font-display text-lg text-tengu-ink">{value}</p>
    </div>
  );
}
