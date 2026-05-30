import { useEffect, useState } from 'react';

import {
  adminApi,
  type AdminDiscountCode,
  type DiscountCodeCreatePayload,
} from '../../lib/admin-api';
import { formatCLP } from '../../lib/api';
import { isoToLocalInput, localInputToIso } from '../../lib/datetime';

const KIND_LABEL: Record<AdminDiscountCode['kind'], string> = {
  percent: '% off',
  fixed: '$ off',
};

const APPLIES_LABEL: Record<AdminDiscountCode['applies_to'], string> = {
  all: 'Todo el sitio',
  category: 'Categoría',
  product: 'Producto',
};

function emptyDraft(): DiscountCodeCreatePayload {
  return {
    code: '',
    description: '',
    kind: 'percent',
    value: 10,
    min_subtotal_clp: 0,
    valid_from: null,
    valid_until: null,
    max_uses: null,
    applies_to: 'all',
    applies_value: null,
    is_active: true,
  };
}

export default function AdminCoupons() {
  const [codes, setCodes] = useState<AdminDiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DiscountCodeCreatePayload | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listDiscountCodes()
      .then(setCodes)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startCreate = () => {
    setDraft(emptyDraft());
    setEditingId(null);
  };

  const startEdit = (c: AdminDiscountCode) => {
    setDraft({
      code: c.code,
      description: c.description ?? '',
      kind: c.kind,
      value: c.value,
      min_subtotal_clp: c.min_subtotal_clp,
      valid_from: c.valid_from,
      valid_until: c.valid_until,
      max_uses: c.max_uses,
      applies_to: c.applies_to,
      applies_value: c.applies_value,
      is_active: c.is_active,
    });
    setEditingId(c.id);
  };

  const save = async () => {
    if (!draft) return;
    setError(null);
    try {
      if (editingId === null) {
        await adminApi.createDiscountCode(draft);
      } else {
        const { code: _code, ...patch } = draft;
        await adminApi.updateDiscountCode(editingId, patch);
      }
      setDraft(null);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggleActive = async (c: AdminDiscountCode) => {
    try {
      await adminApi.updateDiscountCode(c.id, { is_active: !c.is_active });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const remove = async (c: AdminDiscountCode) => {
    if (!confirm(`¿Borrar el código ${c.code}? Esta acción no se puede deshacer.`)) return;
    try {
      await adminApi.deleteDiscountCode(c.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Códigos de descuento</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">
            Cupones aplicables en el checkout. Pueden ser % o monto fijo, con vigencia, usos máximos y mínimo de subtotal.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="rounded-md bg-tengu-mustard px-5 py-2 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
        >
          + Nuevo código
        </button>
      </header>

      {error && (
        <div className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
          {error}
        </div>
      )}

      {draft && (
        <CouponForm
          draft={draft}
          setDraft={setDraft}
          editing={editingId !== null}
          onCancel={() => { setDraft(null); setEditingId(null); }}
          onSave={save}
        />
      )}

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : codes.length === 0 ? (
        <p className="mt-8 text-tengu-dark/60">Aún no hay cupones. Creá uno con "+ Nuevo código".</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-tengu-dark/10 text-left text-xs uppercase tracking-wider text-tengu-dark/60">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Descuento</th>
                <th className="px-4 py-3">Aplica a</th>
                <th className="px-4 py-3">Usos</th>
                <th className="px-4 py-3">Vigencia</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-tengu-dark/5">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold">{c.code}</span>
                    {c.description && <p className="mt-0.5 text-xs text-tengu-dark/60">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {c.kind === 'percent' ? `${c.value}%` : formatCLP(c.value)}{' '}
                    <span className="text-xs text-tengu-dark/50">{KIND_LABEL[c.kind]}</span>
                    {c.min_subtotal_clp > 0 && (
                      <p className="mt-0.5 text-xs text-tengu-dark/60">mín. {formatCLP(c.min_subtotal_clp)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {APPLIES_LABEL[c.applies_to]}
                    {c.applies_value && <p className="mt-0.5 text-xs text-tengu-dark/60">{c.applies_value}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {c.used_count}
                    {c.max_uses !== null && <> / {c.max_uses}</>}
                  </td>
                  <td className="px-4 py-3 text-xs text-tengu-dark/70">
                    {c.valid_from && <>desde {new Date(c.valid_from).toLocaleDateString('es-CL')}<br /></>}
                    {c.valid_until && <>hasta {new Date(c.valid_until).toLocaleDateString('es-CL')}</>}
                    {!c.valid_from && !c.valid_until && <span className="text-tengu-dark/40">sin límite</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                        c.is_active
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-tengu-dark/10 text-tengu-dark/60'
                      }`}
                    >
                      {c.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-xs uppercase tracking-wider text-tengu-ink hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => remove(c)}
                      className="ml-3 text-xs uppercase tracking-wider text-tengu-coral hover:underline"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CouponForm({
  draft,
  setDraft,
  editing,
  onCancel,
  onSave,
}: {
  draft: DiscountCodeCreatePayload;
  setDraft: (d: DiscountCodeCreatePayload) => void;
  editing: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  const update = <K extends keyof DiscountCodeCreatePayload>(field: K, value: DiscountCodeCreatePayload[K]) =>
    setDraft({ ...draft, [field]: value });

  const input = 'w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm';

  return (
    <div className="mt-6 rounded-xl border border-tengu-mustard/40 bg-tengu-cream/30 p-6">
      <h2 className="font-display text-xl">{editing ? 'Editar código' : 'Nuevo código'}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Código</span>
          <input
            value={draft.code}
            onChange={(e) => update('code', e.target.value.toUpperCase().replace(/\s+/g, ''))}
            disabled={editing}
            maxLength={40}
            placeholder="BF2026"
            className={`${input} font-mono uppercase`}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Descripción (admin)</span>
          <input
            value={draft.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
            maxLength={300}
            placeholder="Black Friday 2026"
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Tipo</span>
          <select
            value={draft.kind}
            onChange={(e) => update('kind', e.target.value as 'percent' | 'fixed')}
            className={input}
          >
            <option value="percent">Porcentaje</option>
            <option value="fixed">Monto fijo (CLP)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">
            Valor {draft.kind === 'percent' ? '(1-100)' : '(CLP)'}
          </span>
          <input
            type="number"
            min={1}
            max={draft.kind === 'percent' ? 100 : undefined}
            value={draft.value}
            onChange={(e) => update('value', parseInt(e.target.value || '0', 10))}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Subtotal mínimo (CLP)</span>
          <input
            type="number"
            min={0}
            value={draft.min_subtotal_clp ?? 0}
            onChange={(e) => update('min_subtotal_clp', parseInt(e.target.value || '0', 10))}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Usos máximos</span>
          <input
            type="number"
            min={1}
            value={draft.max_uses ?? ''}
            onChange={(e) => update('max_uses', e.target.value ? parseInt(e.target.value, 10) : null)}
            placeholder="ilimitado"
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Válido desde</span>
          <input
            type="datetime-local"
            value={isoToLocalInput(draft.valid_from)}
            onChange={(e) => update('valid_from', localInputToIso(e.target.value))}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Válido hasta</span>
          <input
            type="datetime-local"
            value={isoToLocalInput(draft.valid_until)}
            onChange={(e) => update('valid_until', localInputToIso(e.target.value))}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-tengu-dark/70">Aplica a</span>
          <select
            value={draft.applies_to}
            onChange={(e) => update('applies_to', e.target.value as 'all' | 'category' | 'product')}
            className={input}
          >
            <option value="all">Todo el sitio</option>
            <option value="category">Una categoría</option>
            <option value="product">Un producto (slug)</option>
          </select>
        </label>
        {draft.applies_to !== 'all' && (
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-tengu-dark/70">
              {draft.applies_to === 'category' ? 'Nombre de la categoría' : 'Slug del producto'}
            </span>
            <input
              value={draft.applies_value ?? ''}
              onChange={(e) => update('applies_value', e.target.value || null)}
              placeholder={draft.applies_to === 'category' ? 'Filtrado' : 'pink-bourbon-lavado'}
              className={input}
            />
          </label>
        )}
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={draft.is_active ?? true}
            onChange={(e) => update('is_active', e.target.checked)}
            className="h-4 w-4 accent-tengu-mustard"
          />
          <span className="text-sm">Activo</span>
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onSave}
          className="rounded-md bg-tengu-ink px-5 py-2 text-sm font-semibold uppercase tracking-wider text-tengu-cream hover:bg-tengu-dark"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border border-tengu-dark/20 px-5 py-2 text-sm hover:bg-tengu-dark/5"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
