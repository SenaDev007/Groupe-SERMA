import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CabinetSermaForm from "@/components/forms/CabinetSermaForm";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import Reveal from "@/components/shared/Reveal";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  BadgeCheck,
  Users,
  MapPin,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription Formation Caissier — Cabinet SERMA",
  description:
    "Inscrivez-vous à la formation de Caissier Professionnel (Banque, Microfinance, Entreprise) dispensée par le Cabinet SERMA SARL à Parakou.",
};

const CABINET_STATS_CARDS = [
  {
    icon: CalendarDays,
    label: "Séances",
    value: "Tous les samedis",
    sub: "15h00 – 17h00",
  },
  {
    icon: Clock3,
    label: "Période",
    value: "16 Mai – 14 Juin",
    sub: "2026",
  },
  {
    icon: BadgeCheck,
    label: "Frais",
    value: "7 000 FCFA",
    sub: "Frais de départ",
  },
  {
    icon: Users,
    label: "Format",
    value: "Présentiel",
    sub: "Cabinet SERMA",
  },
];

export default function CabinetInscriptionPage() {
  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-marine-profond text-slate-300 pt-32 pb-24 overflow-hidden">
        {/* Décor premium */}
        <div className="absolute inset-0 bg-grain-light opacity-50 pointer-events-none" aria-hidden />
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-orange-logo/[0.09] blur-[120px] pointer-events-none" aria-hidden />
        <div className="absolute -bottom-32 -right-24 w-[380px] h-[380px] rounded-full bg-vert-tech/[0.1] blur-[110px] pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_560px] xl:grid-cols-[1fr_600px] lg:gap-12 xl:gap-14 lg:items-start">
            {/* PANNEAU GAUCHE */}
            <div className="lg:sticky lg:top-28 mb-12 lg:mb-0 text-left">
              <Reveal>
                <header className="mb-8">
                  <div className="mb-3">
                    <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight text-white leading-none">
                      Cabinet <span className="text-orange-logo">SERMA</span>
                    </h1>
                    <p className="font-inter text-xs font-semibold tracking-[0.3em] text-vert-tech uppercase mt-2">
                      SARL — Parakou
                    </p>
                  </div>
                  <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mt-6 mb-3 leading-snug">
                    Formation Caissier Professionnel
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                    Vous visez un poste de guichetier, caissier ou responsable de
                    caisse ? Maîtrisez toutes les tâches et procédures requises
                    en banque, microfinance ou entreprise.
                  </p>

                  <div className="inline-flex items-center gap-2.5 mt-5 px-4 py-2 rounded-full bg-orange-logo/10 border border-orange-logo/25">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-logo opacity-75" />
                      <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-orange-logo" />
                    </span>
                    <span className="text-orange-logo text-xs font-semibold">
                      Sessions en cours — Inscriptions ouvertes
                    </span>
                  </div>
                </header>
              </Reveal>

              {/* Cartes infos */}
              <Reveal delay={0.08}>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                  {CABINET_STATS_CARDS.map((card, i) => (
                    <div
                      key={i}
                      className="glass-panel-dark rounded-2xl p-3.5 text-center"
                    >
                      <card.icon className="w-5 h-5 text-orange-logo mx-auto mb-2" />
                      <p className="text-orange-logo text-[9px] font-bold uppercase tracking-wider mb-1">
                        {card.label}
                      </p>
                      <p className="text-white text-xs font-bold leading-tight">
                        {card.value}
                      </p>
                      <p className="text-slate-500 text-[9px] mt-1">{card.sub}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Programme */}
              <Reveal delay={0.12}>
                <div className="space-y-3 glass-panel-dark rounded-3xl p-6 mb-6">
                  <p className="text-orange-logo text-xs font-bold uppercase tracking-[0.12em] flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Programme d&apos;apprentissage
                  </p>
                  <div className="h-px bg-white/10" />
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Cette formation pratique dispensée par nos experts
                    comptables vous apprendra à :
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-logo shrink-0 mt-1.5" aria-hidden />
                      <span>
                        Maîtriser les encaissements et décaissements sécurisés
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-logo shrink-0 mt-1.5" aria-hidden />
                      <span>
                        Tenir et arrêter le journal de caisse quotidiennement
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-logo shrink-0 mt-1.5" aria-hidden />
                      <span>
                        Détecter les écarts, prévenir la fraude et le
                        détournement
                      </span>
                    </li>
                  </ul>
                </div>
              </Reveal>

              {/* Lieu */}
              <Reveal delay={0.16}>
                <div className="glass-panel-dark rounded-3xl p-6">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-orange-logo shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-white font-bold text-xs uppercase tracking-[0.12em] mb-1.5">
                        Lieu de formation (Cabinet)
                      </p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Zongo 2, axe BENI CHIC – PRESIDO, Parakou. (direction
                        CEG NIMA, étage à droite).
                      </p>
                      <a
                        href="tel:+2290140377199"
                        className="inline-flex items-center gap-1.5 mt-3 text-orange-logo text-xs font-bold hover:text-orange-sature hover:underline transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Contact cabinet : +229 01 40 37 71 99
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* PANNEAU DROIT : formulaire */}
            <Reveal delay={0.1}>
              <div className="bg-navy-dark/95 border border-white/[0.09] rounded-3xl p-6 sm:p-8 shadow-[0_24px_70px_rgba(5,11,26,0.6)] relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-36 h-36 bg-orange-logo/[0.07] rounded-full blur-3xl pointer-events-none" aria-hidden />
                <CabinetSermaForm />
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
