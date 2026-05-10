type IconProps = { className?: string; size?: number };

const TENGU_PHONE = '+56950013366';
const TENGU_PHONE_DISPLAY = '+569 5001 3366';
const TENGU_INSTAGRAM = 'tenguroastery';

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${TENGU_PHONE.replace(/\D/g, '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const instagramUrl = `https://instagram.com/${TENGU_INSTAGRAM}`;

export const tenguContact = {
  phone: TENGU_PHONE,
  phoneDisplay: TENGU_PHONE_DISPLAY,
  instagram: TENGU_INSTAGRAM,
};

export function InstagramIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className = '', size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.05 4.91A10 10 0 0 0 4.06 18.5L3 22l3.6-1.05A10 10 0 1 0 19.05 4.91Zm-7.04 15.42a8.34 8.34 0 0 1-4.25-1.16l-.31-.18-2.13.62.63-2.07-.2-.32a8.34 8.34 0 1 1 6.26 3.11Zm4.7-6.23c-.26-.13-1.52-.75-1.76-.83-.24-.09-.41-.13-.58.13-.18.26-.66.83-.81 1-.15.18-.3.2-.55.07a6.86 6.86 0 0 1-2.02-1.25 7.6 7.6 0 0 1-1.4-1.74c-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.18-.26.27-.43.09-.18.04-.33-.02-.46-.07-.13-.58-1.4-.8-1.92-.21-.5-.42-.43-.58-.44h-.5c-.18 0-.45.06-.69.33-.24.26-.91.89-.91 2.17 0 1.28.94 2.52 1.07 2.69.13.18 1.84 2.81 4.46 3.94.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.07 1.52-.62 1.74-1.22.22-.6.22-1.11.15-1.22-.06-.11-.24-.18-.5-.31Z" />
    </svg>
  );
}

type Props = {
  message?: string;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
};

export function WhatsAppLink({ message, className, children, ariaLabel = 'Chatear por WhatsApp' }: Props) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </a>
  );
}

export function InstagramLink({ className, children, ariaLabel = 'Síguenos en Instagram' }: Omit<Props, 'message'>) {
  return (
    <a
      href={instagramUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </a>
  );
}
