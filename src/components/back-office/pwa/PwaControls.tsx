"use client";

/**
 * Contrôles PWA du back-office :
 *  - Enregistrement du service worker (offline + cache)
 *  - Bouton « Installer sur PC » (beforeinstallprompt — Edge/Chrome)
 *  - Indicateur de synchronisation : en ligne / hors-ligne, modifications
 *    en attente, dernière synchro, erreurs, bouton « Synchroniser »
 *
 * variant="boot" : enregistrement seul (pages login/sélection).
 */

import React from "react";
import { useBoData } from "@/hooks/useBoData";
import { boEngine } from "@/lib/offline/engine";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  CloudUpload,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export function PwaControls({ variant = "full" }: { variant?: "full" | "boot" }) {
  const bo = useBoData();
  const [installEvent, setInstallEvent] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);
  const [justSynced, setJustSynced] = React.useState(false);

  // Enregistrement du service worker
  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Échec non bloquant : l'app reste utilisable en ligne
      });
    }
  }, []);

  // Disponibilité de l'installation
  React.useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    // Déjà installée ? (mode standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = React.useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  }, [installEvent]);

  const handleSync = React.useCallback(async () => {
    await boEngine.syncNow();
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 2500);
  }, []);

  if (variant === "boot") return null;

  const offline = !bo.online;
  const hasPending = bo.pending > 0;
  const hasFailed = bo.failed > 0;

  return (
    <div className="space-y-1.5">
      {/* Installer sur PC */}
      {installEvent && !installed && (
        <button
          type="button"
          onClick={handleInstall}
          className="w-full flex items-center gap-2.5 rounded-lg bg-orange-logo/15 border border-orange-logo/30 px-3 py-2.5 text-[12.5px] font-semibold text-orange-sature hover:bg-orange-logo/25 transition-colors"
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden />
          Installer sur ce PC
        </button>
      )}

      {/* Statut de connexion + synchro */}
      <div
        className={cn(
          "rounded-lg border px-3 py-2.5 text-[11.5px] leading-snug",
          offline
            ? "bg-amber-500/10 border-amber-400/30 text-amber-200/90"
            : hasFailed
              ? "bg-red-500/10 border-red-400/30 text-red-200/90"
              : hasPending || bo.syncing
                ? "bg-sky-500/10 border-sky-400/30 text-sky-200/90"
                : "bg-emerald-500/10 border-emerald-400/25 text-emerald-200/90"
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 font-semibold">
          {offline ? (
            <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden />
          ) : bo.syncing ? (
            <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" aria-hidden />
          ) : hasPending ? (
            <CloudUpload className="w-3.5 h-3.5 shrink-0" aria-hidden />
          ) : justSynced ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden />
          ) : (
            <Wifi className="w-3.5 h-3.5 shrink-0" aria-hidden />
          )}
          <span className="truncate">
            {offline
              ? "Hors-ligne"
              : bo.syncing
                ? "Synchronisation…"
                : hasPending
                  ? `${bo.pending} modification${bo.pending > 1 ? "s" : ""} en attente`
                  : hasFailed
                    ? `${bo.failed} échec${bo.failed > 1 ? "s" : ""} de synchro`
                    : "Synchronisé"}
          </span>
        </div>
        <p className="mt-1 text-white/50 normal-case font-normal">
          {offline
            ? "Enregistré sur ce PC — synchro auto au retour du réseau"
            : `Dernière synchro : ${formatTime(bo.lastSyncAt)}`}
        </p>
        {hasFailed && bo.failedErrors[0] && (
          <p className="mt-1 flex items-start gap-1.5 text-red-200/80 normal-case font-normal">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" aria-hidden />
            <span className="line-clamp-2">{bo.failedErrors[0].error}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleSync}
          disabled={offline || bo.syncing}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-white/70 hover:text-white hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", bo.syncing && "animate-spin")} aria-hidden />
          Synchroniser
        </button>
      </div>

      {/* Session expirée pendant le mode hors-ligne */}
      {bo.authRequired && (
        <a
          href="/back-office/login"
          className="flex items-center gap-2 rounded-lg bg-red-500/15 border border-red-400/30 px-3 py-2 text-[12px] font-semibold text-red-200 hover:bg-red-500/25 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />
          Session expirée — se reconnecter
        </a>
      )}
    </div>
  );
}
