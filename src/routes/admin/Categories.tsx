import { useEffect, useState, type FormEvent } from 'react';

import { adminApi, type AdminCategory } from '../../lib/admin-api';

export default function AdminCategories() {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // create form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const reload = () => {
    setLoading(true);
    adminApi
      .listCategoryObjects()
      .then(setCats)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await adminApi.createCategory({ name: newName.trim(), description: newDesc.trim() || undefined });
      setNewName('');
      setNewDesc('');
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  };

  const toggleVisibility = async (cat: AdminCategory) => {
    setError(null);
    try {
      const updated = await adminApi.updateCategory(cat.id, { is_visible: !cat.is_visible });
      setCats((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const updateOrder = async (cat: AdminCategory, sort_order: number) => {
    try {
      const updated = await adminApi.updateCategory(cat.id, { sort_order });
      setCats((prev) =>
        prev
          .map((c) => (c.id === cat.id ? updated : c))
          .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const renameCategory = async (cat: AdminCategory) => {
    const name = prompt(`Renombrar "${cat.name}" — esto actualiza todos los productos que la usan:`, cat.name);
    if (!name || name === cat.name) return;
    try {
      const updated = await adminApi.updateCategory(cat.id, { name: name.trim() });
      setCats((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const deleteCategory = async (cat: AdminCategory) => {
    if (cat.product_count > 0) {
      alert(`No puedes borrar "${cat.name}" porque tiene ${cat.product_count} productos. Reasígnalos primero.`);
      return;
    }
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    try {
      await adminApi.deleteCategory(cat.id);
      setCats((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 md:p-10">
      <header>
        <h1 className="font-display text-3xl">Categorías</h1>
        <p className="mt-1 text-sm text-tengu-dark/60">
          Activa/desactiva categorías completas con un toggle. Cuando una categoría está oculta,
          ninguno de sus productos aparece en la tienda — sin tener que despublicarlos uno por uno.
        </p>
      </header>

      {/* Crear categoría nueva */}
      <form
        onSubmit={handleCreate}
        className="mt-8 rounded-xl bg-white p-5 shadow-sm"
      >
        <p className="font-display text-lg">Crear categoría nueva</p>
        <p className="mt-1 text-xs text-tengu-dark/60">
          Después podrás asignarla a productos desde el formulario de producto.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <input
            type="text"
            required
            minLength={2}
            placeholder="Nombre · ej: Tazas, Equipo, Suscripciones, Decaf"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Descripción corta (opcional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="rounded-md bg-tengu-mustard px-5 py-2 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white disabled:opacity-50"
          >
            + Crear
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : cats.length === 0 ? (
        <p className="mt-8 text-tengu-dark/60">No hay categorías todavía. Crea la primera arriba.</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-tengu-cream/40 text-left text-xs uppercase tracking-wider text-tengu-dark/60">
              <tr>
                <th className="px-4 py-3 w-20">Orden</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Visible en tienda</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id} className="border-t border-tengu-dark/5">
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={c.sort_order}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== c.sort_order) updateOrder(c, v);
                      }}
                      className="w-16 rounded-md border border-tengu-dark/15 px-2 py-1 text-sm text-right"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{c.name}</p>
                    {c.description && (
                      <p className="text-xs text-tengu-dark/60">{c.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                        c.product_count === 0
                          ? 'bg-tengu-dark/10 text-tengu-dark/60'
                          : 'bg-tengu-ink/10 text-tengu-ink'
                      }`}
                    >
                      {c.product_count}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleVisibility(c)}
                      className={`inline-flex h-7 w-14 items-center rounded-full p-1 transition ${
                        c.is_visible ? 'bg-tengu-ink' : 'bg-tengu-dark/20'
                      }`}
                      aria-label={c.is_visible ? 'Ocultar de la tienda' : 'Mostrar en la tienda'}
                    >
                      <span
                        className={`block h-5 w-5 rounded-full bg-white transition ${
                          c.is_visible ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-xs text-tengu-dark/60">
                      {c.is_visible ? 'Visible' : 'Oculta'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => renameCategory(c)}
                      className="mr-3 text-xs uppercase tracking-wider text-tengu-ink hover:underline"
                    >
                      Renombrar
                    </button>
                    <button
                      onClick={() => deleteCategory(c)}
                      disabled={c.product_count > 0}
                      title={c.product_count > 0 ? 'Reasigna o borra los productos primero' : ''}
                      className="text-xs uppercase tracking-wider text-tengu-coral hover:underline disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-tengu-dark/50">
        Tip: una categoría con toggle en "Oculta" hace que sus productos no aparezcan en la tienda
        ni en `/tienda` ni en buscadores, sin tener que despublicarlos uno por uno. Útil para
        descontinuar líneas temporalmente.
      </p>
    </div>
  );
}
