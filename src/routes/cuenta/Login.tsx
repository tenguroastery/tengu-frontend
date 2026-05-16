import { useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../../lib/api';

export default function CuentaLogin() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.requestMagicLink(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-5xl">📬</p>
        <h1 className="mt-6 font-display text-3xl text-tengu-ink">Revisa tu correo</h1>
        <p className="mt-3 text-tengu-dark/70">
          Te mandamos un link para entrar a <strong>{email}</strong>. Vence en 15 minutos.
        </p>
        <p className="mt-2 text-xs text-tengu-dark/50">
          Si no llega, mira en spam o vuelve a pedirlo.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 text-sm text-tengu-ink underline hover:text-tengu-coral"
        >
          Usar otro email
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-3xl">Entrar a tu cuenta</h1>
      <p className="mt-2 text-sm text-tengu-dark/70">
        Te mandamos un link mágico al correo. Sin contraseña.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-tengu-dark/70">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hola@tucorreo.cl"
            className="w-full rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm focus:border-tengu-ink focus:outline-none"
          />
        </label>

        {error && (
          <div className="rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !email}
          className="w-full rounded-md bg-tengu-ink px-4 py-3 font-semibold uppercase tracking-wider text-white transition hover:bg-tengu-mustard hover:text-tengu-dark disabled:opacity-50"
        >
          {submitting ? 'Enviando…' : 'Enviarme el link'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-tengu-dark/50">
        ¿Aún no compras? <Link to="/tienda" className="text-tengu-ink hover:underline">Mira el catálogo</Link>
      </p>
    </section>
  );
}
