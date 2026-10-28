import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Home,
  LogIn,
  SearchX,
} from "lucide-react";

/**
 * Page 404 globale — Groupe SERMA.
 * Remplace la page par défaut « This page could not be found »
 * par une page cohérente avec l'identité du site (palette + typo CDC).
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-marine-profond text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-[0.35] pointer-events-none" aria-hidden />
      <div
        className="absolute -top-40 left-1/4 w-[520px] h-[520px] rounded-full bg-orange-logo/[0.07] blur-[130px] pointer-events-none"
        aria-hidden
      />

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 select-none">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.08] border border-white/15 shadow-md">
            <span className="font-playfair text-2xl font-black text-orange-logo">S</span>
          </span>
          <span className="flex flex-col leading-none text-left">
            <span className="font-playfair text-2xl sm:text-3xl font-black tracking-tight text-white">
              Groupe <span className="text-orange-logo">SERMA</span>
            </span>
            <span className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.22em] text-white/50 mt-1">
              Former · Structurer · Performer
            </span>
          </span>
        </div>

        {/* Bloc 404 */}
        <div className="mt-12 flex items-center gap-4">
          <span className="hidden sm:block h-px w-16 bg-white/15" aria-hidden />
          <p className="font-playfair text-[88px] sm:text-[120px] leading-none font-black tracking-tight text-orange-logo">
            404
          </p>
          <span className="hidden sm:block h-px w-16 bg-white/15" aria-hidden />
        </div>

        <div className="mt-8 inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.06] border border-white/15">
          <SearchX className="w-4 h-4 text-orange-sature" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            Page introuvable
          </span>
        </div>

        <h1 className="mt-6 font-playfair text-2xl sm:text-4xl font-black tracking-tight leading-[1.15] max-w-2xl">
          Cette page n&apos;existe pas ou a été{" "}
          <span className="text-orange-logo">déplacée.</span>
        </h1>
        <p className="mt-4 text-sm sm:text-[15px] text-white/60 leading-relaxed max-w-xl">
          L&apos;adresse que vous avez saisie ne correspond à aucune page du site.
          Vérifiez le lien, ou reprenez votre navigation depuis l&apos;une des
          sections ci-dessous.
        </p>

        {/* Navigation de secours */}
        <nav aria-label="Liens de secours" className="mt-10 w-full max-w-3xl grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/12 px-5 py-4 text-left hover:border-orange-logo/50 hover:bg-white/[0.08] transition-colors"
          >
            <Home className="w-5 h-5 text-orange-sature shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-sm font-bold">Accueil</span>
              <span className="text-[11px] text-white/45">Page d&apos;accueil du Groupe</span>
            </span>
          </Link>
          <Link
            href="/cabinet"
            className="group flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/12 px-5 py-4 text-left hover:border-orange-logo/50 hover:bg-white/[0.08] transition-colors"
          >
            <Briefcase className="w-5 h-5 text-orange-sature shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-sm font-bold">Cabinet SERMA</span>
              <span className="text-[11px] text-white/45">Expertise comptable &amp; fiscale</span>
            </span>
          </Link>
          <Link
            href="/academy"
            className="group flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/12 px-5 py-4 text-left hover:border-vert-tech/60 hover:bg-white/[0.08] transition-colors"
          >
            <GraduationCap className="w-5 h-5 text-vert-tech shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-sm font-bold">HUB Academy</span>
              <span className="text-[11px] text-white/45">Formations &amp; certifications</span>
            </span>
          </Link>
          <Link
            href="/back-office/login"
            className="group flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/12 px-5 py-4 text-left hover:border-orange-logo/50 hover:bg-white/[0.08] transition-colors"
          >
            <LogIn className="w-5 h-5 text-orange-sature shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-sm font-bold">Back-Office</span>
              <span className="text-[11px] text-white/45">Connexion espace sécurisé</span>
            </span>
          </Link>
        </nav>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-orange-logo hover:brightness-110 text-white font-bold text-sm shadow-orange transition-[filter]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
