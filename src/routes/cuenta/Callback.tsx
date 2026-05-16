import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { api } from '../../lib/api';
import { useAuth } from '../../store/auth';

export default function CuentaCallback() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const setSession = useAuth((s) => s.setSession);
  const setCustomer = useAuth((s) => s.setCustomer);

  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Link inválido o vencido.');
      return;
    }
    (async () => {
      try {
        const { jwt } = await api.verifyMagicLink(token);
        setSession(jwt);
        const me = await api.getMe(jwt);
        setCustomer(me);
        setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [token, setSession, setCustomer]);

  if (done) return <Navigate to="/cuenta" replace />;

  if (error) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl text-tengu-coral">No pudimos entrar</h1>
        <p className="mt-3 text-tengu-dark/70">{error}</p>
        <a href="/cuenta/login" className="mt-6 inline-block text-tengu-ink hover:underline">
          Pedir otro link
        </a>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-tengu-dark/10 border-t-tengu-ink" />
      <p className="mt-4 text-sm text-tengu-dark/60">Validando tu link…</p>
    </section>
  );
}
