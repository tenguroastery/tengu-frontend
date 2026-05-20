import { useEffect, useState } from 'react';

const INVALIDATE_CHANNEL = 'tengu:invalidate';

/**
 * Hook que devuelve un contador que incrementa cuando hay que revalidar:
 * (a) la pestaña recupera foco o vuelve a ser visible,
 * (b) otra pestaña/tab emitió `notifyInvalidation()` (típicamente, admin
 *     guardó un producto/categoría/settings y avisa al sitio público).
 *
 * ```ts
 * const tick = useRevalidationTick();
 * useEffect(() => {
 *   api.listProducts().then(setProducts);
 * }, [tick]);
 * ```
 */
export function useRevalidationTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const onVisible = () => {
      if (document.visibilityState === 'visible') bump();
    };
    window.addEventListener('focus', bump);
    document.addEventListener('visibilitychange', onVisible);

    // BroadcastChannel: notificaciones in-vivo entre pestañas del mismo
    // origen (admin → público). Si el browser no soporta, degradamos a
    // storage events (compatible incluso en Safari viejo).
    let channel: BroadcastChannel | null = null;
    let onStorage: ((e: StorageEvent) => void) | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(INVALIDATE_CHANNEL);
      channel.onmessage = () => bump();
    } else {
      onStorage = (e) => {
        if (e.key === INVALIDATE_CHANNEL) bump();
      };
      window.addEventListener('storage', onStorage);
    }

    return () => {
      window.removeEventListener('focus', bump);
      document.removeEventListener('visibilitychange', onVisible);
      if (channel) channel.close();
      if (onStorage) window.removeEventListener('storage', onStorage);
    };
  }, []);
  return tick;
}

/**
 * Avisa a todas las pestañas del mismo origen que invaliden caches.
 * Llamar después de cualquier mutación admin que cambie data pública
 * (productos, categorías, settings, posts, shipping).
 *
 * Funciona aunque la pestaña que recibe la notificación no esté en foco.
 */
export function notifyInvalidation(): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(INVALIDATE_CHANNEL);
      ch.postMessage({ ts: Date.now() });
      ch.close();
    } else if (typeof localStorage !== 'undefined') {
      // Fallback: localStorage emite storage event en otras pestañas.
      localStorage.setItem(INVALIDATE_CHANNEL, String(Date.now()));
    }
  } catch {
    /* swallow — no es crítico si falla */
  }
}
