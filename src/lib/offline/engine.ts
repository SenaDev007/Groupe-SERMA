/**
 * MOTEUR DE SYNCHRONISATION OFFLINE-FIRST — Back-Office Groupe SERMA.
 *
 * Principe :
 *  1. Les données sont dupliquées localement (IndexedDB) → l'application
 *     installée sur PC fonctionne intégralement sans connexion.
 *  2. Toute modification est appliquée localement PUIS mise en file
 *     d'attente (outbox).
 *  3. Dès que la connexion est disponible (événement « online », retour
 *     de visibilité, tic 30 s, background sync), la file est envoyée à
 *     /api/back-office/mutations qui la rejoue sur PostgreSQL (Neon) et
 *     renvoie un instantané à jour → réconciliation automatique.
 *
 * Stratégie de conflit : le serveur applique les mutations dans l'ordre ;
 * l'instantané serveur fait foi, puis les mutations LOCALES encore en
 * attente sont ré-appliquées par-dessus (aucune perte de travail local).
 */

import {
  blobDelete,
  blobGet,
  isBrowser,
  kvGet,
  kvSet,
  outboxAll,
  outboxDelete,
  outboxPut,
  wipeLocalDatabase,
} from "./idb";
import { applyMutationLocal } from "./mutations";
import type { BoMutation, BoSnapshot, OutboxEntry } from "./types";

export interface BoEngineState {
  ready: boolean;
  online: boolean;
  syncing: boolean;
  snapshot: BoSnapshot | null;
  pending: number;
  failed: number;
  failedErrors: { type: string; error: string }[];
  lastSyncAt: string | null;
  authRequired: boolean;
}

const EMPTY_STATE: BoEngineState = {
  ready: false,
  online: true,
  syncing: false,
  snapshot: null,
  pending: 0,
  failed: 0,
  failedErrors: [],
  lastSyncAt: null,
  authRequired: false,
};

const SNAPSHOT_KEY = "snapshot";
const META_KEY = "meta";
const SYNC_INTERVAL_MS = 30_000;

