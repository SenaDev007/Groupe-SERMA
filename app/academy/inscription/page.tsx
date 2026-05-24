import { Header } from "@/components/ui/header-2";
import Footer4Col from "@/components/ui/footer-column";
import MultiStepForm from "@/components/MultiStepForm";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import { BookOpen, CalendarDays, Clock3, BadgeCheck, Users, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Inscription Formation — SERMA HUB Academy",
  description: "Rejoins la prochaine cohorte de formation pratique SERMA HUB Impact Academy. Remplis le formulaire d'inscription en 5 étapes.",
};

const STATS_CARDS = [
  {
    icon: <CalendarDays className="w-5 h-5 text-orange-logo mx-auto" />,
    label: "Dates",
    value: "07 · 08 · 09 Mai 2026",
    sub: "Jeu · Ven · Sam",
  },
  {
    icon: <Clock3 className="w-5 h-5 text-orange-logo mx-auto" />,
    label: "Horaire",
    value: "À partir de 9h00",
    sub: "3 jours intensifs",
  },
  {
    icon: <BadgeCheck className="w-5 h-5 text-orange-logo mx-auto" />,
    label: "Frais",
    value: "2 000 FCFA",
    sub: "Inscription locale",
  },
  {
    icon: <Users className="w-5 h-5 text-orange-logo mx-auto" />,
    label: "Places",
    value: "10 max",
    sub: "par cohorte",
  },
];

export default function InscriptionPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-navy bg-hero-gradient text-slate-300 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="lg:grid lg:grid-cols-[1fr_540px] xl:grid-cols-[1fr_580px] lg:gap-10 xl:gap-14 lg:items-start mt-8">
            
            {/* LEFT PANEL: Context and Info */}
            <div className="lg:sticky lg:top-24 mb-10 lg:mb-0 text-left">
              <header className="mb-8">
                <div className="mb-3">
                  <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight text-white leading-none">
                    SERMA <span className="text-orange-logo">HUB</span>
                  </h1>
                  <p className="font-mono text-xs font-semibold tracking-[4px] text-vert-tech uppercase mt-1">
                    Impact Academy
                  </p>
                </div>
                <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mt-5 mb-3 leading-snug">
                  Candidature à la Formation Pratique
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                  Sélection sur dossier. Remplis les 5 étapes du formulaire de candidature pour réserver ta place. Tu seras contacté(e) sous 24h après validation.
                </p>
                
                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-vert-tech/10 border border-vert-tech/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-vert-tech animate-pulse" />
                  <span className="text-vert-tech text-xs font-semibold">
                    Cohorte de Mai 2026 — Places très limitées
                  </span>
                </div>
              </header>

              {/* Stats/Details Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                {STATS_CARDS.map((card, i) => (
                  <div
                    key={i}
                    className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center"
                  >
                    <div className="mb-1.5">{card.icon}</div>
                    <p className="text-orange-logo text-[9px] font-bold uppercase tracking-wider mb-0.5">
                      {card.label}
                    </p>
                    <p className="text-white text-xs font-bold leading-tight">
                      {card.value}
                    </p>
                    <p className="text-slate-500 text-[9px] mt-0.5">
                      {card.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Training details card */}
              <div className="space-y-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-6">
                <p className="text-orange-logo text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Structure des cours
                </p>
                <div className="h-px bg-white/[0.05]" />
                <p className="text-slate-300 text-xs leading-relaxed">
                  Notre formation associe la théorie essentielle au travail sur le terrain. Tu développeras ton projet pas-à-pas avec nos encadrants, sur les modules :
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-logo mt-0.5">•</span>
                    <span><strong>Gestion Efficace de la Caisse</strong> : banque, microfinance et entreprise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-logo mt-0.5">•</span>
                    <span><strong>Gestion de Projet OHADA</strong> : budgets et logiciel PERFECTO</span>
                  </li>
                </ul>
              </div>

              {/* Location Card */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-logo flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-white font-bold text-xs uppercase tracking-wider mb-1">
                      Lieu physique des cours
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Zongo 2, axe BENI CHIC – PRESIDO, Parakou.
                      À 100m après EPP La SOURCE (direction CEG NIMA, étage à droite).
                    </p>
                    <a
                      href="tel:+2290140377199"
                      className="inline-flex items-center gap-1.5 mt-3 text-orange-logo text-xs font-bold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Assistance : +229 01 40 37 71 99
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Form Container */}
            <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left">
              {/* Highlight background blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-logo/5 rounded-full blur-2xl pointer-events-none" />
              <MultiStepForm />
            </div>

          </div>
        </div>
      </main>

      <WhatsAppFAB />
      <Footer4Col />
    </>
  );
}
