import type { MetadataRoute } from "next";

/**
 * Manifest PWA du back-office Groupe SERMA.
 * Installable sur PC (Edge/Chrome → « Installer l'application ») :
 * fenêtre autonome, icône Bureau/Menu démarrer, démarrage sur la connexion.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Back-Office Groupe SERMA",
    short_name: "SERMA BO",
    description:
      "Cockpit digital du Groupe SERMA : cabinet comptable et SERMA HUB Impact Academy. Fonctionne hors-ligne, synchronise automatiquement dès que la connexion revient.",
    id: "/back-office/login",
    start_url: "/back-office/login",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0C193D",
    theme_color: "#0C193D",
    lang: "fr",
    dir: "ltr",
    categories: ["business", "productivity", "finance"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Cockpit Cabinet",
        short_name: "Cabinet",
        description: "Espace de pilotage du cabinet comptable",
        url: "/back-office/cabinet",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Academy",
        short_name: "Academy",
        description: "Espace de gestion de SERMA HUB Impact Academy",
        url: "/back-office/academy",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
