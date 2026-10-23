"use client";

/**
 * Hook d'accès au store offline-first du back-office.
 * - Rendu serveur / avant init : ready = false → les vues retombent
 *   sur leurs props SSR.
 * - Après init : snapshot local (IndexedDB) toujours disponible,
 *   même sans connexion.
 */

import { useEffect, useSyncExternalStore } from "react";
import { boEngine, type BoEngineState } from "@/lib/offline/engine";

export function useBoData(): BoEngineState {
  const state = useSyncExternalStore(
    boEngine.subscribe,
    boEngine.getSnapshot,
    boEngine.getServerSnapshot
  );

  useEffect(() => {
    void boEngine.ensureInit();
  }, []);

  return state;
}
