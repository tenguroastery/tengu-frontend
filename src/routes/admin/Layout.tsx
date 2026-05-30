import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { adminApi } from '../../lib/admin-api';
import { useAdmin } from '../../store/admin';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
    isActive
      ? 'bg-tengu-mustard text-tengu-dark'
      : 'text-tengu-cream/70 hover:bg-white/5 hover:text-tengu-cream'
  }`;

export default function AdminLayout() {
  const { jwt, email, role, clearSession, setRole } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!jwt) return;
    adminApi
      .me()
      .then((m) => {
        setRole(m.role);
        setVerified(true);
      })
      .catch(() => clearSession());
  }, [jwt, clearSession, setRole]);

  if (!jwt) {
    return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!verified) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-tengu-dark text-tengu-cream">
        <p className="text-sm opacity-70">Verificando sesión…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-tengu-cream">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col bg-tengu-dark text-tengu-cream md:flex">
        <Link to="/admin" className="flex items-center gap-2 px-6 py-6">
          <img src="/logo.png" alt="" className="h-8 w-auto" />
          <span className="font-display text-sm tracking-wider">ADMIN</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          <NavLink to="/admin" end className={linkClass}>📊 Dashboard</NavLink>
          <NavLink to="/admin/products" className={linkClass}>☕ Productos</NavLink>
          <NavLink to="/admin/carrusel" className={linkClass}>🖼 Carrusel</NavLink>
          <NavLink to="/admin/categories" className={linkClass}>🏷 Categorías</NavLink>
          <NavLink to="/admin/orders" className={linkClass}>📦 Pedidos</NavLink>
          <NavLink to="/admin/carritos" className={linkClass}>🛒 Carritos</NavLink>
          <NavLink to="/admin/mayorista" className={linkClass}>🏢 Mayorista</NavLink>
          <NavLink to="/admin/cupones" className={linkClass}>🎟 Cupones</NavLink>
          <NavLink to="/admin/reviews" className={linkClass}>⭐ Reseñas</NavLink>
          <NavLink to="/admin/posts" className={linkClass}>📝 Blog</NavLink>
          <NavLink to="/admin/coffee-subscriptions" className={linkClass}>🔁 Suscripciones café</NavLink>
          <NavLink to="/admin/subscriptions" className={linkClass}>✉️ Newsletter</NavLink>
          <NavLink to="/admin/shipping" className={linkClass}>🚚 Envíos</NavLink>
          <NavLink to="/admin/settings" className={linkClass}>⚙️ Configuración</NavLink>
          <NavLink to="/admin/usuarios" className={linkClass}>
            {role === 'super_admin' ? '👥 Usuarios' : '👤 Mi cuenta'}
          </NavLink>
        </nav>
        <div className="border-t border-white/10 p-4 text-xs">
          <p className="text-tengu-cream/60">Sesión</p>
          <p className="truncate">{email}</p>
          <button
            onClick={() => {
              clearSession();
              navigate('/admin/login');
            }}
            className="mt-3 w-full rounded-md border border-white/10 px-3 py-1.5 text-xs uppercase tracking-wider text-tengu-cream/70 transition hover:border-tengu-coral hover:text-tengu-coral"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
