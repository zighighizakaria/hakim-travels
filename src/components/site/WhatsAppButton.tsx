import type { ReactNode } from "react";
import { useT } from "@/i18n/useI18n";
import { useWhatsApp } from "./useSite";

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 1 1 6.98 3.86z" />
    </svg>
  );
}

/**
 * Lien WhatsApp avec message prérempli. Rien n'est rendu si `href` est nul
 * (aucun numéro valide dans les réglages).
 */
export function WhatsAppButton({
  href,
  className,
  iconClassName = "h-[1.15rem] w-[1.15rem]",
  children,
}: {
  /** URL wa.me complète, obtenue via `useWhatsApp()`. */
  href: string | null;
  className: string;
  iconClassName?: string;
  children: ReactNode;
}) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <WhatsAppIcon className={iconClassName} />
      {children}
    </a>
  );
}

export function FloatingWhatsApp() {
  const t = useT();
  const wa = useWhatsApp();
  const href = wa.general();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.common.whatsappContact}
      className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 focus-visible:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
