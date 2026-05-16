import { formatCLP } from '../lib/api';
import { useSiteSettings } from '../store/site';

/** Cinta superior fija de promo (estándar ecommerce). Lee todo de SiteSettings
 * para que admin pueda actualizar copy sin tocar código. */
export default function AnnouncementBar() {
  const settings = useSiteSettings();
  if (!settings) return null;

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
