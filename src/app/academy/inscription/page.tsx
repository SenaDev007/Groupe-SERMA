import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MultiStepForm from "@/components/forms/MultiStepForm";
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
  title: "Inscription Formation — SERMA HUB Academy",
  description:
    "Rejoins la prochaine cohorte de formation pratique SERMA HUB Impact Academy. Remplis le formulaire d'inscription en 5 étapes.",
};

const STATS_CARDS = [
  {
    icon: CalendarDays,
    label: "Dates",
    value: "07 · 08 · 09 Mai 2026",
    sub: "Jeu · Ven · Sam",
  },
  {
    icon: Clock3,
    label: "Horaire",
    value: "À partir de 9h00",
    sub: "3 jours intensifs",
  },
  {
    icon: BadgeCheck,
    label: "Frais",
    value: "2 000 FCFA",
    sub: "Inscription locale",
  },
  {
    icon: Users,
    label: "Places",
    value: "10 max",
    sub: "par cohorte",
  },
];

export default function InscriptionPage() {
  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-marine-profond text-slate-300 pt-32 pb-24 overflow-hidden">
        {/* Décor premium : trame + blobs */}
        <div className="absolute inset-0 bg-grain-light opacity-50 pointer-events-none" aria-hidden />
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-orange-logo/[0.09] blur-[120px] pointer-events-none" aria-hidden />
        <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full bg-vert-tech/[0.1] blur-[110px] pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_560px] xl:grid-cols-[1fr_600px] lg:gap-12 xl:gap-14 lg:items-start">
            {/* PANNEAU GAUCHE : contexte + infos */}
            <div className="lg:sticky lg:top-28 mb-12 lg:mb-0 text-left">
              <Reveal>
                <header className="mb-8">
                  <div className="mb-3">
                    <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight text-white leading-none">
                      SERMA <span className="text-orange-logo">HUB</span>
                    </h1>
                    <p className="font-inter text-xs font-semibold tracking-[0.3em] text-vert-tech uppercase mt-2">
                      Impact Academy
                    </p>
                  </div>
                  <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mt-6 mb-3 leading-snug">
                    Candidature à la Formation Pratique
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                    Sélection sur dossier. Remplis les 5 étapes du formulaire de
                    candidature pour réserver ta place. Tu seras contacté(e)
                    sous 24h après validation.
                  </p>

                  <div className="inline-flex items-center gap-2.5 mt-5 px-4 py-2 rounded-full bg-vert-tech/10 border border-vert-tech/25">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vert-tech opacity-75" />
                      <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-vert-tech" />
                    </span>
                    <span className="text-vert-tech text-xs font-semibold">
                      Cohorte de Mai 2026 — Places très limitées
                    </span>
                  </div>
                </header>
              </Reveal>

              {/* Cartes infos */}
              <Reveal delay={0.08}>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                  {STATS_CARDS.map((card, i) => (
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

              {/* Structure des cours */}
              <Reveal delay={0.12}>
                <div className="space-y-3 glass-panel-dark rounded-3xl p-6 mb-6">
                  <p className="text-orange-logo text-xs font-bold uppercase tracking-[0.12em] flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Structure des cours
                  </p>
                  <div className="h-px bg-white/10" />
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Notre formation associe la théorie essentielle au travail
                    sur le terrain. Tu développeras ton projet pas-à-pas avec
                    nos encadrants, sur les modules :
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-logo shrink-0 mt-1.5" aria-hidden />
                      <span>
                        <strong className="text-slate-300">
                          Gestion Efficace de la Caisse
                        </strong>{" "}
                        : banque, microfinance et entreprise
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-logo shrink-0 mt-1.5" aria-hidden />
                      <span>
                        <strong className="text-slate-300">
                          Gestion de Projet OHADA
                        </strong>{" "}
                        : budgets et logiciel PERFECTO
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
                        Lieu physique des cours
                      </p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Zongo 2, axe BENI CHIC – PRESIDO, Parakou. À 100m après
                        EPP La SOURCE (direction CEG NIMA, étage à droite).
                      </p>
                      <a
                        href="tel:+2290140377199"
                        className="inline-flex items-center gap-1.5 mt-3 text-orange-logo text-xs font-bold hover:text-orange-sature hover:underline transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Assistance : +229 01 40 37 71 99
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
                <MultiStepForm />
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
