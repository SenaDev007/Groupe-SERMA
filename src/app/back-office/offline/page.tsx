import { BoLogo } from "@/components/back-office/BoLogo";
import { OfflineRetryButton } from "@/components/back-office/OfflineRetryButton";
import type { Metadata } from "next";
import { WifiOff, Laptop } from "lucide-react";

export const metadata: Metadata = {
  title: "Mode hors-ligne — Back-Office SERMA",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-marine-profond text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-8">
          <BoLogo variant="light" size="lg" />
        </div>

        <div className="glass-panel-bo rounded-2xl p-8 sm:p-10">
          <span className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-logo/15 border border-orange-logo/30 mb-6">
            <WifiOff className="w-7 h-7 text-orange-sature" aria-hidden />
          </span>

          <h1 className="font-playfair text-2xl sm:text-3xl font-black tracking-tight">
            Mode hors-ligne
          </h1>
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            La connexion internet est indisponible. Vos données restent
            accessibles sur les pages déjà consultées : l&apos;application
            installée conserve une copie complète de votre cockpit sur ce PC.
          </p>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            Toute modification réalisée hors connexion est enregistrée
            localement et sera <strong className="text-white/90">synchronisée
            automatiquement</strong> vers la base distante dès le retour du réseau.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-white/40">
            <Laptop className="w-3.5 h-3.5" aria-hidden />
            <span>Application installable sur PC &middot; Windows / macOS / Linux</span>
          </div>

          <OfflineRetryButton />
        </div>
      </div>
    </main>
  );
}
