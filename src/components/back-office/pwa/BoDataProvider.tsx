"use client";

/**
 * Amorce le moteur offline avec l'instantané rendu côté serveur
 * (layout cabinet / academy). Les pages continues de passer leurs
 * props aux vues pour le premier rendu ; dès que le moteur est prêt,
 * le store local (IndexedDB, potentiellement plus récent + mutations
 * hors-ligne) prend le relais.
 */

import { useEffect } from "react";
import { boEngine } from "@/lib/offline/engine";
import type { BoSnapshot } from "@/lib/offline/types";

export function BoDataProvider({
  snapshot,
  seedAt,
  children,
}: {
  snapshot: BoSnapshot;
  seedAt: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    void boEngine.seed(snapshot, seedAt);
    // seedAt intentionnellement stable : rendu serveur unique par chargement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
