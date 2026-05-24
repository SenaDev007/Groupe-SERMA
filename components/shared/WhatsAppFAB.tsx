"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFAB() {
  const pathname = usePathname();
  const phone = "2290140377199"; // Cabinet + Academy default WhatsApp number

  // Prefilled messages based on page context
  let text = "Bonjour Groupe SERMA, j'aimerais en savoir plus sur vos activités.";
  if (pathname?.startsWith("/cabinet")) {
    text = "Bonjour Cabinet SERMA, je souhaite obtenir des renseignements sur vos services d'expertise comptable et fiscale.";
  } else if (pathname?.startsWith("/academy")) {
    text = "Bonjour SERMA HUB, je souhaite obtenir des renseignements sur vos filières de formation et les inscriptions.";
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      {/* Tooltip */}
      <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-900 border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
        Écrire à SERMA →
      </span>

      {/* Pulsing Backlight */}
      <div className="absolute inset-0 rounded-full bg-green-500/30 blur-md animate-ping" />

      {/* Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter SERMA sur WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
      >
        <MessageCircle className="w-7 h-7 fill-white text-green-500" strokeWidth={1} />
      </a>
    </div>
  );
}
