import { Link } from 'react-router-dom';

import { formatCLP } from '../lib/api';
import { useSiteSettings } from '../store/site';

/** Cinta superior fija de promo (estándar ecommerce). Lee de SiteSettings:
 *
 * - Si `announcement_enabled` está activo y no venció: muestra el mensaje
 *   custom con colores y link administrables (Black Friday, CyberDay, etc.).
 * - Si no, cae al modo default con los 3 mensajes de envío / tueste / despacho.
 */
export default function AnnouncementBar() {
  const settings = useSiteSettings();
  if (!settings) return null;

  // Modo custom (override total)
  const customActive =
    settings.announcement_enabled &&
    !!settings.announcement_text.trim() &&
    !announcementExpired(settings.announcement_expires_at);
  if (customActive) {
    return <CustomBar settings={settings} />;
  }

  // Modo default
  const messages: string[] = [];
  if (settings.free_shipping_threshold_clp > 0) {
    messages.push(`✨ Envío gratis sobre ${formatCLP(settings.free_shipping_threshold_clp)}`);
  }
  if (settings.roast_day) {
    messages.push(`Tostamos los ${settings.roast_day}`);
  }
  if (settings.ship_days) {
    messages.push(`Despachamos ${settings.ship_days}`);
  }
  if (messages.length === 0) return null;

  return (
    <div className="bg-tengu-ink text-tengu-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-2 text-xs tracking-wide sm:gap-5 sm:text-sm">
        {messages.map((m, i) => (
          <span key={i} className="flex items-center gap-3 whitespace-nowrap">
            {i > 0 && <span aria-hidden="true" className="hidden text-tengu-mustard sm:inline">·</span>}
            <span className={i === 0 ? '' : 'hidden sm:inline'}>{m}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function announcementExpired(iso: string | null): boolean {
  if (!iso) return false;
  // Inclusive: válido hasta el final del día indicado.
  const expiresEnd = new Date(`${iso}T23:59:59`);
  return Date.now() > expiresEnd.getTime();
}

function CustomBar({ settings }: { settings: NonNullable<ReturnType<typeof useSiteSettings>> }) {
  const text = settings.announcement_text;
  const linkUrl = settings.announcement_link_url?.trim();
  const linkLabel = settings.announcement_link_label?.trim() || 'Ver más';
  const style = {
    backgroundColor: settings.announcement_bg_color || '#E63946',
    color: settings.announcement_text_color || '#F5F1EA',
  };
  const isExternal = !!linkUrl && /^https?:\/\//i.test(linkUrl);

  return (
    <div style={style}>
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-2 text-xs font-medium tracking-wide sm:text-sm">
        <span>{text}</span>
        {linkUrl &&
          (isExternal ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener"
              className="rounded-full border border-current/40 px-3 py-0.5 text-[11px] uppercase tracking-wider hover:bg-white/10"
            >
              {linkLabel} →
            </a>
          ) : (
            <Link
              to={linkUrl}
              className="rounded-full border border-current/40 px-3 py-0.5 text-[11px] uppercase tracking-wider hover:bg-white/10"
            >
              {linkLabel} →
            </Link>
          ))}
      </div>
    </div>
  );
}
