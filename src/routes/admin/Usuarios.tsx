import { useEffect, useState } from 'react';

import { adminApi, type AdminUserAccount } from '../../lib/admin-api';
import { useAdmin } from '../../store/admin';

const ROLE_LABEL: Record<AdminUserAccount['role'], string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
};

export default function AdminUsuarios() {
  const role = useAdmin((s) => s.role);
  const myEmail = useAdmin((s) => s.email);
  const isSuper = role === 'super_admin';

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl">{isSuper ? 'Usuarios' : 'Mi cuenta'}</h1>
      <p className="mt-1 text-sm text-tengu-dark/60">
        {isSuper
          ? 'Cuentas del panel. Crear, cambiar rol, activar/desactivar y resetear contraseñas.'
          : 'Cambiá tu contraseña de acceso al panel.'}
      </p>

      <MyPasswordCard />

      {isSuper && <UsersTable myEmail={myEmail} />}
    </div>
  );
}

function MyPasswordCard() {
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setMsg(null);
    setErr(null);
    if (pwd.length < 8) {
      setErr('Mínimo 8 caracteres.');
      return;
    }
    try {
      await adminApi.changeMyPassword(pwd);
      setPwd('');
      setMsg('Contraseña actualizada. La usarás en tu próximo inicio de sesión.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="mt-6 max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg">Mi contraseña</h2>
      <p className="mt-1 text-xs text-tengu-dark/60">
        Mientras no la cambies, entrás con la contraseña compartida.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Nueva contraseña (mín. 8)"
          autoComplete="new-password"
          className="flex-1 rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
        />
        <button
          onClick={save}
          className="rounded-md bg-tengu-ink px-4 py-2 text-sm font-semibold uppercase tracking-wider text-tengu-cream hover:bg-tengu-dark"
        >
          Guardar
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-tengu-ink">{msg}</p>}
      {err && <p className="mt-2 text-sm text-tengu-coral">{err}</p>}
    </div>
  );
}

function UsersTable({ myEmail }: { myEmail: string | null }) {
  const [users, setUsers] = useState<AdminUserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AdminUserAccount['role']>('admin');
  const [newPwd, setNewPwd] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.listAdminUsers().then(setUsers).catch((e) => setError(String(e))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const guard = (fn: () => Promise<unknown>) => async () => {
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const create = guard(async () => {
    if (!newEmail.trim()) throw new Error('Falta el email.');
    if (newPwd && newPwd.length < 8) throw new Error('La contraseña debe tener mínimo 8 caracteres.');
    await adminApi.createAdminUser({
      email: newEmail.trim(),
      role: newRole,
      password: newPwd || undefined,
    });
    setNewEmail('');
    setNewPwd('');
    setNewRole('admin');
    setCreating(false);
  });

  const resetPwd = (u: AdminUserAccount) => {
    const p = prompt(`Nueva contraseña para ${u.email} (mín. 8):`);
    if (!p) return;
    if (p.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    guard(() => adminApi.setAdminUserPassword(u.id, p))();
  };

  return (
    <div className="mt-10">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-xl">Cuentas del panel</h2>
        <button
          onClick={() => setCreating((v) => !v)}
          className="rounded-md bg-tengu-mustard px-4 py-2 text-xs font-semibold uppercase tracking-wider text-tengu-dark hover:bg-tengu-coral hover:text-white"
        >
          {creating ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </header>

      {error && (
        <div className="mt-3 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
          {error}
        </div>
      )}

      {creating && (
        <div className="mt-4 grid gap-3 rounded-xl border border-tengu-mustard/40 bg-tengu-cream/30 p-4 sm:grid-cols-[1fr_auto_1fr_auto]">
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@dominio.cl"
            className="rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as AdminUserAccount['role'])}
            className="rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
          <input
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Contraseña (opcional)"
            type="password"
            className="rounded-md border border-tengu-dark/15 px-3 py-2 text-sm"
          />
          <button onClick={create} className="rounded-md bg-tengu-ink px-4 py-2 text-sm font-semibold uppercase tracking-wider text-tengu-cream hover:bg-tengu-dark">
            Crear
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-tengu-dark/60">Cargando…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-tengu-dark/10 text-left text-xs uppercase tracking-wider text-tengu-dark/60">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Contraseña</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.email === myEmail?.toLowerCase();
                return (
                  <tr key={u.id} className="border-b border-tengu-dark/5">
                    <td className="px-4 py-3 font-medium">
                      {u.email}
                      {isMe && <span className="ml-2 text-[10px] uppercase tracking-wider text-tengu-mustard">vos</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isMe}
                        onChange={(e) => guard(() => adminApi.updateAdminUser(u.id, { role: e.target.value as AdminUserAccount['role'] }))()}
                        className="rounded-md border border-tengu-dark/15 bg-white px-2 py-1 text-xs disabled:opacity-50"
                      >
                        <option value="admin">{ROLE_LABEL.admin}</option>
                        <option value="super_admin">{ROLE_LABEL.super_admin}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={guard(() => adminApi.updateAdminUser(u.id, { is_active: !u.is_active }))}
                        disabled={isMe}
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 ${
                          u.is_active ? 'bg-emerald-100 text-emerald-900' : 'bg-tengu-dark/10 text-tengu-dark/60'
                        }`}
                      >
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-tengu-dark/60">
                      {u.has_password ? 'Propia' : 'Compartida'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => resetPwd(u)} className="text-xs uppercase tracking-wider text-tengu-ink hover:underline">
                        Resetear pass
                      </button>
                      {!isMe && (
                        <button
                          onClick={() => { if (confirm(`¿Borrar ${u.email}?`)) guard(() => adminApi.deleteAdminUser(u.id))(); }}
                          className="ml-3 text-xs uppercase tracking-wider text-tengu-coral hover:underline"
                        >
                          Borrar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
