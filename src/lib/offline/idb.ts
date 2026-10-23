/**
 * Wrapper IndexedDB minimaliste (promesses, sans dépendance).
 * Base « serma-bo », magasins :
 *  - kv      : clé/valeur (snapshot, meta)
 *  - outbox  : file de mutations en attente de synchronisation
 *  - blobs   : fichiers importés hors-ligne (File/Blob)
 */

const DB_NAME = "serma-bo";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
      if (!db.objectStoreNames.contains("outbox"))
        db.createObjectStore("outbox", { keyPath: "id" });
      if (!db.objectStoreNames.contains("blobs"))
        db.createObjectStore("blobs", { keyPath: "key" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

// ── kv ───────────────────────────────────────────────────────

export async function kvGet<T>(key: string): Promise<T | undefined> {
  if (!isBrowser()) return undefined;
  return tx<T>("kv", "readonly", (s) => s.get(key) as IDBRequest<T>);
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  if (!isBrowser()) return;
  await tx("kv", "readwrite", (s) => s.put(value, key));
}

// ── outbox ───────────────────────────────────────────────────

export async function outboxAll(): Promise<
  { id: string; type: string; createdAt: string; payload: unknown; status: string; error?: string; attempts: number }[]
> {
  if (!isBrowser()) return [];
  return tx("outbox", "readonly", (s) => s.getAll() as IDBRequest<any[]>);
}

export async function outboxPut(entry: {
  id: string;
  type: string;
  createdAt: string;
  payload: unknown;
  status: string;
  error?: string;
  attempts: number;
}): Promise<void> {
  await tx("outbox", "readwrite", (s) => s.put(entry));
}

export async function outboxDelete(id: string): Promise<void> {
  await tx("outbox", "readwrite", (s) => s.delete(id));
}

export async function outboxClear(): Promise<void> {
  await tx("outbox", "readwrite", (s) => s.clear());
}

// ── blobs (fichiers importés hors-ligne) ─────────────────────

export async function blobPut(key: string, file: Blob): Promise<void> {
  await tx("blobs", "readwrite", (s) => s.put({ key, file }));
}

export async function blobGet(key: string): Promise<Blob | null> {
  if (!isBrowser()) return null;
  const rec = await tx<{ key: string; file: Blob } | undefined>(
    "blobs",
    "readonly",
    (s) => s.get(key)
  );
  return rec?.file ?? null;
}

export async function blobDelete(key: string): Promise<void> {
  await tx("blobs", "readwrite", (s) => s.delete(key));
}

// ── réinitialisation complète (déconnexion / changement de compte) ──

export async function wipeLocalDatabase(): Promise<void> {
  if (!isBrowser()) return;
  await new Promise<void>((resolve) => {
    openDb().then((db) => {
      const t = db.transaction(["kv", "outbox", "blobs"], "readwrite");
      t.objectStore("kv").clear();
      t.objectStore("outbox").clear();
      t.objectStore("blobs").clear();
      t.oncomplete = () => resolve();
      t.onerror = () => resolve();
      t.onabort = () => resolve();
    });
  });
}
