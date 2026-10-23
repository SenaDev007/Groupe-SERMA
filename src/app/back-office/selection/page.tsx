import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { selectEntityAction } from "../actions";
import { BoLogo } from "@/components/back-office/BoLogo";
import { PwaControls } from "@/components/back-office/pwa/PwaControls";
import { BO_PATHS } from "@/lib/back-office/constants";
import {
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Building2,
  FileSpreadsheet,
  CalendarRange,
  ClipboardList,
  BookOpen,
  Star,
  ArrowRight,
  Inbox,
  Lock,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choix de l'espace — Back-Office",
  robots: { index: false, follow: false },
};

const SPACES = [
  {
    entity: "cabinet" as const,
    name: "Cabinet SERMA",
    subtitle: "Expertise Comptable & Fiscal",
    icon: Briefcase,
    description:
      "Le cockpit digital du cabinet : dossiers ONG et clients, exercices annuels, missions comptables et fiscales, éditeur de fichiers Excel, Word et PDF.",
    features: [
      { icon: HeartHandshake, label: "Dossiers ONG dédiés" },
      { icon: Building2, label: "Autres clients (entreprises, startups)" },
      { icon: CalendarRange, label: "Travaux organisés par exercice annuel" },
      { icon: FileSpreadsheet, label: "Édition Excel · Word · PDF, imports/exports" },
    ],
    accent: "bg-orange-logo",
    shadow: "shadow-orange",
  },
  {
    entity: "academy" as const,
    name: "SERMA HUB Academy",
    subtitle: "Centre de Formation Professionnelle",
    icon: GraduationCap,
    description:
      "La console de gestion de l'Academy : filières et formations publiées sur le site, inscriptions reçues, articles du blog et témoignages.",
    features: [
      { icon: ClipboardList, label: "Inscriptions reçues du site public" },
      { icon: BookOpen, label: "Filières & formations courtes" },
      { icon: Star, label: "Témoignages publiés sur le site" },
      { icon: Inbox, label: "Articles du blog & ressources" },
    ],
    accent: "bg-vert-tech",
    shadow: "shadow-[0_8px_28px_rgba(55,137,100,0.32)]",
  },
];

export default async function SelectionPage() {
  const session = await getSession();
  if (!session) redirect(BO_PATHS.login);

  return (
    <main className="min-h-screen bg-marine-profond text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-[0.35] pointer-events-none" aria-hidden />
      <div className="absolute -top-40 left-1/4 w-[520px] h-[520px] rounded-full bg-orange-logo/[0.06] blur-[130px] pointer-events-none" aria-hidden />
      <div className="absolute -bottom-40 right-1/4 w-[520px] h-[520px] rounded-full bg-vert-tech/[0.06] blur-[130px] pointer-events-none" aria-hidden />

      <div className="relative flex-1 flex flex-col items-center px-4 py-12 sm:py-16">
        <BoLogo variant="light" size="lg" />

        <div className="text-center mt-10 mb-12 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-white/[0.07] text-white/70 border border-white/15">
            <Lock className="w-3.5 h-3.5" aria-hidden />
            Espace sécurisé
          </span>
          <h1 className="mt-6 font-playfair text-3xl sm:text-4xl font-black tracking-tight leading-[1.15]">
            Bonjour {session.name.split(" ")[0]}.
            <br />
            Sur quel espace souhaitez-vous{" "}
            <span className="text-orange-logo">travailler&nbsp;?</span>
          </h1>
          <p className="mt-4 text-sm sm:text-[15px] text-white/60 leading-relaxed">
            Le Groupe SERMA réunit deux entités distinctes. Chaque back-office
            est connecté à son espace public et à ses propres données — faites
            la part des choses avant d&apos;entrer.
          </p>
        </div>

        {/* Cartes de sélection — statiques, hover bordure uniquement */}
        <div className="w-full max-w-4xl grid gap-6 md:grid-cols-2">
          {SPACES.map((space) => {
            const Icon = space.icon;
            return (
              <form
                key={space.entity}
                action={selectEntityAction.bind(null, space.entity)}
                className="group flex flex-col rounded-2xl glass-panel-bo p-7 sm:p-8 transition-colors duration-200 hover:border-orange-logo/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`flex items-center justify-center w-12 h-12 rounded-xl ${space.accent} text-white shadow-lg shrink-0`}>
                    <Icon className="w-6 h-6" aria-hidden />
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider mt-1">
                    Back-office
                  </span>
                </div>

                <h2 className="mt-5 font-playfair text-2xl font-black tracking-tight">
                  {space.name}
                </h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-sature/90 mt-1.5">
                  {space.subtitle}
                </p>
                <p className="mt-4 text-[13.5px] text-white/60 leading-relaxed">
                  {space.description}
                </p>

                <ul className="mt-5 space-y-2.5 flex-1">
                  {space.features.map((f) => {
                    const FIcon = f.icon;
                    return (
                      <li key={f.label} className="flex items-center gap-2.5 text-[13px] text-white/75">
                        <FIcon className="w-4 h-4 text-orange-sature/80 shrink-0" aria-hidden />
                        {f.label}
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="submit"
                  className={`mt-6 inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl ${space.accent} hover:brightness-110 text-white font-bold text-sm ${space.shadow} transition-[filter]`}
                >
                  Entrer dans cet espace
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </button>
              </form>
            );
          })}
        </div>

        <p className="mt-12 text-xs text-white/35 text-center">
          Vous pourrez changer d&apos;espace à tout moment depuis la barre latérale.
        </p>
      </div>
      {/* Enregistrement du service worker (application installable,
          fonctionnement hors-ligne et synchro automatique). */}
      <PwaControls variant="boot" />
    </main>
  );
}
