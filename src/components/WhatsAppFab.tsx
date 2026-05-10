import { WhatsAppIcon, WhatsAppLink } from './SocialIcons';

export default function WhatsAppFab() {
  return (
    <WhatsAppLink
      message="Hola Tengu! Tengo una pregunta:"
      ariaLabel="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5c]"
    >
      <WhatsAppIcon size={22} />
      <span className="hidden text-sm font-semibold uppercase tracking-wider sm:inline">WhatsApp</span>
    </WhatsAppLink>
  );
}
