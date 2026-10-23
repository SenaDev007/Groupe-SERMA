import Script from "next/script";
import { GA4_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * Google Analytics 4 (CDC §4.2) — chargé uniquement lorsque
 * NEXT_PUBLIC_GA4_MEASUREMENT_ID est défini dans l'environnement.
 * Les événements (lib/analytics → trackEvent) sont poussés dans
 * dataLayer dès à présent : ils deviennent actifs dès l'ajout de l'ID.
 */
export default function Analytics() {
  if (!GA4_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
