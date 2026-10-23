"use client";

import { RefreshCw } from "lucide-react";

/**
 * Bouton « Réessayer » de la page hors-ligne.
 * Composant client séparé : la page parente reste un Server Component
 * (export de metadata) et ne peut pas contenir de handler d'événement.
 */
export function OfflineRetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-8 inline-flex items-center gap-2 rounded-lg bg-orange-logo hover:bg-orange-sature text-white font-semibold text-sm px-5 h-11 transition-colors"
    >
      <RefreshCw className="w-4 h-4" aria-hidden />
      Réessayer
    </button>
  );
}
