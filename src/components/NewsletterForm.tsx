import { useState, type FormEvent } from 'react';

import { ecommerceEvents } from '../lib/analytics';
import { api } from '../lib/api';

type Variant = 'dark' | 'light';

type Props = {
  variant?: Variant;
  placeholder?: string;
  buttonLabel?: string;
};

export default function NewsletterForm({
  variant = 'dark',
  placeholder = 'tu@correo.cl',
  buttonLabel = 'Suscribirme',
}: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await api.subscribe(email.trim());
      setStatus('ok');
      setMessage(res.message);
      setEmail('');
      if (res.status === 'subscribed') ecommerceEvents.newsletterSignup();
    } catch (err) {
      setStatus('error');
      // Si lib/api ya tradujo el error a español (vía formatApiError), lo
      // mostramos. Solo si no hay mensaje, caemos al fallback genérico.
      const msg = err instanceof Error ? err.message : '';
      setMessage(msg || 'No pudimos procesar tu correo. Revísalo e intenta de nuevo.');
    }
  };

  const inputClass =
    variant === 'dark'
      ? 'flex-1 rounded-md border border-white/20 bg-transparent px-4 py-3 text-tengu-cream placeholder:text-tengu-cream/50 focus:border-tengu-mustard focus:outline-none'
      : 'flex-1 rounded-md border border-tengu-dark/15 bg-white px-4 py-3 text-tengu-dark placeholder:text-tengu-dark/40 focus:border-tengu-ink focus:outline-none';

  const buttonClass =
    'rounded-md bg-tengu-mustard px-5 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white disabled:opacity-50';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          disabled={status === 'loading'}
        />
        <button type="submit" disabled={status === 'loading'} className={buttonClass}>
          {status === 'loading' ? 'Enviando…' : buttonLabel}
        </button>
      </div>
      {message && (
        <p
          className={`mt-3 text-sm ${
            status === 'ok'
              ? variant === 'dark' ? 'text-tengu-mustard' : 'text-tengu-ink'
              : 'text-tengu-coral'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
