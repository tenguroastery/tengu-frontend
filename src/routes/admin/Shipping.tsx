import { useEffect, useState } from 'react';

import {
  adminApi,
  type AdminComunaZone,
  type AdminComunaZoneIn,
  type AdminShippingRate,
} from '../../lib/admin-api';
import { formatCLP } from '../../lib/api';

const ZONE_LABEL: Record<string, string> = {
  ohiggins: "O'Higgins (misma región)",
  centro_otros: 'Centro / Santiago (otra región)',
  extremo: 'Extremo (norte/sur)',
};

const MODE_LABEL: Record<string, string> = {
  domicilio: 'A domicilio',
  punto: 'Punto Blue Express',
};

export default function AdminShipping() {
  const [rates, setRates] = useState<AdminShippingRate[]>([]);
  const [zones, setZones] = useState<AdminComunaZone[]>([]);
  const [editingRate, setEditingRate] = useState<Record<number, number>>({});
  const [savingRateId, setSavingRateId] = useState<number | null>(null);
  const [newZone, setNewZone] = useState<AdminComunaZoneIn>({ region: '', comuna: '', zone: 'centro_otros' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [r, z] = await Promise.all([adminApi.listShippingRates(), adminApi.listComunaZones()]);
      setRates(r);
      setZones(z);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleRateSave = async (id: number) => {
    const price = editingRate[id];
    if (price === undefined) return;
    setSavingRateId(id);
    try {
      const updated = await adminApi.patchShippingRate(id, price);
      setRates((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setEditingRate((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingRateId(null);
    }
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.region.trim()) return;
    try {
      const created = await adminApi.createComunaZone({
        region: newZone.region.trim(),
        comuna: newZone.comuna?.trim() || undefined,
        zone: newZone.zone,
      });
      setZones((prev) => [...prev, created].sort((a, b) => a.region.localeCompare(b.region)));
      setNewZone({ region: '', comuna: '', zone: 'centro_otros' });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteZone = async (id: number) => {
    if (!confirm('¿Borrar este mapeo?')) return;
    try {
      await adminApi.deleteComunaZone(id);
      setZones((prev) => prev.filter((z) => z.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading && rates.length === 0) {
    return <div className="p-8 text-tengu-dark/60">Cargando tarifario…</div>;
  }

  // Agrupar tarifas por modalidad para mostrar 2 tablas (a domicilio + punto)
  const byMode: Record<string, AdminShippingRate[]> = {};
  for (const r of rates) {
    if (!byMode[r.mode]) byMode[r.mode] = [];
    byMode[r.mode].push(r);
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="font-display text-3xl">Tarifario de envíos</h1>
      <p className="mt-1 text-sm text-tengu-dark/60">
        Origen: Rancagua. Cuando Blue Express suba precios, edita acá los CLP por banda × zona.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
          {error}
        </div>
      )}

      {Object.entries(byMode).map(([mode, list]) => (
        <section key={mode} className="mt-10">
          <h2 className="font-display text-xl">{MODE_LABEL[mode] ?? mode}</h2>
          <div className="mt-3 overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="border-b border-tengu-dark/10 bg-tengu-cream/50 text-xs uppercase tracking-wider text-tengu-dark/60">
                <tr>
                  <th className="px-4 py-3 text-left">Banda</th>
                  <th className="px-4 py-3 text-left">Peso</th>
                  <th className="px-4 py-3 text-left">Zona destino</th>
                  <th className="px-4 py-3 text-right">Precio CLP</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tengu-dark/5">
                {list
                  .sort((a, b) => {
                    const order = ['XS', 'S', 'M', 'L'];
                    const da = order.indexOf(a.size_band) - order.indexOf(b.size_band);
                    if (da !== 0) return da;
                    return a.zone.localeCompare(b.zone);
                  })
                  .map((r) => {
                    const draft = editingRate[r.id];
                    const isDirty = draft !== undefined && draft !== r.price_clp;
                    return (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-mono font-semibold">{r.size_band}</td>
                        <td className="px-4 py-3 text-tengu-dark/70">
                          {(r.weight_min_g / 1000).toLocaleString('es-CL')} – {(r.weight_max_g / 1000).toLocaleString('es-CL')} kg
                        </td>
                        <td className="px-4 py-3">{ZONE_LABEL[r.zone] ?? r.zone}</td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={draft !== undefined ? draft : r.price_clp}
                            onChange={(e) =>
                              setEditingRate((prev) => ({
                                ...prev,
                                [r.id]: parseInt(e.target.value || '0', 10),
                              }))
                            }
                            className="w-32 rounded-md border border-tengu-dark/15 bg-white px-2 py-1 text-right text-sm focus:border-tengu-ink focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isDirty && (
                            <button
                              type="button"
                              onClick={() => handleRateSave(r.id)}
                              disabled={savingRateId === r.id}
                              className="rounded-md bg-tengu-ink px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white hover:bg-tengu-mustard hover:text-tengu-dark disabled:opacity-50"
                            >
                              {savingRateId === r.id ? '...' : 'Guardar'}
                            </button>
                          )}
                          {!isDirty && (
                            <span className="text-xs text-tengu-dark/40">{formatCLP(r.price_clp)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="mt-12">
        <h2 className="font-display text-xl">Mapeo región/comuna → zona</h2>
        <p className="mt-1 text-sm text-tengu-dark/60">
          Sin <code>comuna</code> = regla por defecto de la región. Comuna específica gana sobre la regla regional.
        </p>

        <form onSubmit={handleAddZone} className="mt-4 grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_180px_auto]">
          <input
            type="text"
            placeholder="Región (ej: Valparaíso)"
            value={newZone.region}
            onChange={(e) => setNewZone({ ...newZone, region: e.target.value })}
            className="rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Comuna (opcional)"
            value={newZone.comuna ?? ''}
            onChange={(e) => setNewZone({ ...newZone, comuna: e.target.value })}
            className="rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm"
          />
          <select
            value={newZone.zone}
            onChange={(e) =>
              setNewZone({ ...newZone, zone: e.target.value as AdminComunaZoneIn['zone'] })
            }
            className="rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm"
          >
            <option value="ohiggins">O'Higgins</option>
            <option value="centro_otros">Centro / otros</option>
            <option value="extremo">Extremo</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-tengu-ink px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white hover:bg-tengu-mustard hover:text-tengu-dark"
          >
            Agregar
          </button>
        </form>

        <div className="mt-4 overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-tengu-dark/10 bg-tengu-cream/50 text-xs uppercase tracking-wider text-tengu-dark/60">
              <tr>
                <th className="px-4 py-3 text-left">Región</th>
                <th className="px-4 py-3 text-left">Comuna</th>
                <th className="px-4 py-3 text-left">Zona</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tengu-dark/5">
              {zones.map((z) => (
                <tr key={z.id}>
                  <td className="px-4 py-3">{z.region}</td>
                  <td className="px-4 py-3 text-tengu-dark/70">{z.comuna ?? <em>(default)</em>}</td>
                  <td className="px-4 py-3">{ZONE_LABEL[z.zone] ?? z.zone}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteZone(z.id)}
                      className="text-xs text-tengu-coral hover:underline"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
