import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { adminApi } from '../../lib/admin-api';
import { useAdmin } from '../../store/admin';

export default function AdminLoginVerify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAdmin((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setError('Falta el token en el link.');
      return;
    }
    adminApi
      .loginVerify(token)
      .then((res) => {
        setSession(res.jwt, res.email);
        navigate('/admin', { replace: true });
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [params, setSession, navigate]);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-tengu-dark p-6 text-tengu-cream">
        <div className="max-w-md text-center">
          <p className="text-4xl">⚠️</p>
          <h1 className="mt-3 font-display text-2xl text-tengu-coral">Link inválido</h1>
          <p className="mt-3 text-sm text-tengu-cream/70">{error}</p>
          <Link to="/admin/login" className="mt-6 inline-block text-tengu-mustard hover:underline">
            Solicitar otro link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-tengu-dark p-6 text-tengu-cream">
      <p className="text-sm opacity-70">Validando link…</p>
    </div>
  );
}
