import { Link, NavLink } from 'react-router-dom';

import { InstagramIcon, InstagramLink } from './SocialIcons';
import { selectCartCount, useCart } from '../store/cart';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm uppercase tracking-wider transition-colors ${
    isActive ? 'text-tengu-mustard' : 'text-tengu-cream hover:text-tengu-mustard'
  }`;

export default function Header() {
  const count = useCart(selectCartCount);

  return (
    <header className="sticky top-0 z-40 bg-tengu-dark/95 text-tengu-cream backdrop-blur supports-[backdrop-filter]:bg-tengu-dark/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Tengu Roastery" className="h-10 w-auto" />
          <span className="hidden font-display text-lg tracking-wider sm:block">TENGU ROASTERY</span>
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7">
          <NavLink to="/" end className={navClass}>Inicio</NavLink>
          <NavLink to="/tienda" className={navClass}>Tienda</NavLink>
          <NavLink to="/suscripcion" className={navClass}>Suscripción</NavLink>
          <NavLink to="/sobre-nosotros" className={navClass}>Nosotros</NavLink>
          <NavLink to="/blog" className={navClass}>Blog</NavLink>
          <InstagramLink className="text-tengu-cream/70 transition hover:text-tengu-mustard">
            <InstagramIcon size={20} />
          </InstagramLink>
          <NavLink to="/carrito" className={navClass}>
            <span className="inline-flex items-center gap-2">
              <CartIcon />
              {count > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-tengu-mustard px-1.5 text-xs font-bold text-tengu-dark">
                  {count}
                </span>
              )}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3h2l2.4 12.5a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 2-1.6L21 8H6" />
      <circle cx="9" cy="21" r="1.5" />
      <circle cx="18" cy="21" r="1.5" />
    </svg>
  );
}
