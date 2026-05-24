import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Groupe SERMA — Expertise Comptable & Formation Professionnelle | Parakou Bénin",
  description:
    "Cabinet SERMA SARL : expertise comptable OHADA, certification. SERMA HUB Academy : 5 filières de formation pratique. Parakou, Bénin.",
  openGraph: {
    title: "Groupe SERMA — Parakou, Bénin",
    description: "Expertise Comptable B2B & Formation Professionnelle Pratique. L'alliance de la conformité et de la compétence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${dmSans.variable} ${inter.variable}`}
    >
      <body className="font-dmsans bg-marine-profond text-slate-300 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
