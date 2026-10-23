import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, Inter } from "next/font/google";
import Analytics from "@/components/shared/Analytics";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://sermagroupe.bj";

/* JSON-LD Schema.org — SEO local Parakou (CDC Phase 6 : Metadata · Schema.org) */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Groupe SERMA",
      url: SITE_URL,
      slogan: "Former. Structurer. Performer.",
      email: "contact@sermagroupe.bj",
      telephone: "+229 01 96 23 73 43",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Zongo 2, axe BENI CHIC – PRESIDO",
        addressLocality: "Parakou",
        addressCountry: "BJ",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+229 01 40 37 71 99",
          contactType: "customer service",
          areaServed: "BJ",
          availableLanguage: ["fr"],
        },
      ],
    },
    {
      "@type": "AccountingService",
      "@id": `${SITE_URL}/cabinet#business`,
      name: "Cabinet SERMA SARL",
      description:
        "Expertise comptable OHADA, certification des états financiers, conseil fiscal et social. Entreprises, ONG, startups à Parakou, Bénin.",
      url: `${SITE_URL}/cabinet`,
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
      telephone: "+229 01 40 37 71 99",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Zongo 2, axe BENI CHIC – PRESIDO",
        addressLocality: "Parakou",
        addressCountry: "BJ",
      },
      areaServed: { "@type": "Country", name: "Bénin" },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/academy#business`,
      name: "SERMA HUB Impact Academy",
      alternateName: "CFPEA",
      description:
        "Centre de formation professionnelle et d'entrepreneuriat appliqué à Parakou. 5 filières métiers et formations comptables certifiantes.",
      url: `${SITE_URL}/academy`,
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
      telephone: "+229 01 40 37 71 99",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Zongo 2, axe BENI CHIC – PRESIDO, 100m après EPP La SOURCE",
        addressLocality: "Parakou",
        addressCountry: "BJ",
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Groupe SERMA — Expertise Comptable & Formation Professionnelle | Parakou Bénin",
    template: "%s | Groupe SERMA",
  },
  description:
    "Cabinet SERMA SARL : expertise comptable OHADA, certification. SERMA HUB Academy : 5 filières de formation pratique. Parakou, Bénin.",
  keywords: [
    "expertise comptable Parakou",
    "cabinet comptable Bénin",
    "formation professionnelle Parakou",
    "formation comptabilité Bénin",
    "SYSCOHADA formation Bénin",
    "OHADA comptabilité Bénin",
  ],
  openGraph: {
    title: "Groupe SERMA — Parakou, Bénin",
    description:
      "Expertise Comptable B2B & Formation Professionnelle Pratique. L'alliance de la conformité et de la compétence.",
    type: "website",
    locale: "fr_FR",
    siteName: "Groupe SERMA",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Groupe SERMA — Parakou, Bénin",
    description:
      "Expertise Comptable B2B & Formation Professionnelle Pratique.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0C193D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${dmSans.variable} ${inter.variable}`}
    >
      <body className="font-dmsans bg-white text-marine-profond antialiased min-h-screen flex flex-col">
        {/* SEO — données structurées Schema.org (Groupe + Cabinet + Academy) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics 4 — actif dès que NEXT_PUBLIC_GA4_MEASUREMENT_ID est défini */}
        <Analytics />
        {children}
      </body>
    </html>
  );
}
