import { Link } from 'react-router-dom';

import NewsletterForm from './NewsletterForm';
import {
  InstagramIcon,
  InstagramLink,
  WhatsAppIcon,
  WhatsAppLink,
  tenguContact,
} from './SocialIcons';

export default function Footer() {
  return (
    <footer className="mt-24 bg-tengu-dark text-tengu-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl tracking-wider">TENGU ROASTERY</p>
          <p className="mt-2 text-sm opacity-75">Café de Especialidad · Tostado en Chile</p>
          <p className="mt-6 text-sm uppercase tracking-wider text-tengu-mustard">
            Suscríbete al newsletter
          </p>
          <p className="mt-1 text-sm opacity-70">
            Avisos de nuevos orígenes y recetas de preparación, una vez por mes.
          </p>
          <div className="mt-4 max-w-md">
            <NewsletterForm variant="dark" buttonLabel="Quiero" />
          </div>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wider text-tengu-mustard">Tienda</p>
          <ul className="space-y-2 opacity-80">
            <li><Link to="/shop" className="hover:text-tengu-mustard">Todos los cafés</Link></li>
            <li><Link to="/shop" className="hover:text-tengu-mustard">Filtrado</Link></li>
            <li><Link to="/shop" className="hover:text-tengu-mustard">Espresso</Link></li>
            <li><Link to="/cart" className="hover:text-tengu-mustard">Carrito</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wider text-tengu-mustard">Conversemos</p>
          <ul className="space-y-3 opacity-90">
            <li>
              <WhatsAppLink className="inline-flex items-center gap-2 hover:text-tengu-mustard">
                <WhatsAppIcon size={18} />
                <span>WhatsApp</span>
              </WhatsAppLink>
            </li>
            <li>
              <InstagramLink className="inline-flex items-center gap-2 hover:text-tengu-mustard">
                <InstagramIcon size={18} />
                <span>@{tenguContact.instagram}</span>
              </InstagramLink>
            </li>
            <li>
              <a href={`tel:${tenguContact.phone}`} className="hover:text-tengu-mustard">
                {tenguContact.phoneDisplay}
              </a>
            </li>
            <li className="text-xs opacity-60">Sin endulzantes artificiales</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs opacity-50">
          <span>© {new Date().getFullYear()} Tengu Roastery</span>
          <span>Colombia · Perú · Rwanda</span>
        </div>
      </div>
    </footer>
  );
}
