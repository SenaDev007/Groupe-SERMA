/**
 * Analytics — Google Analytics 4 (CDC §4.2 & §7.3).
 *
 * Les événements sont poussés dans `window.dataLayer` dès à présent
 * (observables en console / debug). Dès que l'ID de mesure GA4 est fourni
 * via NEXT_PUBLIC_GA4_MEASUREMENT_ID, le tag est chargé (composant
 * Analytics dans layout.tsx) et les événements sont transmis.
 *
 * Événements attendus (CDC §7.3) :
 *  - form_start            (étape 1 commencée)
 *  - form_step_2..5        (progression funnel / abandon)
 *  - inscription_submitted (conversion principale Academy)
 *  - rdv_cabinet_submitted (conversion principale Cabinet)
 *  - whatsapp_click        avec propriété `source`
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

/** ID de mesure GA4 (vide si non configuré — les events restent en dataLayer). */
export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";

/** Envoie un événement GA4 (via gtag si disponible, sinon dataLayer seul). */
export function trackEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}
