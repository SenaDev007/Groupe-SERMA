/**
 * Application LOCALE des mutations sur le snapshot (mode hors-ligne).
 * Chaque mutation est appliquée immédiatement dans IndexedDB pour que
 * l'interface reste 100% utilisable sans connexion, puis rejouée sur le
 * serveur PostgreSQL par le moteur de synchronisation dès que la connexion
 * revient. Les mêmes règles métier que l'API de synchronisation sont
 * respectées (cascades de suppression, déplacement impossible dans
 * soi-même, etc.).
 */

import type { BoMutation, BoSnapshot, FolderRecord } from "./types";

const nowIso = () => new Date().toISOString();

function upsert<T extends { id: string; updatedAt: string }>(
  list: T[],
  item: T
): T[] {
  const i = list.findIndex((x) => x.id === item.id);
  if (i === -1) return [...list, item];
  const copy = [...list];
  copy[i] = item;
  return copy;
}

/** Identifiants d'un dossier et de TOUS ses descendants (récursif). */
export function folderDescendantIds(
  folders: FolderRecord[],
  rootId: string
): Set<string> {
  const all = new Set<string>([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const f of folders) {
      if (f.parentId && all.has(f.parentId) && !all.has(f.id)) {
        all.add(f.id);
        grew = true;
      }
    }
  }
  return all;
}

/** Un dossier ne peut pas être déplacé dans lui-même ou un de ses descendants. */
export function isDescendantFolder(
  folders: FolderRecord[],
  candidateParentId: string,
  movedFolderId: string
): boolean {
  return folderDescendantIds(folders, movedFolderId).has(candidateParentId);
}

/**
 * Applique une mutation sur le snapshot local.
 * Retourne un NOUVEAU snapshot (immutabilité → re-rendu React fiable).
 */
