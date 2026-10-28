"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  removeBoFile,
  saveBoFileBytes,
  writeBoFile,
} from "@/lib/office/storage";

/**
 * Server actions du cockpit Cabinet — arborescence libre de dossiers.
 * NOTE : les vues offline-first utilisent le moteur de synchronisation
 * (src/lib/offline) ; ces actions maintiennent une surface serveur
 * cohérente pour tout usage direct (progressive enhancement).
 */

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/back-office/login");
  return session;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}
function optStr(formData: FormData, key: string): string | undefined {
  const v = str(formData, key);
  return v || undefined;
}

// ═════════════════════════════════════════════════════════════
// CLIENTS
// ═════════════════════════════════════════════════════════════

export interface ClientFormState {
  error?: string;
}

export async function saveClientAction(
  _prev: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  await requireSession();
  const id = optStr(formData, "id");
  const name = str(formData, "name");
  const type = str(formData, "type") || "ENTREPRISE";
  if (!name) return { error: "Le nom du client est obligatoire." };

  const data = {
    name,
    type,
    sector: optStr(formData, "sector"),
    contactName: optStr(formData, "contactName"),
    email: optStr(formData, "email"),
    phone: optStr(formData, "phone"),
    address: optStr(formData, "address"),
    taxId: optStr(formData, "taxId"),
    notes: optStr(formData, "notes"),
    status: str(formData, "status") || "ACTIF",
  };

  if (id) {
    await prisma.client.update({ where: { id }, data });
    await prisma.folder.updateMany({ where: { id: `root_${id}` }, data: { name } });
  } else {
    const client = await prisma.client.create({ data });
    // Dossier racine ouvert automatiquement (arborescence libre)
    await prisma.folder.create({
      data: { id: `root_${client.id}`, clientId: client.id, parentId: null, name },
    });
  }

  revalidatePath("/back-office/cabinet/clients");
  revalidatePath("/back-office/cabinet");
  redirect("/back-office/cabinet/clients?tab=" + type);
}

export async function deleteClientAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.client.delete({ where: { id } }); // cascade dossiers/missions/documents
  revalidatePath("/back-office/cabinet/clients");
  revalidatePath("/back-office/cabinet");
  redirect("/back-office/cabinet/clients");
}

// ═════════════════════════════════════════════════════════════
// DOSSIERS (arborescence libre, type explorateur Windows)
// ═════════════════════════════════════════════════════════════

function safeName(v: string): string {
  return v.replace(/[\\/\u0000-\u001f]/g, "").slice(0, 255).trim();
}

async function descendantsOf(folderId: string): Promise<string[]> {
  const all = await prisma.folder.findMany({ select: { id: true, parentId: true } });
  const dead = new Set<string>([folderId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const f of all) {
      if (f.parentId && dead.has(f.parentId) && !dead.has(f.id)) {
        dead.add(f.id);
        grew = true;
      }
    }
  }
  return [...dead];
}

export async function createFolderAction(formData: FormData): Promise<void> {
  await requireSession();
  const clientId = str(formData, "clientId");
  const parentId = optStr(formData, "parentId");
  const name = safeName(str(formData, "name"));
  if (!clientId || !name) return;

  const dup = await prisma.folder.findFirst({ where: { clientId, parentId: parentId ?? null, name } });
  if (!dup) {
    await prisma.folder.create({ data: { clientId, parentId, name } });
  }
  revalidatePath(`/back-office/cabinet/clients/${clientId}`);
}

export async function renameFolderAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  const name = safeName(str(formData, "name"));
  if (id && name) {
    await prisma.folder.update({ where: { id }, data: { name } });
  }
  const folder = await prisma.folder.findUnique({ where: { id }, select: { clientId: true } });
  if (folder) revalidatePath(`/back-office/cabinet/clients/${folder.clientId}`);
}

export async function deleteFolderAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  const dead = await descendantsOf(id);
  // Purge des fichiers importés contenus dans l'arborescence supprimée
  const docs = await prisma.document.findMany({
    where: { folderId: { in: dead }, filePath: { not: null } },
    select: { filePath: true },
  });
  for (const d of docs) {
    if (!d.filePath) continue;
    try {
      await fs.unlink(path.join(UPLOAD_DIR, path.basename(d.filePath)));
    } catch {
      // fichier déjà absent
    }
  }
  const folder = await prisma.folder.findUnique({ where: { id }, select: { clientId: true } });
  await prisma.folder.delete({ where: { id } }); // cascade sous-dossiers + documents
  if (folder) revalidatePath(`/back-office/cabinet/clients/${folder.clientId}`);
}

// ═════════════════════════════════════════════════════════════
// MISSIONS DE TRAVAIL (rattachées au dossier client)
// ═════════════════════════════════════════════════════════════

export interface WorkItemFormState {
  error?: string;
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function saveWorkItemAction(
  _prev: WorkItemFormState,
  formData: FormData
): Promise<WorkItemFormState> {
  await requireSession();
  const id = optStr(formData, "id");
  const title = str(formData, "title");
  const clientId = str(formData, "clientId");
  if (!title) return { error: "L'intitulé de la mission est obligatoire." };

  const data = {
    title,
    category: str(formData, "category") || "DIVERS",
    status: str(formData, "status") || "A_FAIRE",
    priority: str(formData, "priority") || "NORMALE",
    dueDate: parseDate(str(formData, "dueDate")),
    notes: optStr(formData, "notes"),
  };

  if (id) {
    await prisma.workItem.update({ where: { id }, data });
  } else {
    if (!clientId) return { error: "Dossier client manquant." };
    await prisma.workItem.create({ data: { ...data, clientId } });
  }

  revalidatePath("/back-office/cabinet");
  if (clientId) revalidatePath(`/back-office/cabinet/clients/${clientId}`);
  return {};
}

export async function deleteWorkItemAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  const clientId = str(formData, "clientId");
  if (id) await prisma.workItem.delete({ where: { id } });
  if (clientId) revalidatePath(`/back-office/cabinet/clients/${clientId}`);
}

