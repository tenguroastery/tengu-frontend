import { Link } from 'react-router-dom';

import NewsletterForm from './NewsletterForm';
import {
  InstagramIcon,
  InstagramLink,
  WhatsAppIcon,
  WhatsAppLink,
  tenguContact,
} from './SocialIcons';
import { useSiteSettings } from '../store/site';

export default function Footer() {
  const settings = useSiteSettings();
  return (
    <footer className="mt-24 bg-tengu-dark text-tengu-cream">
      {settings && (
        <div className="border-b border-white/10 bg-tengu-ink/10 py-3 text-center text-xs uppercase tracking-wider text-tengu-mustard">
          Tostamos los {settings.roast_day} · despachamos {settings.ship_days}
        </div>
      )}
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
          <p className="mb-3 font-semibold uppercase tracking-wider text-tengu-mustard">Café</p>
          <ul className="space-y-2 opacity-80">
            <li><Link to="/tienda" className="hover:text-tengu-mustard">Todos los cafés</Link></li>
            <li><Link to="/metodos/v60" className="hover:text-tengu-mustard">Método V60</Link></li>
            <li><Link to="/metodos/aeropress" className="hover:text-tengu-mustard">AeroPress</Link></li>
            <li><Link to="/metodos/espresso" className="hover:text-tengu-mustard">Espresso</Link></li>
            <li><Link to="/horeca" className="hover:text-tengu-mustard">Para tu negocio (Horeca)</Link></li>
            <li><Link to="/blog" className="hover:text-tengu-mustard">Blog</Link></li>
            <li><Link to="/sobre-nosotros" className="hover:text-tengu-mustard">Sobre nosotros</Link></li>
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
        <div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-xs opacity-60 max-w-6xl">
          <span>© {new Date().getFullYear()} Tengu Roastery</span>
          <div className="flex gap-4">
            <Link to="/sobre-nosotros" className="hover:text-tengu-mustard">Sobre nosotros</Link>
            <Link to="/privacidad" className="hover:text-tengu-mustard">Privacidad</Link>
            <Link to="/terminos" className="hover:text-tengu-mustard">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
