import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll a (0,0) en cada cambio de ruta. React Router no hace esto por
 * defecto en SPAs — el scroll queda donde estaba la página anterior. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}
