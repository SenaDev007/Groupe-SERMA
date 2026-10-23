import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import Reveal from "@/components/shared/Reveal";
import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Groupe SERMA",
  description:
    "Mentions légales du site Groupe SERMA — Cabinet SERMA SARL et SERMA HUB Impact Academy, Parakou, Bénin.",
  robots: { index: false },
};

export default function MentionsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gris-bleute/50 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-orange-logo/[0.08] text-orange-contrast border border-orange-logo/20 mb-5">
              <FileText className="w-3.5 h-3.5" />
              Informations juridiques
            </span>
            <h1 className="font-playfair text-3xl sm:text-4xl font-black tracking-tight mb-6">
              Mentions légales
            </h1>
            <div className="h-1 w-16 bg-orange-logo rounded-full mb-10" />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="bg-white rounded-3xl border border-marine-profond/[0.1] shadow-[0_8px_32px_rgba(12,25,61,0.07)] p-7 sm:p-10 space-y-8 text-[15px] leading-[1.8] text-gris-texte">
              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Éditeur du site
                </h2>
                <p>
                  Le présent site est édité par le <strong className="text-marine-profond">Groupe SERMA</strong>, groupement
                  composé du <strong className="text-marine-profond">Cabinet SERMA SARL</strong> (expertise comptable,
                  conseil fiscal et certification financière) et du centre de formation{" "}
                  <strong className="text-marine-profond">SERMA HUB Impact Academy (CFPEA)</strong>, tous deux basés à
                  Parakou, Bénin.
                </p>
                <p className="mt-3">
                  Adresse : Zongo 2, axe BENI CHIC – PRESIDO, à 100 m du carrefour après EPP La
                  SOURCE, Parakou, Bénin. Téléphone : +229 01 96 23 73 43 · WhatsApp : +229 01 40
                  37 71 99.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Responsable de la publication
                </h2>
                <p>
                  La direction du Groupe SERMA assume la responsabilité de la publication des
                  contenus du présent site. Toute demande de correction ou d&apos;information
                  complémentaire peut être adressée à contact@sermagroupe.bj.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Hébergement
                </h2>
                <p>
                  Le site est hébergé sur une infrastructure cloud sécurisée avec CDN mondial,
                  garantissant la disponibilité et la rapidité d&apos;accès depuis le Bénin comme
                  depuis l&apos;international.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Propriété intellectuelle
                </h2>
                <p>
                  L&apos;ensemble des contenus du site (textes, visuels, charte graphique, logo
                  SERMA, structure et code) est protégé par le droit de la propriété
                  intellectuelle. Toute reproduction, représentation ou adaptation, totale ou
                  partielle, sans autorisation écrite préalable du Groupe SERMA est interdite.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Limitation de responsabilité
                </h2>
                <p>
                  Les informations diffusées sur ce site, notamment les articles du blog à visée
                  pédagogique, sont fournies à titre indicatif et ne constituent pas un conseil
                  juridique ou fiscal personnalisé. Seul un rendez-vous avec l&apos;un de nos
                  experts permet une analyse adaptée à votre situation particulière.
                </p>
              </section>
            </div>
          </Reveal>
        </div>
      </main>
      <WhatsAppFAB />
      <Footer />
    </>
  );
}
