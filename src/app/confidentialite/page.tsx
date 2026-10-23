import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import Reveal from "@/components/shared/Reveal";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Groupe SERMA",
  description:
    "Politique de confidentialité du site Groupe SERMA : données collectées, finalités, durée de conservation et vos droits.",
  robots: { index: false },
};

export default function ConfidentialitePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gris-bleute/50 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-orange-logo/[0.08] text-orange-contrast border border-orange-logo/20 mb-5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Protection de vos données
            </span>
            <h1 className="font-playfair text-3xl sm:text-4xl font-black tracking-tight mb-6">
              Politique de confidentialité
            </h1>
            <div className="h-1 w-16 bg-orange-logo rounded-full mb-10" />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="bg-white rounded-3xl border border-marine-profond/[0.1] shadow-[0_8px_32px_rgba(12,25,61,0.07)] p-7 sm:p-10 space-y-8 text-[15px] leading-[1.8] text-gris-texte">
              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Données collectées
                </h2>
                <p>
                  Dans le cadre de nos formulaires de contact et d&apos;inscription, nous
                  collectons uniquement les données nécessaires au traitement de votre demande :
                  nom et prénom, numéro WhatsApp, adresse e-mail, ville de résidence et, selon le
                  formulaire, des informations de profil (situation professionnelle, formation
                  souhaitée, motivation). Aucune donnée sensible n&apos;est collectée.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Finalités du traitement
                </h2>
                <p>
                  Vos données sont utilisées exclusivement pour : répondre à votre demande de
                  rendez-vous (Cabinet), confirmer votre inscription et organiser votre suivi
                  pédagogique (Academy), et, le cas échéant, vous informer des prochaines cohortes
                  de formation si vous y avez consenti. Elles ne sont ni vendues, ni cédées, ni
                  utilisées à des fins publicitaires sans votre accord.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Durée de conservation
                </h2>
                <p>
                  Les données de contact sont conservées le temps nécessaire au traitement de
                  votre demande, puis archivées pour la durée des obligations légales applicables
                  à notre activité. Les données d&apos;inscription pédagogique sont conservées
                  durant votre parcours de formation et le suivi post-formation associé.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Vos droits
                </h2>
                <p>
                  Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
                  des données vous concernant. Pour l&apos;exercer, écrivez-nous à
                  contact@sermagroupe.bj ou via WhatsApp au +229 01 40 37 71 99. Nous nous
                  engageons à répondre à toute demande sous 30 jours.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-lg font-bold text-marine-profond mb-3">
                  Sécurité
                </h2>
                <p>
                  Les échanges avec nos serveurs sont chiffrés, et l&apos;accès aux données de
                contact est limité aux membres de nos équipes habilités (conseillers Cabinet,
                équipe pédagogique Academy).
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
