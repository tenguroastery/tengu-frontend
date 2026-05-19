import { useEffect, useState } from 'react';

/**
 * Hook que devuelve un contador que incrementa cuando la pestaña recupera
 * foco o vuelve a ser visible. Útil para gatillar refetchs sin remontar el
 * componente:
 *
 * ```ts
 * const tick = useRevalidationTick();
 * useEffect(() => {
 *   api.listProducts().then(setProducts);
 * }, [tick]);  // re-fetch al volver a la pestaña
 * ```
 *
 * Cubre el caso donde el admin actualiza un producto desde /admin y el
 * cliente con la pestaña abierta en /tienda no ve el cambio hasta F5.
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
    return () => {
      window.removeEventListener('focus', bump);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return tick;
}
