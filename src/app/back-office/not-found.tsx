import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  LogIn,
  SearchX,
  Shuffle,
} from "lucide-react";
import { BoLogo } from "@/components/back-office/BoLogo";

/**
 * Page 404 du back-office — Groupe SERMA.
 * Remplace la page par défaut « This page could not be found » :
 * l'utilisateur garde un accès direct à la connexion, au choix d'espace
 * et aux tableaux de bord, même sur une URL obsolète (ex. ancienne
 * route d'exercice annuel supprimée lors de la migration dossiers).
 */
export default function BackOfficeNotFound() {
  return (
    <main className="min-h-screen bg-marine-profond text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-[0.35] pointer-events-none" aria-hidden />
      <div
        className="absolute -top-40 left-1/4 w-[520px] h-[520px] rounded-full bg-orange-logo/[0.06] blur-[130px] pointer-events-none"
        aria-hidden
      />

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <BoLogo variant="light" size="lg" sub="BACK-OFFICE" />

        <div className="mt-10 flex items-center gap-4">
          <span className="hidden sm:block h-px w-16 bg-white/15" aria-hidden />
          <p className="font-playfair text-[80px] sm:text-[110px] leading-none font-black tracking-tight text-orange-logo">
            404
          </p>
          <span className="hidden sm:block h-px w-16 bg-white/15" aria-hidden />
        </div>

        <div className="mt-7 inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.06] border border-white/15">
          <SearchX className="w-4 h-4 text-orange-sature" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            Page introuvable
          </span>
        </div>

        <h1 className="mt-6 font-playfair text-2xl sm:text-3xl font-black tracking-tight leading-[1.15] max-w-2xl">
          Cette page du back-office n&apos;existe pas{" "}
          <span className="text-orange-logo">(ou plus).</span>
        </h1>
        <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xl">
          Le lien utilisé est peut-être obsolète — les exercices annuels ont par
          exemple été remplacés par l&apos;explorateur de dossiers libre.
          Revenez à un espace connu ci-dessous.
        </p>

        {/* Navigation de secours */}
        <nav aria-label="Liens de secours back-office" className="mt-10 w-full max-w-2xl grid gap-3 sm:grid-cols-3">
          <Link
            href="/back-office/login"
            className="flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/12 px-5 py-4 text-left hover:border-orange-logo/50 hover:bg-white/[0.08] transition-colors"
          >
            <LogIn className="w-5 h-5 text-orange-sature shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-sm font-bold">Connexion</span>
              <span className="text-[11px] text-white/45">Espace sécurisé</span>
            </span>
          </Link>
          <Link
            href="/back-office/selection"
            className="flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/12 px-5 py-4 text-left hover:border-orange-logo/50 hover:bg-white/[0.08] transition-colors"
          >
            <Shuffle className="w-5 h-5 text-orange-sature shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-sm font-bold">Choix d&apos;espace</span>
              <span className="text-[11px] text-white/45">Cabinet ou Academy</span>
            </span>
          </Link>
          <Link
            href="/back-office"
            className="flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/12 px-5 py-4 text-left hover:border-orange-logo/50 hover:bg-white/[0.08] transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 text-vert-tech shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-sm font-bold">Mon cockpit</span>
              <span className="text-[11px] text-white/45">Redirection automatique</span>
            </span>
          </Link>
        </nav>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-orange-logo hover:brightness-110 text-white font-bold text-sm shadow-orange transition-[filter]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Retour au site public
        </Link>
      </div>
    </main>
  );
}
