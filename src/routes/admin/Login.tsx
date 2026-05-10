import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { adminApi } from '../../lib/admin-api';
import { useAdmin } from '../../store/admin';

export default function AdminLogin() {
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/admin';
  const navigate = useNavigate();
  const setSession = useAdmin((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await adminApi.login(email.trim(), password);
      setSession(res.jwt, res.email);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-tengu-dark p-6 text-tengu-cream">
      <div className="w-full max-w-md rounded-2xl bg-tengu-dark/60 p-10 ring-1 ring-white/10">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-10 w-auto" />
          <span className="font-display tracking-wider">TENGU · ADMIN</span>
        </Link>

        <form onSubmit={handleSubmit} className="mt-10">
          <h1 className="font-display text-2xl">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-tengu-cream/70">Acceso interno de Tengu Roastery.</p>

          <label className="mt-6 block">
            <span className="block text-xs uppercase tracking-wider text-tengu-cream/60">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-tengu-dark/80 px-4 py-3 text-tengu-cream focus:border-tengu-mustard focus:outline-none"
              placeholder="tu@correo.cl"
            />
          </label>

          <label className="mt-4 block">
            <span className="block text-xs uppercase tracking-wider text-tengu-cream/60">Contraseña</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-tengu-dark/80 px-4 py-3 text-tengu-cream focus:border-tengu-mustard focus:outline-none"
            />
          </label>

          {error && (
            <p className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-tengu-mustard px-5 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-cream disabled:opacity-50"
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
