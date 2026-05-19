import { useState, type FormEvent } from 'react';

import Breadcrumbs from '../components/Breadcrumbs';
import { formatApiError } from '../lib/api';
import { useSeo } from '../lib/seo';
import { useSiteSettings } from '../store/site';

const BUSINESS_TYPES = ['Cafetería', 'Restaurant', 'Hotel', 'Oficina', 'Marca propia', 'Otro'];

export default function Horeca() {
  useSeo({
    title: 'Café para Horeca y oficinas en Chile',
    description:
      'Café de especialidad para cafeterías, restaurantes, hoteles y oficinas. Precios mayoristas, asesoría barista y opción de marca blanca. Cotiza con Tengu Roastery.',
    canonical: '/horeca',
  });
  const siteSettings = useSiteSettings();
  const minKg = siteSettings?.wholesale_min_kg ?? 5;
  const wholesaleMsg = siteSettings?.wholesale_lead_msg ?? '';

  const [form, setForm] = useState({
    company: '',
    contact_name: '',
    email: '',
    phone: '',
    city: '',
    business_type: 'Cafetería',
    kg_per_month: '',
    machine_type: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const update = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/horeca/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        let detail = `${res.status} ${res.statusText}`;
        try {
          const body = await res.json();
          if (body?.detail) detail = formatApiError(body.detail);
        } catch { /* keep default */ }
        throw new Error(detail);
      }
      setStatus('ok');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <>
      <section className="bg-tengu-dark text-tengu-cream">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Horeca' }]} />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-tengu-mustard">B2B · Horeca</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
            Café para tu<br />
            <span className="text-tengu-mustard">cafetería, oficina o restaurant</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-tengu-cream/85">
            Trabajamos con cafeterías, restaurantes, hoteles y oficinas que valoran café de
            especialidad fresco, trazable y con asesoría real. Precios mayoristas y volumen
            adaptado a tu rotación.
          </p>
          <p className="mt-4 inline-block rounded-full bg-tengu-mustard px-4 py-1.5 text-sm font-semibold text-tengu-dark">
            Cotización mayorista · desde {minKg} kg
          </p>
          {wholesaleMsg && (
            <p className="mt-3 max-w-2xl text-sm text-tengu-cream/70">{wholesaleMsg}</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Benefit
            title="Precio mayorista"
            body="Tarifas escalonadas según consumo mensual. Más kilos, mejor precio. Cobertura nacional con despacho semanal."
          />
          <Benefit
            title="Asesoría barista"
            body="Te ayudamos a calibrar el shot, elegir el blend correcto y entrenar a tu equipo. Café bueno también requiere preparación buena."
          />
          <Benefit
            title="Marca blanca opcional"
            body="¿Quieres tu propia marca de café tostado por nosotros? Diseñamos el blend, hacemos el tueste, te entregamos el producto listo."
          />
        </div>
      </section>

      <section className="bg-tengu-cream/40">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-display text-3xl">Cuéntanos de tu negocio</h2>
          <p className="mt-2 text-tengu-dark/70">
            Te respondemos en menos de 24 horas hábiles con precios y siguiente paso.
          </p>

          {status === 'ok' ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-4xl">📥</p>
              <h3 className="mt-3 font-display text-2xl">Recibido</h3>
              <p className="mt-2 text-tengu-dark/70">
                Gracias por escribirnos, {form.contact_name || 'colega'}. Te respondemos en breve a
                <strong> {form.email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl bg-white p-8 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Empresa" required>
                  <input type="text" required value={form.company} onChange={update('company')} className={inputClass} />
                </Field>
                <Field label="Nombre contacto" required>
                  <input type="text" required value={form.contact_name} onChange={update('contact_name')} className={inputClass} />
                </Field>
                <Field label="Email" required>
                  <input type="email" required value={form.email} onChange={update('email')} className={inputClass} />
                </Field>
                <Field label="Teléfono" required>
                  <input type="tel" required value={form.phone} onChange={update('phone')} className={inputClass} placeholder="+56 9 XXXX XXXX" />
                </Field>
                <Field label="Ciudad">
                  <input type="text" value={form.city} onChange={update('city')} className={inputClass} />
                </Field>
                <Field label="Tipo de negocio">
                  <select value={form.business_type} onChange={update('business_type')} className={inputClass}>
                    {BUSINESS_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </Field>
                <Field label="Kg estimados / mes">
                  <input type="text" value={form.kg_per_month} onChange={update('kg_per_month')} className={inputClass} placeholder="ej. 10 kg" />
                </Field>
                <Field label="Máquina / equipos">
                  <input type="text" value={form.machine_type} onChange={update('machine_type')} className={inputClass} placeholder="ej. La Marzocco Linea Mini" />
                </Field>
              </div>
              <Field label="Cuéntanos más (opcional)">
                <textarea
                  value={form.message}
                  onChange={update('message')}
                  className={inputClass}
                  rows={3}
                  placeholder="¿Qué tipo de café buscas? ¿Algún plazo o evento puntual?"
                />
              </Field>

              {status === 'error' && (
                <p className="text-sm text-tengu-coral">No pudimos enviar el formulario ({errorMsg}). Intenta de nuevo o escríbenos por WhatsApp.</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-md bg-tengu-mustard px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-tengu-dark transition hover:bg-tengu-coral hover:text-white disabled:opacity-50"
              >
                {status === 'loading' ? 'Enviando…' : 'Enviar consulta'}
              </button>
              <p className="text-center text-xs text-tengu-dark/50">
                Al enviar aceptas nuestra política de privacidad. No compartimos tu información.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function Benefit({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="font-display text-xl text-tengu-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-tengu-dark/70">{body}</p>
    </div>
  );
}

const inputClass =
  'w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm focus:border-tengu-ink focus:outline-none';

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-tengu-dark/70">
        {label}
        {required && <span className="ml-0.5 text-tengu-coral">*</span>}
      </span>
      {children}
    </label>
  );
}
