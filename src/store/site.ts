import { useEffect, useState } from 'react';

import { api } from '../lib/api';
import type { SiteSettings } from '../types';

// Cache de módulo para no fetcheár en cada componente. La primera llamada
// fetchea; el resto suscribe al cache. Cuando la pestaña recupera foco,
// invalidamos para reflejar cambios admin sin requerir F5.
let cached: SiteSettings | null = null;
let inflight: Promise<SiteSettings> | null = null;
const subscribers = new Set<(s: SiteSettings) => void>();

function fetchOnce(): Promise<SiteSettings> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = api
    .getSiteSettings()
    .then((s) => {
      cached = s;
      inflight = null;
      subscribers.forEach((cb) => cb(s));
      return s;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

function refetch(): void {
  inflight = null;
  api
    .getSiteSettings()
    .then((s) => {
      cached = s;
      subscribers.forEach((cb) => cb(s));
    })
    .catch(() => undefined);
}

// Registro global de un solo listener: cuando la pestaña recupera foco,
// refetcheamos. Idempotente: el módulo se carga una sola vez.
if (typeof window !== 'undefined') {
  window.addEventListener('focus', refetch);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refetch();
  });
}

/** Hook para leer settings. Re-render automático cuando el cache se llena. */
export function useSiteSettings(): SiteSettings | null {
  const [value, setValue] = useState<SiteSettings | null>(cached);

  useEffect(() => {
    let mounted = true;
    const cb = (s: SiteSettings) => mounted && setValue(s);
    subscribers.add(cb);
    fetchOnce()
      .then((s) => mounted && setValue(s))
      .catch(() => undefined);
    return () => {
      mounted = false;
      subscribers.delete(cb);
    };
  }, []);

  return value;
}
