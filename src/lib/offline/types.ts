/**
 * Types du moteur offline-first du back-office Groupe SERMA.
 * Toutes les dates sont des chaînes ISO (sérialisables IndexedDB + JSON).
 * Ces types reflètent les modèles Prisma (schema.prisma).
 *
 * L'organisation des fichiers suit une arborescence LIBRE de dossiers,
 * exactement comme l'explorateur de fichiers Windows : dossiers imbriqués
 * sans limite, noms libres, fichiers rangés dans les dossiers.
 */

export interface FolderRecord {
  id: string;
  clientId: string;
  parentId: string | null; // null = niveau racine du dossier client
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRecord {
  id: string;
  type: string; // ONG | ENTREPRISE
  name: string;
  sector: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  status: string; // ACTIF | SUSPENDU | ARCHIVE
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItemRecord {
  id: string;
  clientId: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  kind: string; // SHEET | DOC | FILE
  entity: string; // CABINET | ACADEMY
  mimeType: string | null;
  size: number | null;
  content: string | null;
  filePath: string | null;
  source: string; // INTERNE | IMPORT
  version: number;
  folderId: string | null;
  workItemId: string | null;
  createdAt: string;
  updatedAt: string;
  /** vrai uniquement en local : fichier importé hors-ligne pas encore téléversé */
  pendingUpload?: boolean;
}

export interface SubmissionRecord {
  id: string;
  source: string;
  entity: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  payload: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormationRecord {
  id: string;
  title: string;
  hook: string | null;
  description: string | null;
  category: string;
  duration: string | null;
  price: string | null;
  level: string | null;
  skills: string;
  outcome: string | null;
  status: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleRecord {
  id: string;
  title: string;
  slug: string;
  legacyId: number | null;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  readTime: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialRecord {
  id: string;
  name: string;
  role: string | null;
  entity: string;
  content: string;
  result: string | null;
  rating: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoSnapshot {
  clients: ClientRecord[];
  folders: FolderRecord[];
  workItems: WorkItemRecord[];
  documents: DocumentRecord[];
  submissions: SubmissionRecord[];
  formations: FormationRecord[];
  articles: ArticleRecord[];
  testimonials: TestimonialRecord[];
}

export interface BoMeta {
  pulledAt: string; // dernière synchro réussie (pull ou push+pull)
  seededAt: string; // premier amorçage local
}

// ─────────────────────────────────────────────────────────────
// Mutations (outbox) — appliquées localement puis synchronisées
// ─────────────────────────────────────────────────────────────

export interface MutationClientUpsert {
  id: string;
  type: "client.upsert";
  createdAt: string;
  payload: {
    id: string;
    name: string;
    type: string;
    sector?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    notes?: string;
    status?: string;
  };
}
export interface MutationClientDelete {
  id: string;
  type: "client.delete";
  createdAt: string;
  payload: { id: string };
}

// ── DOSSIERS (arborescence libre, type Explorateur Windows) ──

export interface MutationFolderCreate {
  id: string;
  type: "folder.create";
  createdAt: string;
  payload: { id: string; clientId: string; parentId?: string; name: string };
}
export interface MutationFolderRename {
  id: string;
  type: "folder.rename";
  createdAt: string;
  payload: { id: string; name: string };
}
export interface MutationFolderMove {
  id: string;
  type: "folder.move";
  createdAt: string;
  payload: { id: string; parentId: string | null };
}
export interface MutationFolderDelete {
  id: string;
  type: "folder.delete";
  createdAt: string;
  payload: { id: string };
}

// ── MISSIONS (rattachées directement au dossier client) ──────

export interface MutationWorkItemUpsert {
  id: string;
  type: "workItem.upsert";
  createdAt: string;
  payload: {
    id: string;
    clientId?: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    dueDate?: string;
    notes?: string;
  };
}
export interface MutationWorkItemDelete {
  id: string;
  type: "workItem.delete";
  createdAt: string;
  payload: { id: string };
}

// ── DOCUMENTS (rangés dans les dossiers) ─────────────────────

export interface MutationDocumentCreate {
  id: string;
  type: "document.create";
  createdAt: string;
  payload: {
    id: string;
    name: string;
    kind: string;
    entity: string;
    content?: string;
    folderId?: string;
    workItemId?: string;
  };
}
export interface MutationDocumentSaveContent {
  id: string;
  type: "document.saveContent";
  createdAt: string;
  payload: {
    id: string;
    name?: string;
    content: string;
    /** Fichier réel (.xlsx) stocké en local (IndexedDB « blobs ») —
     * résolu en fileBase64 par le moteur au moment de la synchro. */
    blobKey?: string;
    size?: number;
    mimeType?: string;
  };
}
export interface MutationDocumentRename {
  id: string;
  type: "document.rename";
  createdAt: string;
  payload: { id: string; name: string };
}
export interface MutationDocumentMove {
  id: string;
  type: "document.move";
  createdAt: string;
  payload: { id: string; folderId: string | null };
}
export interface MutationDocumentDelete {
  id: string;
  type: "document.delete";
  createdAt: string;
  payload: { id: string };
}
export interface MutationDocumentImport {
  id: string;
  type: "document.import";
  createdAt: string;
  payload: {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    folderId?: string;
    blobKey: string; // objet File stocké en local (IndexedDB « blobs »)
  };
}

// ── SOUMISSIONS ──────────────────────────────────────────────

export interface MutationSubmissionStatus {
  id: string;
  type: "submission.setStatus";
  createdAt: string;
  payload: { id: string; status: string };
}

// ── ACADEMY ──────────────────────────────────────────────────

export interface MutationFormationUpsert {
  id: string;
  type: "formation.upsert";
  createdAt: string;
  payload: {
    id: string;
    title: string;
    hook?: string;
    description?: string;
    category: string;
    duration?: string;
    price?: string;
    level?: string;
    skills: string;
    outcome?: string;
    status: string;
    order: number;
  };
}
export interface MutationFormationDelete {
  id: string;
  type: "formation.delete";
  createdAt: string;
  payload: { id: string };
}
export interface MutationArticleUpsert {
  id: string;
  type: "article.upsert";
  createdAt: string;
  payload: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    category?: string;
    readTime?: string;
    status: string;
  };
}
export interface MutationArticleDelete {
  id: string;
  type: "article.delete";
  createdAt: string;
  payload: { id: string };
}
export interface MutationTestimonialUpsert {
  id: string;
  type: "testimonial.upsert";
  createdAt: string;
  payload: {
    id: string;
    name: string;
    role?: string;
    entity: string;
    content: string;
    result?: string;
    rating: number;
    status: string;
  };
}
export interface MutationTestimonialDelete {
  id: string;
  type: "testimonial.delete";
  createdAt: string;
  payload: { id: string };
}

export type BoMutation =
  | MutationClientUpsert
  | MutationClientDelete
  | MutationFolderCreate
  | MutationFolderRename
  | MutationFolderMove
  | MutationFolderDelete
  | MutationWorkItemUpsert
  | MutationWorkItemDelete
  | MutationDocumentCreate
  | MutationDocumentSaveContent
  | MutationDocumentRename
  | MutationDocumentMove
  | MutationDocumentDelete
  | MutationDocumentImport
  | MutationSubmissionStatus
  | MutationFormationUpsert
  | MutationFormationDelete
  | MutationArticleUpsert
  | MutationArticleDelete
  | MutationTestimonialUpsert
  | MutationTestimonialDelete;

export interface OutboxEntry {
  id: string; // id de la mutation
  type: string;
  createdAt: string;
  payload: unknown;
  status: "PENDING" | "FAILED";
  error?: string;
  attempts: number;
}

export interface SyncResult {
  id: string;
  ok: boolean;
  error?: string;
}
