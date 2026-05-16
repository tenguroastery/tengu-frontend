import { useEffect, useState } from 'react';

import { api } from '../lib/api';
import type { SiteSettings } from '../types';

// Cache de módulo para no fetcheár en cada componente. La primera llamada
// fetchea; el resto suscribe al cache.
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

/** Hook para leer settings. Re-render automático cuando el cache se llena. */
export function useSiteSettings(): SiteSettings | null {
  const [value, setValue] = useState<SiteSettings | null>(cached);

  useEffect(() => {
    if (cached) return;
    let mounted = true;
    const cb = (s: SiteSettings) => mounted && setValue(s);
    subscribers.add(cb);
    fetchOnce().catch(() => undefined);
    return () => {
      mounted = false;
      subscribers.delete(cb);
    };
  }, []);

  return value;
}
