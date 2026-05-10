import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { adminApi } from '../../lib/admin-api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.loginRequest(email.trim());
      setSent(true);
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

        {sent ? (
          <div className="mt-10 text-center">
            <p className="text-4xl">✉️</p>
            <h1 className="mt-3 font-display text-2xl">Revisa tu correo</h1>
            <p className="mt-3 text-sm text-tengu-cream/70">
              Si tu email está autorizado, recibirás un link de acceso. Es válido por 15 minutos y
              de un solo uso.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-xs uppercase tracking-wider text-tengu-mustard hover:underline"
            >
              Enviar a otro correo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10">
            <h1 className="font-display text-2xl">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-tengu-cream/70">
              Te enviamos un link mágico al correo. Sin contraseñas.
            </p>
            <label className="mt-6 block">
              <span className="block text-xs uppercase tracking-wider text-tengu-cream/60">
                Email
              </span>
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
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-md bg-tengu-mustard px-5 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-cream disabled:opacity-50"
            >
              {submitting ? 'Enviando…' : 'Enviarme el link'}
            </button>
            <p className="mt-6 text-center text-xs text-tengu-cream/40">
              Solo emails autorizados pueden entrar.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
