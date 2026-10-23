"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface WhatsAppLinkProps {
  /** URL wa.me complète — construite via lib/whatsapp (message pré-rempli) */
  href: string;
  /** Source du clic pour l'événement GA4 `whatsapp_click` (homepage, cabinet, academy, fab, footer…) */
  source: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Lien WhatsApp unifié : ouverture wa.me (nouvel onglet) +
 * tracking GA4 `whatsapp_click` avec propriété `source` (CDC §7.3).
 * Le contenu (icône officielle + texte) est passé en children.
 */
export default function WhatsAppLink({
  href,
  source,
  children,
  className,
  ariaLabel,
  onClick,
}: WhatsAppLinkProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    trackEvent("whatsapp_click", { source });
    onClick?.(event);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