// ═════════════════════════════════════════════════════════════
// DOCUMENTS (rangés dans les dossiers)
// ═════════════════════════════════════════════════════════════

const EMPTY_SHEET = JSON.stringify({
  cols: ["Colonne A", "Colonne B", "Colonne C"],
  rows: Array.from({ length: 8 }, () => ["", "", ""]),
});

const EMPTY_DOC = `<h1>Nouveau document</h1><p>Commencez à rédiger ici…</p>`;

export async function createDocumentAction(formData: FormData): Promise<void> {
  await requireSession();
  const kind = str(formData, "kind") || "SHEET";
  const name = str(formData, "name");
  const folderId = optStr(formData, "folderId");
  const workItemId = optStr(formData, "workItemId");
  if (!name) return;

  const doc = await prisma.document.create({
    data: {
      name,
      kind,
      entity: "CABINET",
      content: kind === "SHEET" ? EMPTY_SHEET : kind === "DOC" ? EMPTY_DOC : null,
      folderId,
      workItemId,
    },
  });

  revalidatePath("/back-office/cabinet/documents");
  if (folderId) {
    const folder = await prisma.folder.findUnique({ where: { id: folderId }, select: { clientId: true } });
    if (folder) revalidatePath(`/back-office/cabinet/clients/${folder.clientId}`);
  }
  redirect(`/back-office/cabinet/documents/${doc.id}`);
}

export async function saveDocumentContentAction(input: {
  id: string;
  name?: string;
  content: string;
}): Promise<{ ok: boolean; savedAt?: string; error?: string }> {
  await requireSession();
  try {
    const existing = await prisma.document.findUnique({ where: { id: input.id } });
    if (!existing) return { ok: false, error: "Document introuvable." };

    await prisma.document.update({
      where: { id: input.id },
      data: {
        content: input.content,
        name: input.name?.trim() || existing.name,
        version: { increment: 1 },
      },
    });
    return { ok: true, savedAt: new Date().toLocaleTimeString("fr-FR") };
  } catch {
    return { ok: false, error: "Échec de l'enregistrement." };
  }
}

export async function renameDocumentAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (id && name) {
    await prisma.document.update({ where: { id }, data: { name } });
  }
  revalidatePath("/back-office/cabinet/documents");
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  const doc = await prisma.document.findUnique({ where: { id } });
  // Fichier supprimé du disque ET de la base (silencieux)
  if (doc) await removeBoFile(id, doc.filePath);
  await prisma.document.delete({ where: { id } });
  revalidatePath("/back-office/cabinet/documents");
  redirect("/back-office/cabinet/documents");
}

export interface ImportFileState {
  error?: string;
}

export async function importFileAction(
  _prev: ImportFileState,
  formData: FormData
): Promise<ImportFileState> {
  await requireSession();
  const file = formData.get("file") as File | null;
  const folderId = optStr(formData, "folderId");

  if (!file || file.size === 0) {
    return { error: "Sélectionnez un fichier à importer." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { error: "Fichier trop volumineux (20 Mo maximum)." };
  }

  const safeName = file.name.replace(/[\/\\\0]/g, "_");

  const buffer = Buffer.from(await file.arrayBuffer());
  // Disque si possible, sinon octets en base (Vercel : FS en lecture
  // seule) — même politique que la synchronisation hors-ligne.
  const stored = await writeBoFile(buffer, safeName);

  const ext = safeName.split(".").pop()?.toLowerCase() || "";

  const created = await prisma.document.create({
    data: {
      name: safeName,
      kind: "FILE",
      entity: "CABINET",
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      filePath: stored.filePath,
      source: "IMPORT",
      folderId,
    },
  });
  if (stored.fileData) await saveBoFileBytes(created.id, stored.fileData);

  // Pour les fichiers Excel importés, on ouvre aussi le contenu dans l'éditeur
  if (ext === "xlsx" || ext === "csv") {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(buffer, { type: "buffer" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
      const cols = (aoa[0] || []).map((c, i) => String(c || `Colonne ${i + 1}`));
      const rows = (aoa.slice(1) || []).map((r) => r.map((c) => String(c ?? "")));
      await prisma.document.update({
        where: { id: created.id },
        data: { content: JSON.stringify({ cols, rows }) },
      });
    } catch {
      // si le parsing échoue, le fichier reste disponible en téléchargement
    }
  }

  revalidatePath("/back-office/cabinet/documents");
  if (folderId) {
    const folder = await prisma.folder.findUnique({ where: { id: folderId }, select: { clientId: true } });
    if (folder) revalidatePath(`/back-office/cabinet/clients/${folder.clientId}`);
  }
  return {};
}

// ═════════════════════════════════════════════════════════════
// SOUMISSIONS (demandes reçues du site public)
// ═════════════════════════════════════════════════════════════

export async function updateSubmissionStatusAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  const status = str(formData, "status");
  const scope = str(formData, "scope") || "cabinet";
  if (id && ["NOUVEAU", "TRAITE", "ARCHIVE"].includes(status)) {
    await prisma.submission.update({ where: { id }, data: { status } });
  }
  revalidatePath(scope === "cabinet" ? "/back-office/cabinet/demandes" : "/back-office/academy/inscriptions");
}
