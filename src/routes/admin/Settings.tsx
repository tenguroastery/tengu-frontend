import { useEffect, useState } from 'react';

import { adminApi } from '../../lib/admin-api';
import type { SiteSettings } from '../../types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [draft, setDraft] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    adminApi
      .getSiteSettings()
      .then((s) => {
        setSettings(s);
        setDraft(s);
      })
      .catch((err) => setError(String(err)));
  }, []);

  if (!draft) {
    return <div className="p-8 text-tengu-dark/60">Cargando configuración…</div>;
  }

  const isDirty = settings && JSON.stringify(settings) !== JSON.stringify(draft);

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminApi.patchSiteSettings(draft);
      setSettings(updated);
      setDraft(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="font-display text-3xl">Configuración del sitio</h1>
      <p className="mt-1 text-sm text-tengu-dark/60">
        Cambios afectan el frontend público al instante (próximo refresh del cliente).
      </p>

      <div className="mt-8 space-y-6 rounded-xl bg-white p-6 shadow-sm">
        <Section title="Envíos">
          <Field label="Umbral envío gratis (CLP)" hint="Si subtotal ≥ este monto, el envío es gratis. Pon 0 para desactivar.">
            <input
              type="number"
              min={0}
              step={1000}
              value={draft.free_shipping_threshold_clp}
              onChange={(e) =>
                setDraft({ ...draft, free_shipping_threshold_clp: parseInt(e.target.value || '0', 10) })
              }
              className={inputCls}
            />
          </Field>
        </Section>

        <Section title="Operativa / Copy">
          <Field label="Día de tostado" hint="Aparece en footer y checkout. Ej: 'viernes' o 'martes y viernes'.">
            <input
              type="text"
              value={draft.roast_day}
              onChange={(e) => setDraft({ ...draft, roast_day: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Días de despacho" hint="Ej: 'martes y viernes'.">
            <input
              type="text"
              value={draft.ship_days}
              onChange={(e) => setDraft({ ...draft, ship_days: e.target.value })}
              className={inputCls}
            />
          </Field>
        </Section>

        <Section title="Suscripción de café">
          <label className="flex items-start gap-3 rounded-md border border-tengu-dark/10 bg-white p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.subscription_enabled ?? true}
              onChange={(e) => setDraft({ ...draft, subscription_enabled: e.target.checked })}
              className="mt-0.5 h-5 w-5 accent-tengu-ink"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {draft.subscription_enabled ?? true ? '✓ Suscripción activa' : '⊘ Suscripción en "Próximamente"'}
              </p>
              <p className="mt-1 text-xs text-tengu-dark/60">
                Si está desactivada, /suscripcion muestra un cartel de "próximamente" sin formulario,
                y el link desaparece del header y del footer.
              </p>
            </div>
          </label>
          <Field label="Descuento % suscripción" hint="Se aplica a todas las suscripciones recurrentes.">
            <input
              type="number"
              min={0}
              max={100}
              value={draft.subscription_discount_pct}
              onChange={(e) =>
                setDraft({ ...draft, subscription_discount_pct: parseInt(e.target.value || '0', 10) })
              }
              className={inputCls}
            />
          </Field>
        </Section>

        <Section title="Cuentas de cliente">
          <label className="flex items-start gap-3 rounded-md border border-tengu-dark/10 bg-white p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.customer_accounts_enabled ?? false}
              onChange={(e) => setDraft({ ...draft, customer_accounts_enabled: e.target.checked })}
              className="mt-0.5 h-5 w-5 accent-tengu-ink"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {draft.customer_accounts_enabled ?? false ? '✓ Cuentas activas' : '⊘ Cuentas en "Próximamente"'}
              </p>
              <p className="mt-1 text-xs text-tengu-dark/60">
                Si está desactivada, /cuenta y /cuenta/login muestran "próximamente"
                y los JWT viejos de clientes no acceden al dashboard.
              </p>
            </div>
          </label>
        </Section>

        <Section title="Popup de oferta">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={draft.promo_enabled}
              onChange={(e) => setDraft({ ...draft, promo_enabled: e.target.checked })}
              className="mt-1 h-4 w-4 accent-tengu-mustard"
            />
            <div>
              <p className="text-sm font-medium text-tengu-dark">Activar popup de oferta</p>
              <p className="mt-1 text-xs text-tengu-dark/60">
                Si está activado, reemplaza al popup de newsletter en el sitio público. Se muestra al cliente al hacer exit-intent (desktop) o tras dwell+scroll (mobile).
              </p>
            </div>
          </label>
          <Field label="Etiqueta superior" hint="Texto en mayúsculas arriba del título. Ej: 'OFERTA DEL MES'.">
            <input
              value={draft.promo_badge}
              onChange={(e) => setDraft({ ...draft, promo_badge: e.target.value })}
              placeholder="OFERTA DEL MES"
              maxLength={40}
              className={inputCls}
            />
          </Field>
          <Field label="Título" hint="Línea principal grande.">
            <input
              value={draft.promo_title}
              onChange={(e) => setDraft({ ...draft, promo_title: e.target.value })}
              placeholder="Pink Bourbon a 20% off"
              maxLength={120}
              className={inputCls}
            />
          </Field>
          <Field label="Subtítulo" hint="Una línea corta de apoyo. Opcional.">
            <input
              value={draft.promo_subtitle}
              onChange={(e) => setDraft({ ...draft, promo_subtitle: e.target.value })}
              placeholder="Solo hasta el 31 de mayo"
              maxLength={200}
              className={inputCls}
            />
          </Field>
          <Field label="Texto descriptivo" hint="Detalles. Soporta saltos de línea.">
            <textarea
              rows={4}
              value={draft.promo_body}
              onChange={(e) => setDraft({ ...draft, promo_body: e.target.value })}
              placeholder="Una variedad colombiana excepcional, con notas a flor y miel. Recién tostada este viernes."
              maxLength={600}
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Texto del botón">
              <input
                value={draft.promo_cta_label}
                onChange={(e) => setDraft({ ...draft, promo_cta_label: e.target.value })}
                placeholder="Ver oferta"
                maxLength={60}
                className={inputCls}
              />
            </Field>
            <Field label="Link del botón" hint="Ruta interna (/cafe/...) o URL completa.">
              <input
                value={draft.promo_cta_url}
                onChange={(e) => setDraft({ ...draft, promo_cta_url: e.target.value })}
                placeholder="/cafe/pink-bourbon-lavado"
                maxLength={300}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fecha de fin" hint="YYYY-MM-DD. Vacío = sin vencimiento.">
              <input
                type="date"
                value={draft.promo_expires_at ?? ''}
                onChange={(e) => setDraft({ ...draft, promo_expires_at: e.target.value || null })}
                className={inputCls}
              />
            </Field>
            <Field label="Días entre apariciones" hint="Tras cerrar el popup, no vuelve a mostrarse por X días.">
              <input
                type="number"
                min={0}
                max={365}
                value={draft.promo_dismiss_days}
                onChange={(e) =>
                  setDraft({ ...draft, promo_dismiss_days: parseInt(e.target.value || '7', 10) })
                }
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Imagen lateral (URL)" hint="Opcional. Ruta tipo /uploads/foo.webp o URL completa.">
            <input
              value={draft.promo_image ?? ''}
              onChange={(e) => setDraft({ ...draft, promo_image: e.target.value || null })}
              placeholder="/uploads/pink-bourbon-lavado-opt.webp"
              maxLength={300}
              className={inputCls}
            />
          </Field>
        </Section>

        <Section title="Mayorista / HORECA">
          <Field label="Mínimo de kilos para wholesale" hint="Se muestra en /horeca como 'desde X kg'.">
            <input
              type="number"
              min={1}
              value={draft.wholesale_min_kg}
              onChange={(e) =>
                setDraft({ ...draft, wholesale_min_kg: parseInt(e.target.value || '1', 10) })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Mensaje cotización mayorista" hint="Aparece en /horeca y banners.">
            <textarea
              rows={3}
              value={draft.wholesale_lead_msg}
              onChange={(e) => setDraft({ ...draft, wholesale_lead_msg: e.target.value })}
              className={inputCls}
            />
          </Field>
        </Section>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="rounded-md bg-tengu-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {!isDirty && savedAt && Date.now() - savedAt < 5000 && (
          <span className="text-sm text-tengu-ink">✓ Guardado</span>
        )}
        {isDirty && <span className="text-xs text-tengu-mustard">Cambios sin guardar</span>}
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm focus:border-tengu-ink focus:outline-none';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 font-display text-lg">{title}</legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-tengu-dark/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-tengu-dark/50">{hint}</span>}
    </label>
  );
}