export function applyMutationLocal(
  snapshot: BoSnapshot,
  m: BoMutation
): BoSnapshot {
  switch (m.type) {
    // ── CLIENTS ──────────────────────────────────────────────
    case "client.upsert": {
      const p = m.payload;
      const existing = snapshot.clients.find((c) => c.id === p.id);
      const client = {
        id: p.id,
        type: p.type,
        name: p.name,
        sector: p.sector ?? null,
        contactName: p.contactName ?? null,
        email: p.email ?? null,
        phone: p.phone ?? null,
        address: p.address ?? null,
        taxId: p.taxId ?? null,
        status: p.status ?? existing?.status ?? "ACTIF",
        notes: p.notes ?? existing?.notes ?? null,
        createdAt: existing?.createdAt ?? nowIso(),
        updatedAt: nowIso(),
      };
      const next: BoSnapshot = {
        ...snapshot,
        clients: upsert(snapshot.clients, client),
      };
      // Création : dossier racine ouvert automatiquement (comme le serveur)
      if (!existing) {
        next.folders = upsert(next.folders, {
          id: `root_${p.id}`,
          clientId: p.id,
          parentId: null,
          name: p.name,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        });
      } else {
        // Le nom du dossier racine suit le nom du client
        next.folders = next.folders.map((f) =>
          f.id === `root_${p.id}` ? { ...f, name: p.name, updatedAt: nowIso() } : f
        );
      }
      return next;
    }

    case "client.delete": {
      const id = m.payload.id;
      const folderIds = new Set(
        snapshot.folders.filter((f) => f.clientId === id).map((f) => f.id)
      );
      return {
        ...snapshot,
        clients: snapshot.clients.filter((c) => c.id !== id),
        folders: snapshot.folders.filter((f) => f.clientId !== id),
        workItems: snapshot.workItems.filter((w) => w.clientId !== id),
        // Prisma : suppression en cascade des documents des dossiers
        documents: snapshot.documents.filter(
          (d) => !d.folderId || !folderIds.has(d.folderId)
        ),
      };
    }

    // ── DOSSIERS (arborescence libre) ────────────────────────
    case "folder.create": {
      const p = m.payload;
      if (snapshot.folders.some((f) => f.id === p.id)) return snapshot;
      const folder: FolderRecord = {
        id: p.id,
        clientId: p.clientId,
        parentId: p.parentId ?? null,
        name: p.name,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return { ...snapshot, folders: upsert(snapshot.folders, folder) };
    }

    case "folder.rename": {
      const p = m.payload;
      const folders = snapshot.folders.map((f) =>
        f.id === p.id ? { ...f, name: p.name, updatedAt: nowIso() } : f
      );
      return { ...snapshot, folders };
    }

    case "folder.move": {
      const p = m.payload;
      if (p.parentId && isDescendantFolder(snapshot.folders, p.parentId, p.id)) {
        return snapshot; // déplacement dans soi-même refusé
      }
      const folders = snapshot.folders.map((f) =>
        f.id === p.id ? { ...f, parentId: p.parentId, updatedAt: nowIso() } : f
      );
      return { ...snapshot, folders };
    }

    case "folder.delete": {
      const id = m.payload.id;
      // Cohérent avec le schéma Prisma : cascade sur les sous-dossiers
      // (récursif) et les documents qu'ils contiennent.
      const dead = folderDescendantIds(snapshot.folders, id);
      return {
        ...snapshot,
        folders: snapshot.folders.filter((f) => !dead.has(f.id)),
        documents: snapshot.documents.filter(
          (d) => !d.folderId || !dead.has(d.folderId)
        ),
      };
    }

    // ── MISSIONS ─────────────────────────────────────────────
    case "workItem.upsert": {
      const p = m.payload;
      const existing = snapshot.workItems.find((w) => w.id === p.id);
      const item = {
        id: p.id,
        clientId: p.clientId ?? existing?.clientId ?? "",
        title: p.title,
        category: p.category,
        status: p.status,
        priority: p.priority,
        dueDate: p.dueDate ?? null,
        notes: p.notes ?? null,
        createdAt: existing?.createdAt ?? nowIso(),
        updatedAt: nowIso(),
      };
      return { ...snapshot, workItems: upsert(snapshot.workItems, item) };
    }

    case "workItem.delete": {
      const id = m.payload.id;
      return {
        ...snapshot,
        workItems: snapshot.workItems.filter((w) => w.id !== id),
        // Prisma : workItemId → SetNull à la suppression de la mission
        documents: snapshot.documents.map((d) =>
          d.workItemId === id ? { ...d, workItemId: null, updatedAt: nowIso() } : d
        ),
      };
    }

    // ── DOCUMENTS ────────────────────────────────────────────
    case "document.create": {
      const p = m.payload;
      const doc = {
        id: p.id,
        name: p.name,
        kind: p.kind,
        entity: p.entity,
        mimeType: null,
        size: null,
        content: p.content ?? null,
        filePath: null,
        source: "INTERNE",
        version: 1,
        folderId: p.folderId ?? null,
        workItemId: p.workItemId ?? null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return { ...snapshot, documents: upsert(snapshot.documents, doc) };
    }

    case "document.saveContent": {
      const p = m.payload;
      const documents = snapshot.documents.map((d) =>
        d.id === p.id
          ? {
              ...d,
              content: p.content,
              name: p.name?.trim() || d.name,
              version: d.version + 1,
              updatedAt: nowIso(),
            }
          : d
      );
      return { ...snapshot, documents };
    }

    case "document.rename": {
      const documents = snapshot.documents.map((d) =>
        d.id === m.payload.id ? { ...d, name: m.payload.name, updatedAt: nowIso() } : d
      );
      return { ...snapshot, documents };
    }

    case "document.move": {
      const p = m.payload;
      const documents = snapshot.documents.map((d) =>
        d.id === p.id ? { ...d, folderId: p.folderId, updatedAt: nowIso() } : d
      );
      return { ...snapshot, documents };
    }

    case "document.delete": {
      return {
        ...snapshot,
        documents: snapshot.documents.filter((d) => d.id !== m.payload.id),
      };
    }

    case "document.import": {
      const p = m.payload;
      const doc = {
        id: p.id,
        name: p.name,
        kind: "FILE",
        entity: "CABINET",
        mimeType: p.mimeType,
        size: p.size,
        content: null,
        filePath: null, // renseigné par le serveur au moment du téléversement
        source: "IMPORT",
        version: 1,
        folderId: p.folderId ?? null,
        workItemId: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        pendingUpload: true,
      };
      return { ...snapshot, documents: upsert(snapshot.documents, doc) };
    }

    // ── SOUMISSIONS ──────────────────────────────────────────
    case "submission.setStatus": {
      const submissions = snapshot.submissions.map((s) =>
        s.id === m.payload.id ? { ...s, status: m.payload.status, updatedAt: nowIso() } : s
      );
      return { ...snapshot, submissions };
    }

    // ── ACADEMY : FORMATIONS ─────────────────────────────────
    case "formation.upsert": {
      const p = m.payload;
      const existing = snapshot.formations.find((f) => f.id === p.id);
      const item = {
        id: p.id,
        title: p.title,
        hook: p.hook ?? null,
        description: p.description ?? null,
        category: p.category,
        duration: p.duration ?? null,
        price: p.price ?? null,
        level: p.level ?? null,
        skills: p.skills,
        outcome: p.outcome ?? null,
        status: p.status,
        order: p.order,
        createdAt: existing?.createdAt ?? nowIso(),
        updatedAt: nowIso(),
      };
      return { ...snapshot, formations: upsert(snapshot.formations, item) };
    }

    case "formation.delete": {
      return { ...snapshot, formations: snapshot.formations.filter((f) => f.id !== m.payload.id) };
    }

    // ── ACADEMY : ARTICLES ───────────────────────────────────
    case "article.upsert": {
      const p = m.payload;
      const existing = snapshot.articles.find((a) => a.id === p.id);
      const item = {
        id: p.id,
        title: p.title,
        slug: p.slug,
        legacyId: existing?.legacyId ?? null,
        excerpt: p.excerpt ?? null,
        content: p.content ?? null,
        category: p.category ?? null,
        readTime: p.readTime ?? null,
        status: p.status,
        publishedAt:
          p.status === "PUBLIE" ? existing?.publishedAt ?? nowIso() : existing?.publishedAt ?? null,
        createdAt: existing?.createdAt ?? nowIso(),
        updatedAt: nowIso(),
      };
      return { ...snapshot, articles: upsert(snapshot.articles, item) };
    }

    case "article.delete": {
      return { ...snapshot, articles: snapshot.articles.filter((a) => a.id !== m.payload.id) };
    }

    // ── ACADEMY : TÉMOIGNAGES ────────────────────────────────
    case "testimonial.upsert": {
      const p = m.payload;
      const existing = snapshot.testimonials.find((t) => t.id === p.id);
      const item = {
        id: p.id,
        name: p.name,
        role: p.role ?? null,
        entity: p.entity,
        content: p.content,
        result: p.result ?? null,
        rating: p.rating,
        status: p.status,
        createdAt: existing?.createdAt ?? nowIso(),
        updatedAt: nowIso(),
      };
      return { ...snapshot, testimonials: upsert(snapshot.testimonials, item) };
    }

    case "testimonial.delete": {
      return {
        ...snapshot,
        testimonials: snapshot.testimonials.filter((t) => t.id !== m.payload.id),
      };
    }

    default:
      return snapshot;
  }
}
