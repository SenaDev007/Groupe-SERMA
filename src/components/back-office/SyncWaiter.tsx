"use client";

/**
 * Attente de synchronisation d'un document créé hors-ligne.
 *
 * Le cockpit est offline-first : un fichier créé sans connexion n'existe
 * d'abord que dans le store local (IndexedDB), puis le moteur le rejoue
 * vers PostgreSQL dès le retour du réseau. Cette page réessaie le rendu
 * automatiquement pendant la synchronisation au lieu d'afficher un 404.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SyncWaiter({ label }: { label: string }) {
  const router = useRouter();
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (tries >= 20) return;
    const t = window.setTimeout(() => {
      setTries((n) => n + 1);
      router.refresh();
    }, 900);
    return () => window.clearTimeout(t);
  }, [tries, router]);

  return (
    <div className="max-w-xl mx-auto rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] p-10 text-center">
      <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-marine-profond/[0.05] text-marine-profond/60 mx-auto mb-5">
        {tries >= 20 ? (
          <CloudOff className="w-7 h-7" aria-hidden />
        ) : (
          <Loader2 className="w-7 h-7 animate-spin" aria-hidden />
        )}
      </span>
      <h1 className="font-playfair text-xl font-black text-marine-profond">
        {tries >= 20 ? "Synchronisation en attente" : "Synchronisation du fichier…"}
      </h1>
      <p className="mt-3 text-sm text-gris-texte leading-relaxed max-w-md mx-auto">
        {tries >= 20 ? (
          <>
            « {label} » n&apos;est pas encore arrivé sur le serveur. Vérifiez
            la connexion, puis relancez la synchronisation depuis la barre
            d&apos;état du cockpit.
          </>
        ) : (
          <>
            « {label} » vient d&apos;être créé : le moteur hors-ligne
            l&apos;enregistre sur PostgreSQL. Cette page s&apos;actualise
            automatiquement dans un instant.
          </>
        )}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            setTries(0);
            router.refresh();
          }}
        >
          Réessayer
        </Button>
        <Button asChild variant="ghost" className="h-10 text-gris-texte">
          <Link href="/back-office/cabinet/documents">Tous les documents</Link>
        </Button>
      </div>
    </div>
  );
}
