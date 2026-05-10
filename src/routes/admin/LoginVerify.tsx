import { Navigate } from 'react-router-dom';

/** Legacy route from magic-link era. Redirige al login normal. */
export default function AdminLoginVerify() {
  return <Navigate to="/admin/login" replace />;
}
