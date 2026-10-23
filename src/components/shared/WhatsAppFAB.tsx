"use client";

import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import { buildWhatsAppUrl, WHATSAPP_MESSAGES } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

/**
 * FAB WhatsApp — halo radar vert (CDC §8 : pulse), tooltip flottant,
 * icône officielle WhatsApp, message pré-rempli contextuel selon l'espace,
 * tracking GA4 whatsapp_click.
 */
export default function WhatsAppFAB() {
  const pathname = usePathname();

  let text: string = WHATSAPP_MESSAGES.homepage;
  let context = "homepage";
  if (pathname?.startsWith("/cabinet")) {
    text = WHATSAPP_MESSAGES.cabinet;
    context = "cabinet";
  } else if (pathname?.startsWith("/academy")) {
    text = WHATSAPP_MESSAGES.academy;
    context = "academy";
  }

  const url = buildWhatsAppUrl(text);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end group">
      {/* Tooltip flottant — visible au survol */}
      <span className="mb-3 bg-white text-marine-profond px-4 py-2 rounded-full text-xs font-bold shadow-[0_8px_30px_rgba(12,25,61,0.18)] border border-marine-profond/10 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 inline-flex items-center gap-1.5">
        Une question ? Écrivez à SERMA
        <ArrowRight className="w-3 h-3 text-vert-tech" aria-hidden />
      </span>

      {/* Bouton avec halo radar + icône officielle WhatsApp */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter SERMA sur WhatsApp"
        onClick={() =>
          trackEvent("whatsapp_click", { source: "fab", context })
        }
        className="relative flex items-center justify-center w-14 h-14 bg-vert-tech hover:bg-[#2c7050] text-white rounded-full shadow-[0_12px_36px_rgba(55,137,100,0.45)] transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse-radar focus:outline-none focus-visible:ring-4 focus-visible:ring-vert-tech/40"
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>
    </div>
  );
}
