/**
 * Constantes du domaine back-office — Cabinet SERMA & SERMA Hub Academy.
 * Source unique pour les libellés, badges et couleurs de statut.
 */

export const BO_PATHS = {
  login: "/back-office/login",
  selection: "/back-office/selection",
  cabinet: "/back-office/cabinet",
  academy: "/back-office/academy",
} as const;

// ── Clients ──────────────────────────────────────────────────
export const CLIENT_TYPES = {
  ONG: "ONG",
  ENTREPRISE: "ENTREPRISE",
} as const;

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  ONG: "ONG & Projets",
  ENTREPRISE: "Autres clients",
};

export const CLIENT_STATUS_LABELS: Record<string, string> = {
  ACTIF: "Actif",
  SUSPENDU: "Suspendu",
  ARCHIVE: "Archivé",
};

// ── Missions de travail ──────────────────────────────────────
export const WORK_CATEGORIES = [
  { value: "TENUE", label: "Tenue comptable" },
  { value: "FISCALITE", label: "Fiscalité" },
  { value: "CERTIFICATION", label: "Certification des états financiers" },
  { value: "SOCIAL", label: "Social & Paie" },
  { value: "CONSEIL", label: "Conseil" },
  { value: "URGENCE", label: "Assistance & Déblocage" },
  { value: "DIVERS", label: "Divers" },
] as const;

export const WORK_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  WORK_CATEGORIES.map((c) => [c.value, c.label])
);

export const WORK_STATUSES = [
  { value: "A_FAIRE", label: "À faire", tone: "neutral" },
  { value: "EN_COURS", label: "En cours", tone: "orange" },
  { value: "EN_REVISION", label: "En révision", tone: "marine" },
  { value: "TERMINE", label: "Terminé", tone: "green" },
] as const;

export const WORK_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  WORK_STATUSES.map((s) => [s.value, s.label])
);

export const WORK_PRIORITIES = [
  { value: "BASSE", label: "Basse" },
  { value: "NORMALE", label: "Normale" },
  { value: "HAUTE", label: "Haute" },
  { value: "URGENTE", label: "Urgente" },
] as const;

// ── Documents ────────────────────────────────────────────────
export const DOC_KINDS = {
  SHEET: "SHEET",
  DOC: "DOC",
  FILE: "FILE",
} as const;

export const DOC_KIND_LABELS: Record<string, string> = {
  SHEET: "Tableur",
  DOC: "Document",
  FILE: "Fichier importé",
};

// ── Soumissions (formulaires publics) ────────────────────────
export const SUBMISSION_SOURCES: Record<string, string> = {
  CONTACT_CABINET: "Contact Cabinet",
  RDV_CABINET: "Demande de RDV Cabinet",
  INSCRIPTION_ACADEMY: "Inscription Academy",
};

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  TRAITE: "Traité",
  ARCHIVE: "Archivé",
};

// ── Dossiers (arborescence libre) ────────────────────────
/** Nom de dossier « vierge » proposé à la création (comme Windows). */
export const NEW_FOLDER_DEFAULT_NAME = "Nouveau dossier";

/** Caractères interdits dans un nom de dossier (comme l'explorateur Windows). */
export function invalidFolderNameChars(name: string): string[] {
  const forbidden = "\\/";
  return [...name].filter((ch) => forbidden.includes(ch) || ch.charCodeAt(0) < 32);
}

// ── Statuts génériques ───────────────────────────────────────

export function formatBytes(bytes?: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatDateFr(date?: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
