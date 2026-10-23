/**
 * Dérivations snapshot → données de vue (partagées entre pages serveur
 * et vues client offline). Garantit des calculs identiques en ligne
 * (rendu serveur) et hors-ligne (rendu depuis IndexedDB).
 *
 * Organisation : arborescence LIBRE de dossiers par client (exactement
 * comme l'explorateur de fichiers Windows).
 */

import type {
  BoSnapshot,
  ClientRecord,
  FolderRecord,
  DocumentRecord,
} from "@/lib/offline/types";

// ── Arborescence ───────────────────────────────────────────────

/** Dossier racine d'un client (id déterministe `root_<clientId>`). */
export function rootFolderOf(
  folders: FolderRecord[],
  clientId: string
): FolderRecord | undefined {
  return folders.find((f) => f.clientId === clientId && f.parentId === null);
}

/** Fils directs d'un dossier (ou de la racine du client). */
export function childFoldersOf(
  folders: FolderRecord[],
  clientId: string,
  parentId: string | null
): FolderRecord[] {
  return folders
    .filter((f) => f.clientId === clientId && f.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

/**
 * Chemin complet d'un dossier depuis la racine du client,
 * segment par segment (pour le fil d'Ariane).
 */
export function folderPathSegments(
  folders: FolderRecord[],
  folderId: string | null
): FolderRecord[] {
  const segments: FolderRecord[] = [];
  let current = folderId ? folders.find((f) => f.id === folderId) : undefined;
  let guard = 0;
  while (current && guard < 100) {
    segments.unshift(current);
    current = current.parentId
      ? folders.find((f) => f.id === current!.parentId)
      : undefined;
    guard++;
  }
  return segments;
}

/** Libellé « Dossier / Sous-dossier » pour un document (badge, listes). */
export function folderPathLabel(
  folders: FolderRecord[],
  folderId: string | null
): string | null {
  const segments = folderPathSegments(folders, folderId);
  if (segments.length === 0) return null;
  // La racine porte le nom du client : on la saute dans le libellé chemin
  const meaningful = segments.filter((s) => !s.id.startsWith("root_"));
  if (meaningful.length === 0) return null;
  return meaningful.map((s) => s.name).join(" / ");
}

/** Nombre de documents (récursif) contenus dans un dossier. */
export function folderDocumentCount(
  documents: DocumentRecord[],
  folders: FolderRecord[],
  folderId: string
): number {
  const ids = new Set<string>([folderId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const f of folders) {
      if (f.parentId && ids.has(f.parentId) && !ids.has(f.id)) {
        ids.add(f.id);
        grew = true;
      }
    }
  }
  return documents.filter((d) => d.folderId && ids.has(d.folderId)).length;
}

// ── Portefeuille clients ───────────────────────────────────────

export interface ClientRow {
  id: string;
  type: string;
  name: string;
  sector: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  foldersCount: number;
  documentsCount: number;
  activeMissions: number;
}

/** Lignes du portefeuille clients (onglets ONG / autres clients). */
export function deriveClientRows(snapshot: BoSnapshot): ClientRow[] {
  return snapshot.clients.map((c) => {
    const clientFolderIds = new Set(
      snapshot.folders.filter((f) => f.clientId === c.id).map((f) => f.id)
    );
    return {
      id: c.id,
      type: c.type,
      name: c.name,
      sector: c.sector,
      contactName: c.contactName,
      email: c.email,
      phone: c.phone,
      address: c.address,
      taxId: c.taxId,
      status: c.status,
      notes: c.notes,
      createdAt: c.createdAt,
      foldersCount: clientFolderIds.size,
      documentsCount: snapshot.documents.filter(
        (d) => d.folderId && clientFolderIds.has(d.folderId)
      ).length,
      activeMissions: snapshot.workItems.filter(
        (w) => w.clientId === c.id && w.status !== "TERMINE"
      ).length,
    };
  });
}

/** Client enrichi pour sa fiche détaillée. */
export function deriveClientDetail(
  snapshot: BoSnapshot,
  clientId: string
): {
  client: ClientRecord;
  foldersCount: number;
  totalDocuments: number;
  activeMissions: number;
  latestActivity: string | null;
} | null {
  const client = snapshot.clients.find((c) => c.id === clientId);
  if (!client) return null;
  const clientFolderIds = new Set(
    snapshot.folders.filter((f) => f.clientId === clientId).map((f) => f.id)
  );
  const workItems = snapshot.workItems.filter((w) => w.clientId === clientId);
  const docs = snapshot.documents.filter(
    (d) => d.folderId && clientFolderIds.has(d.folderId)
  );
  const dates = [
    ...workItems.map((w) => w.updatedAt),
    ...docs.map((d) => d.updatedAt),
    ...snapshot.folders
      .filter((f) => f.clientId === clientId)
      .map((f) => f.updatedAt),
    client.updatedAt,
  ].sort();
  return {
    client,
    foldersCount: clientFolderIds.size,
    totalDocuments: docs.length,
    activeMissions: workItems.filter((w) => w.status !== "TERMINE").length,
    latestActivity: dates[dates.length - 1] ?? null,
  };
}

/** Statistiques du cockpit cabinet. */
export function deriveCabinetStats(snapshot: BoSnapshot) {
  const ong = snapshot.clients.filter((c) => c.type === "ONG");
  const entreprises = snapshot.clients.filter((c) => c.type !== "ONG");
  const byCategory: Record<string, number> = {};
  for (const w of snapshot.workItems) {
    byCategory[w.category] = (byCategory[w.category] ?? 0) + 1;
  }
  return {
    clientsTotal: snapshot.clients.length,
    ongCount: ong.length,
    entrepriseCount: entreprises.length,
    foldersCount: snapshot.folders.length,
    activeMissions: snapshot.workItems.filter((w) => w.status !== "TERMINE").length,
    urgentMissions: snapshot.workItems.filter(
      (w) => w.priority === "URGENTE" && w.status !== "TERMINE"
    ).length,
    documentsCount: snapshot.documents.length,
    newSubmissions: snapshot.submissions.filter(
      (s) => s.entity === "CABINET" && s.status === "NOUVEAU"
    ).length,
    byCategory,
  };
}

/** Statistiques de la console Academy. */
export function deriveAcademyStats(snapshot: BoSnapshot) {
  return {
    publishedFormations: snapshot.formations.filter((f) => f.status === "PUBLIE").length,
    draftFormations: snapshot.formations.filter((f) => f.status !== "PUBLIE").length,
    publishedArticles: snapshot.articles.filter((a) => a.status === "PUBLIE").length,
    publishedTestimonials: snapshot.testimonials.filter(
      (t) => t.status === "PUBLIE" && t.entity === "ACADEMY"
    ).length,
    newInscriptions: snapshot.submissions.filter(
      (s) => s.entity === "ACADEMY" && s.status === "NOUVEAU"
    ).length,
  };
}
