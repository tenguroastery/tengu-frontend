import { useEffect, useState } from 'react';

import { adminApi, type AdminSubscription } from '../../lib/admin-api';
import { useAdmin } from '../../store/admin';

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const jwt = useAdmin((s) => s.jwt);

  useEffect(() => {
    adminApi.listSubscriptions()
      .then(setSubs)
      .catch((err) => alert(`Error cargando suscriptores: ${err}`))
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = async () => {
    if (!jwt) return;
    // El endpoint requiere Bearer; abrimos como blob y forzamos download.
    const base = import.meta.env.VITE_API_BASE ?? '/api';
    const res = await fetch(`${base}/admin/subscriptions/export.csv`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) {
      alert('Error descargando CSV');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suscriptores-tengu-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Suscriptores</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">{subs.length} emails recolectados</p>
        </div>
        <button
          onClick={downloadCsv}
          disabled={subs.length === 0}
          className="rounded-md bg-tengu-mustard px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white disabled:opacity-50"
        >
          ↓ Exportar CSV
        </button>
      </header>

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : subs.length === 0 ? (
        <p className="mt-8 text-tengu-dark/60">Sin suscriptores aún.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-tengu-cream/40 text-left text-xs uppercase tracking-wider text-tengu-dark/60">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Inscrito</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-tengu-dark/5">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-tengu-dark/60">
                    {new Date(s.created_at).toLocaleString('es-CL')}
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