function nowIso(): string {
  return new Date().toISOString();
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

class BoEngine {
  private state: BoEngineState = { ...EMPTY_STATE };
  private listeners = new Set<() => void>();
  private initPromise: Promise<void> | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private pulledAt = "";
  private flushing = false;

  // ── React store (useSyncExternalStore) ─────────────────────

  subscribe = (cb: () => void): (() => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  getSnapshot = (): BoEngineState => this.state;

  getServerSnapshot = (): BoEngineState => EMPTY_STATE;

  private emit(patch: Partial<BoEngineState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  // ── Initialisation ─────────────────────────────────────────

  ensureInit(): Promise<void> {
    if (!isBrowser()) return Promise.resolve();
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.init();
    return this.initPromise;
  }

  private async init(): Promise<void> {
    try {
      const snapshot = await kvGet<BoSnapshot>(SNAPSHOT_KEY);
      const meta = await kvGet<{ pulledAt: string }>(META_KEY);
      const entries = await outboxAll();
      // Snapshot d'une version antérieure du schéma (avant l'arborescence
      // libre de dossiers) → ignoré : il sera ré-amorcé depuis le serveur.
      const stale = !!snapshot && !Array.isArray((snapshot as BoSnapshot).folders);
      this.pulledAt = meta?.pulledAt ?? "";
      this.emit({
        ready: true,
        online: navigator.onLine,
        snapshot: snapshot && !stale ? snapshot : null,
        lastSyncAt: meta?.pulledAt ?? null,
        pending: entries.filter((e) => e.status === "PENDING").length,
        failed: entries.filter((e) => e.status === "FAILED").length,
        failedErrors: entries
          .filter((e) => e.status === "FAILED")
          .map((e) => ({ type: e.type, error: e.error ?? "Erreur" })),
      });
    } catch {
      this.emit({ ready: true });
    }

    // Connexion revenue → synchronisation immédiate
    window.addEventListener("online", () => {
      this.emit({ online: true, authRequired: false });
      void this.flush();
    });
    window.addEventListener("offline", () => {
      this.emit({ online: false });
    });
    // Retour sur l'onglet / la fenêtre de l'app installée
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void this.flush();
      }
    });
    // Message du service worker (background sync)
    navigator.serviceWorker?.addEventListener("message", (ev) => {
      if (ev.data?.type === "BO_FLUSH") void this.flush();
    });
    // Tic régulier : pousse la file + rafraîchit les données distantes
    this.timer = setInterval(() => {
      if (navigator.onLine) void this.flush();
    }, SYNC_INTERVAL_MS);

    if (navigator.onLine) void this.flush();
  }

  // ── Amorçage depuis le rendu serveur ───────────────────────

  /**
   * Appelé par <BoDataProvider> avec l'instantané rendu côté serveur.
   * Ignoré si des mutations locales sont en attente (le local est en avance).
   */
  async seed(snapshot: BoSnapshot, seedAt: string): Promise<void> {
    if (!isBrowser() || !snapshot) return;
    await this.ensureInit();
    // Le rendu serveur authentifié (layout) prouve que la session est valide.
    this.emit({ authRequired: false });
    const entries = await outboxAll();
    if (entries.some((e) => e.status === "PENDING")) return;
    if (seedAt <= this.pulledAt) return; // local plus récent
    this.pulledAt = seedAt;
    await kvSet(SNAPSHOT_KEY, snapshot);
    await kvSet(META_KEY, { pulledAt: seedAt });
    this.emit({ snapshot, lastSyncAt: seedAt });
  }

  // ── Mutation locale + file d'attente ───────────────────────

  /**
   * Applique une modification localement (immédiat, même hors-ligne)
   * puis tente de la synchroniser si la connexion est disponible.
   */
  async mutate(m: BoMutation): Promise<void> {
    if (!isBrowser()) return;
    await this.ensureInit();

    let snapshot = this.state.snapshot;
    if (!snapshot) {
      // premier usage sans amorçage : snapshot vide
      snapshot = {
        clients: [],
        folders: [],
        workItems: [],
        documents: [],
        submissions: [],
        formations: [],
        articles: [],
        testimonials: [],
      };
    }
    const next = applyMutationLocal(snapshot, m);
    await kvSet(SNAPSHOT_KEY, next);

    const entry: OutboxEntry = {
      id: m.id,
      type: m.type,
      createdAt: m.createdAt,
      payload: m.payload,
      status: "PENDING",
      attempts: 0,
    };
    await outboxPut(entry);

    const entries = await outboxAll();
    this.emit({
      snapshot: next,
      pending: entries.filter((e) => e.status === "PENDING").length,
      failed: entries.filter((e) => e.status === "FAILED").length,
    });

    if (navigator.onLine) {
      void this.flush();
    } else {
      void this.registerBackgroundSync();
    }
  }

  /** Réveil du service worker dès le retour du réseau (Background Sync). */
  private async registerBackgroundSync(): Promise<void> {
    try {
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        await (reg as ServiceWorkerRegistration & {
          sync: { register: (tag: string) => Promise<void> };
        }).sync.register("bo-flush");
      }
    } catch {
      // API absente (ex. Firefox) → les événements online/tic couvrent ce cas
    }
  }

  /** Génère un identifiant local unique (stable jusqu'à la synchro). */
  newId(prefix = "loc"): string {
    const rnd =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
        : Math.random().toString(36).slice(2, 14);
    return `${prefix}_${Date.now().toString(36)}_${rnd}`;
  }

  // ── Synchronisation ────────────────────────────────────────

  /** Bouton « Synchroniser maintenant » : relance aussi les échecs. */
  async syncNow(): Promise<void> {
    if (!isBrowser()) return;
    await this.ensureInit();
    const entries = await outboxAll();
    for (const e of entries.filter((x) => x.status === "FAILED")) {
      await outboxPut({ ...e, status: "PENDING", error: undefined, attempts: 0 });
    }
    this.emit({ failed: 0, failedErrors: [], authRequired: false });
    await this.flush();
  }

  private async flush(): Promise<void> {
    if (!isBrowser() || this.flushing || !navigator.onLine) return;
    if (this.state.authRequired) return;
    this.flushing = true;
    this.emit({ syncing: true });
    try {
      const entries = (await outboxAll())
        .filter((e) => e.status === "PENDING")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

      if (entries.length === 0) {
        await this.pull();
        return;
      }

      // Pièces jointes des imports hors-ligne → base64
      const outgoing: {
        id: string;
        type: string;
        createdAt: string;
        payload: unknown;
        fileBase64?: string;
      }[] = [];
      for (const e of entries) {
        let fileBase64: string | undefined;
        const p = e.payload as { blobKey?: string };
        if (e.type === "document.import" && p?.blobKey) {
          const blob = await blobGet(p.blobKey);
          if (blob) fileBase64 = await blobToBase64(blob);
        }
        outgoing.push({ id: e.id, type: e.type, createdAt: e.createdAt, payload: e.payload, fileBase64 });
      }

      const res = await fetch("/api/back-office/mutations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mutations: outgoing }),
      });

      if (res.status === 401) {
        if (this.state.snapshot) this.emit({ authRequired: true });
        return;
      }
      if (!res.ok) return; // erreur serveur transitoire → rechec au prochain tic

      const data = (await res.json()) as {
        results: { id: string; ok: boolean; error?: string }[];
        serverTime: string;
        snapshot: BoSnapshot;
      };

      // Acquittements
      for (const r of data.results) {
        const entry = entries.find((e) => e.id === r.id);
        if (!entry) continue;
        if (r.ok) {
          await outboxDelete(r.id);
          const p = entry.payload as { blobKey?: string };
          if (entry.type === "document.import" && p?.blobKey) {
            await blobDelete(p.blobKey);
          }
        } else {
          await outboxPut({
            ...entry,
            status: "FAILED",
            error: r.error ?? "Erreur inconnue",
            attempts: entry.attempts + 1,
          });
        }
      }

      // Réconciliation : vérité serveur + mutations locales restantes
      let snap = data.snapshot;
      const remaining = (await outboxAll()).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      );
      for (const e of remaining) {
        snap = applyMutationLocal(snap, {
          id: e.id,
          type: e.type as BoMutation["type"],
          createdAt: e.createdAt,
          payload: e.payload,
        } as BoMutation);
      }
      this.pulledAt = data.serverTime;
      await kvSet(SNAPSHOT_KEY, snap);
      await kvSet(META_KEY, { pulledAt: data.serverTime });

      const after = await outboxAll();
      this.emit({
        snapshot: snap,
        lastSyncAt: data.serverTime,
        pending: after.filter((e) => e.status === "PENDING").length,
        failed: after.filter((e) => e.status === "FAILED").length,
        failedErrors: after
          .filter((e) => e.status === "FAILED")
          .map((e) => ({ type: e.type, error: e.error ?? "Erreur" })),
      });
    } catch {
      // réseau indisponible : les mutations restent PENDING, retry au prochain tic
    } finally {
      this.flushing = false;
      this.emit({ syncing: false });
    }
  }

  private async pull(): Promise<void> {
    try {
      const res = await fetch("/api/back-office/snapshot", { cache: "no-store" });
      if (res.status === 401) {
        // Sans session ET sans données locales → simple page de connexion,
        // pas une expiration pendant le travail hors-ligne.
        if (this.state.snapshot) this.emit({ authRequired: true });
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { serverTime: string; snapshot: BoSnapshot };
      this.pulledAt = data.serverTime;
      await kvSet(SNAPSHOT_KEY, data.snapshot);
      await kvSet(META_KEY, { pulledAt: data.serverTime });
      this.emit({ snapshot: data.snapshot, lastSyncAt: data.serverTime });
    } catch {
      // hors-ligne silencieux
    }
  }

  // ── Réinitialisation (déconnexion) ─────────────────────────

  async reset(): Promise<void> {
    if (!isBrowser()) return;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.initPromise = null;
    await wipeLocalDatabase();
    this.pulledAt = "";
    this.emit({
      ...EMPTY_STATE,
      ready: true,
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
    });
  }
}

export const boEngine = new BoEngine();
