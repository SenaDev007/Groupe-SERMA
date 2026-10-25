import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildBoSnapshot, invalidateBoSnapshotCache } from "@/lib/back-office/snapshot";
import { generateSheetXlsxBytes, generateDocxBytes } from "@/lib/office/generate";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

/** Répertoire des fichiers : fonctionne quel que soit le répertoire de
 *  travail (dev, build standalone lancé depuis la racine du projet…). */
function resolveUploadDir(): string {
  const candidates = [
    process.env.BO_UPLOAD_DIR,
    path.join(process.cwd(), "upload", "bo-files"),
    path.join(process.cwd(), "..", "upload", "bo-files"),
    path.join(process.cwd(), "../..", "upload", "bo-files"),
  ].filter((p): p is string => !!p);
  for (const c of candidates) {
    try {
      if (fsSync.existsSync(c)) return c;
    } catch {
      /* continuer */
    }
  }
  return candidates[0] ?? path.join(process.cwd(), "upload", "bo-files");
}
const UPLOAD_DIR = resolveUploadDir();

interface IncomingMutation {
  id: string;
  type: string;
  createdAt: string;
  payload: Record<string, unknown>;
  fileBase64?: string;
}

interface MutationResult {
  id: string;
  ok: boolean;
  error?: string;
}

function s(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function optS(v: unknown): string | undefined {
  const r = s(v);
  return r || undefined;
}
function optDate(v: unknown): Date | undefined {
  const r = s(v);
  if (!r) return undefined;
  const d = new Date(r);
  return isNaN(d.getTime()) ? undefined : d;
}

/** Nom de dossier sûr : interdit \\ / et caractères de contrôle (comme Windows). */
function safeFolderName(v: unknown): string {
  return s(v)
    .replace(/[\\/\u0000-\u001f]/g, "")
    .slice(0, 255);
}

/**
 * Erreur Prisma → message lisible.
 * Idempotence : un rejeu de create dont l'id existe déjà (contrainte de
 * clé primaire) est considéré comme déjà appliqué → OK silencieux.
 * Un vrai conflit d'unicité (ex. slug d'article) reste une erreur.
 */
function prismaError(e: unknown): { replay: boolean; message?: string } {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      const target = e.meta?.target;
      const t =
        typeof target === "string"
          ? target
          : Array.isArray(target)
            ? target.join(",")
            : "";
      const isPrimaryKey = /pkey/i.test(t) || t === "id" || t.endsWith("_id");
      if (isPrimaryKey) return { replay: true };
      return { replay: false, message: "Conflit d'unicité (slug ou libellé déjà utilisé)." };
    }
    if (e.code === "P2025") {
      return {
        replay: false,
        message: "Élément introuvable (modifié ou supprimé depuis un autre appareil).",
      };
    }
    return { replay: false, message: "Conflit de données lors de l'application." };
  }
  return { replay: false };
}

/** Ids du dossier + de tous ses descendants (récursif). */
async function folderDescendantIds(folderId: string): Promise<string[]> {
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

/** Supprime du disque les fichiers importés contenus dans des dossiers. */
async function unlinkFolderFiles(folderIds: string[]): Promise<void> {
  if (folderIds.length === 0) return;
  const docs = await prisma.document.findMany({
    where: { folderId: { in: folderIds }, filePath: { not: null } },
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
}

async function applyMutation(m: IncomingMutation): Promise<void> {
  const p = m.payload;

  // ── LEGACY : mutations « exercices » d'une version antérieure ──
  // (files offline créées avant l'arborescence libre) → no-op silencieux
  if (m.type.startsWith("year.")) return;

  switch (m.type) {
    // ── CLIENTS ──────────────────────────────────────────────
    case "client.upsert": {
      const name = s(p.name);
      if (!name) throw new Error("Le nom du client est obligatoire.");
      const id = s(p.id);
      const data = {
        name,
        type: s(p.type) || "ENTREPRISE",
        sector: optS(p.sector),
        contactName: optS(p.contactName),
        email: optS(p.email),
        phone: optS(p.phone),
        address: optS(p.address),
        taxId: optS(p.taxId),
        notes: optS(p.notes),
        status: s(p.status) || "ACTIF",
      };
      const existing = await prisma.client.findUnique({ where: { id } });
      if (existing) {
        await prisma.client.update({ where: { id }, data });
        // Le dossier racine porte le nom du client
        await prisma.folder.updateMany({
          where: { id: `root_${id}` },
          data: { name },
        });
      } else {
        await prisma.client.create({ data: { id, ...data } });
        // Dossier racine ouvert automatiquement (arborescence libre)
        const rootExists = await prisma.folder.findUnique({ where: { id: `root_${id}` } });
        if (!rootExists) {
          await prisma.folder.create({
            data: { id: `root_${id}`, clientId: id, parentId: null, name },
          });
        }
      }
      return;
    }

    case "client.delete": {
      const id = s(p.id);
      const folderIds = (await prisma.folder.findMany({ where: { clientId: id }, select: { id: true } })).map((f) => f.id);
      await unlinkFolderFiles(folderIds);
      await prisma.client.delete({ where: { id } });
      return;
    }

    // ── DOSSIERS (arborescence libre) ────────────────────────
    case "folder.create": {
      const clientId = s(p.clientId);
      const name = safeFolderName(p.name);
      if (!clientId || !name) throw new Error("Client ou nom de dossier manquant.");
      const parentId = optS(p.parentId);
      if (parentId) {
        const parent = await prisma.folder.findUnique({ where: { id: parentId } });
        if (!parent) throw new Error("Dossier parent introuvable.");
      }
      await prisma.folder.create({
        data: { id: s(p.id), clientId, parentId, name },
      });
      return;
    }

    case "folder.rename": {
      const id = s(p.id);
      const name = safeFolderName(p.name);
      if (!name) throw new Error("Le nom du dossier est obligatoire.");
      await prisma.folder.update({ where: { id }, data: { name } });
      return;
    }

    case "folder.move": {
      const id = s(p.id);
      const parentId = optS(p.parentId) ?? null;
      const folder = await prisma.folder.findUnique({ where: { id } });
      if (!folder) throw new Error("Dossier introuvable.");
      if (parentId) {
        if (parentId === id) throw new Error("Un dossier ne peut pas être déplacé dans lui-même.");
        const dead = new Set(await folderDescendantIds(id));
        if (dead.has(parentId)) {
          throw new Error("Un dossier ne peut pas être déplacé dans un de ses sous-dossiers.");
        }
        const parent = await prisma.folder.findUnique({ where: { id: parentId } });
        if (!parent) throw new Error("Dossier de destination introuvable.");
        if (parent.clientId !== folder.clientId) {
          throw new Error("Les dossiers ne peuvent pas changer de client.");
        }
      }
      await prisma.folder.update({ where: { id }, data: { parentId } });
      return;
    }

    case "folder.delete": {
      const id = s(p.id);
      const dead = await folderDescendantIds(id);
      await unlinkFolderFiles(dead);
      // Cascade Prisma : sous-dossiers récursifs + documents contenus
      await prisma.folder.delete({ where: { id } });
      return;
    }

    // ── MISSIONS ─────────────────────────────────────────────
    case "workItem.upsert": {
      const title = s(p.title);
      if (!title) throw new Error("L'intitulé de la mission est obligatoire.");
      const id = s(p.id);
      const clientId = s(p.clientId);
      const data = {
        title,
        category: s(p.category) || "DIVERS",
        status: s(p.status) || "A_FAIRE",
        priority: s(p.priority) || "NORMALE",
        dueDate: optDate(p.dueDate),
        notes: optS(p.notes),
      };
      const existing = await prisma.workItem.findUnique({ where: { id } });
      if (existing) {
        await prisma.workItem.update({ where: { id }, data });
      } else {
        if (!clientId) throw new Error("Dossier client manquant.");
        await prisma.workItem.create({ data: { id, clientId, ...data } });
      }
      return;
    }

    case "workItem.delete": {
      await prisma.workItem.delete({ where: { id: s(p.id) } });
      return;
    }

    // ── DOCUMENTS ────────────────────────────────────────────
    case "document.create": {
      const name = s(p.name);
      if (!name) throw new Error("Le nom du document est obligatoire.");
      const kind = s(p.kind) || "SHEET";
      const content =
        kind === "SHEET"
          ? s(p.content) || JSON.stringify({ cols: ["Colonne A", "Colonne B", "Colonne C"], rows: Array.from({ length: 8 }, () => ["", "", ""]) })
          : kind === "DOC"
            ? s(p.content) || `<h1>Nouveau document</h1><p>Commencez à rédiger ici…</p>`
            : null;
      const folderId = optS(p.folderId);
      if (folderId) {
        const folder = await prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder) throw new Error("Dossier de destination introuvable.");
      }

      // ── VRAI FICHIER MICROSOFT dès la création ──
      // Tableur → classeur .xlsx mis en forme ; document → .docx réel.
      // Le fichier s'ouvre ensuite dans Microsoft Excel / Word avec
      // l'intégralité des fonctionnalités du produit Office.
      let filePath: string | undefined;
      let displayName = name;
      let mimeType: string | undefined;
      let size: number | undefined;
      if (kind === "SHEET" || kind === "DOC") {
        const isSheet = kind === "SHEET";
        const ext = isSheet ? ".xlsx" : ".docx";
        displayName = new RegExp(`\\${ext}$`, "i").test(name)
          ? name
          : `${name.replace(/\.(xlsx|docx)$/i, "")}${ext}`;
        try {
          const bytes = isSheet
            ? await generateSheetXlsxBytes(displayName, content)
            : await generateDocxBytes(displayName, content);
          const storedName = `${randomUUID()}-${displayName.replace(/[\/\\\0]/g, "_")}`;
          await fs.mkdir(UPLOAD_DIR, { recursive: true });
          await fs.writeFile(path.join(UPLOAD_DIR, storedName), bytes);
          filePath = storedName;
          mimeType = isSheet
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          size = bytes.byteLength;
        } catch {
          // génération impossible (ex. hors-ligne) → le fichier sera
          // matérialisé à l'ouverture de la page document (ensureOfficeFile)
        }
      }

      await prisma.document.create({
        data: {
          id: s(p.id),
          name: displayName,
          kind,
          entity: s(p.entity) || "CABINET",
          content,
          folderId,
          workItemId: optS(p.workItemId),
          ...(filePath ? { filePath } : {}),
          ...(mimeType ? { mimeType } : {}),
          ...(size !== undefined ? { size } : {}),
        },
      });
      return;
    }

    case "document.saveContent": {
      const id = s(p.id);
      const existing = await prisma.document.findUnique({ where: { id } });
      if (!existing) throw new Error("Document introuvable.");

      // Fichier réel joint à la sauvegarde (.xlsx tableur ou .docx document
      // Word) → écrit sur le disque et référencé par le document (vrai
      // fichier Microsoft téléchargeable, extension selon le type MIME).
      let filePath: string | undefined;
      let size: number | undefined;
      let mimeType: string | undefined;
      if (m.fileBase64) {
        const buffer = Buffer.from(m.fileBase64, "base64");
        if (buffer.length > 20 * 1024 * 1024) {
          throw new Error("Fichier trop volumineux (20 Mo maximum).");
        }
        const declaredMime = optS(p.mimeType) || "";
        const isWord = declaredMime.includes("wordprocessingml");
        const isExcel =
          declaredMime.includes("spreadsheetml") || declaredMime.includes("ms-excel");
        const ext = isWord ? ".docx" : isExcel ? ".xlsx" : "";
        const displayName = (optS(p.name) || existing.name).replace(/[\/\\\0]/g, "_");
        const safeName = ext
          ? new RegExp(`\\${ext}$`, "i").test(displayName)
            ? displayName
            : `${displayName}${ext}`
          : displayName;
        const storedName = `${randomUUID()}-${safeName}`;
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await fs.writeFile(path.join(UPLOAD_DIR, storedName), buffer);
        // L'ancien fichier devient orphelin → nettoyage silencieux
        if (existing.filePath) {
          await fs
            .unlink(path.join(UPLOAD_DIR, path.basename(existing.filePath)))
            .catch(() => {});
        }
        filePath = storedName;
        size = buffer.length;
        mimeType =
          declaredMime ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }

      await prisma.document.update({
        where: { id },
        data: {
          content: s(p.content),
          name: optS(p.name) || existing.name,
          version: { increment: 1 },
          ...(filePath ? { filePath } : {}),
          ...(size !== undefined ? { size } : {}),
          ...(mimeType ? { mimeType } : {}),
        },
      });
      return;
    }

    case "document.rename": {
      const name = s(p.name);
      if (name) await prisma.document.update({ where: { id: s(p.id) }, data: { name } });
      return;
    }

    case "document.move": {
      const id = s(p.id);
      const folderId = optS(p.folderId) ?? null;
      const doc = await prisma.document.findUnique({ where: { id } });
      if (!doc) throw new Error("Document introuvable.");
      if (folderId) {
        const folder = await prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder) throw new Error("Dossier de destination introuvable.");
      }
      await prisma.document.update({ where: { id }, data: { folderId } });
      return;
    }

    case "document.delete": {
      const id = s(p.id);
      const doc = await prisma.document.findUnique({ where: { id } });
      if (doc?.filePath) {
        try {
          await fs.unlink(path.join(UPLOAD_DIR, path.basename(doc.filePath)));
        } catch {
          // fichier déjà absent
        }
      }
      await prisma.document.delete({ where: { id } });
      return;
    }

    case "document.import": {
      const id = s(p.id);
      // Idempotence : déjà téléversé lors d'un rejeu précédent
      const already = await prisma.document.findUnique({ where: { id } });
      if (already?.filePath) return;

      const name = s(p.name);
      if (!name) throw new Error("Nom de fichier manquant.");
      if (!m.fileBase64) throw new Error("Contenu du fichier manquant (import hors-ligne).");
      const buffer = Buffer.from(m.fileBase64, "base64");
      if (buffer.length > 20 * 1024 * 1024) throw new Error("Fichier trop volumineux (20 Mo maximum).");

      const folderId = optS(p.folderId);
      if (folderId) {
        const folder = await prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder) throw new Error("Dossier de destination introuvable.");
      }

      const safeName = name.replace(/[\/\\\0]/g, "_");
      const storedName = `${randomUUID()}-${safeName}`;
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOAD_DIR, storedName), buffer);

      const ext = safeName.split(".").pop()?.toLowerCase() || "";
      const mimeType = s(p.mimeType) || "application/octet-stream";

      await prisma.document.create({
        data: {
          id,
          name: safeName,
          kind: "FILE",
          entity: "CABINET",
          mimeType,
          size: buffer.length,
          filePath: storedName,
          source: "IMPORT",
          folderId,
        },
      });

      // Fichiers Excel : ouverture du contenu dans l'éditeur
      if (ext === "xlsx" || ext === "csv") {
        try {
          const XLSX = await import("xlsx");
          const wb = XLSX.read(buffer, { type: "buffer" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
          const cols = (aoa[0] || []).map((c, i) => String(c || `Colonne ${i + 1}`));
          const rows = (aoa.slice(1) || []).map((r) => r.map((c) => String(c ?? "")));
          await prisma.document.update({
            where: { id },
            data: { content: JSON.stringify({ cols, rows }) },
          });
        } catch {
          // parsing impossible → fichier reste disponible en téléchargement
        }
      }
      return;
    }

    // ── SOUMISSIONS ──────────────────────────────────────────
    case "submission.setStatus": {
      const status = s(p.status);
      if (!["NOUVEAU", "TRAITE", "ARCHIVE"].includes(status)) throw new Error("Statut invalide.");
      await prisma.submission.update({ where: { id: s(p.id) }, data: { status } });
      return;
    }

    // ── ACADEMY : FORMATIONS ─────────────────────────────────
    case "formation.upsert": {
      const title = s(p.title);
      const skills = s(p.skills);
      if (!title) throw new Error("Le titre de la formation est obligatoire.");
      if (!skills) throw new Error("Les compétences sont obligatoires.");
      const id = s(p.id);
      const data = {
        title,
        hook: optS(p.hook),
        description: optS(p.description),
        category: s(p.category) || "FORMATION_COURTE",
        duration: optS(p.duration),
        price: optS(p.price),
        level: optS(p.level),
        skills,
        outcome: optS(p.outcome),
        status: s(p.status) || "BROUILLON",
        order: typeof p.order === "number" ? p.order : 0,
      };
      const existing = await prisma.formation.findUnique({ where: { id } });
      if (existing) await prisma.formation.update({ where: { id }, data });
      else await prisma.formation.create({ data: { id, ...data } });
      return;
    }

    case "formation.delete": {
      await prisma.formation.delete({ where: { id: s(p.id) } });
      return;
    }

    // ── ACADEMY : ARTICLES ───────────────────────────────────
    case "article.upsert": {
      const title = s(p.title);
      const slug = s(p.slug);
      if (!title || !slug) throw new Error("Titre et slug obligatoires.");
      const id = s(p.id);
      const status = s(p.status) || "BROUILLON";
      const data = {
        title,
        slug,
        excerpt: optS(p.excerpt),
        content: optS(p.content),
        category: optS(p.category),
        readTime: optS(p.readTime),
        status,
      };
      const existing = await prisma.article.findUnique({ where: { id } });
      if (existing) {
        await prisma.article.update({
          where: { id },
          data: {
            ...data,
            publishedAt: status === "PUBLIE" ? existing.publishedAt ?? new Date() : existing.publishedAt,
          },
        });
      } else {
        await prisma.article.create({
          data: { id, ...data, publishedAt: status === "PUBLIE" ? new Date() : null },
        });
      }
      return;
    }

    case "article.delete": {
      await prisma.article.delete({ where: { id: s(p.id) } });
      return;
    }

    // ── ACADEMY : TÉMOIGNAGES ────────────────────────────────
    case "testimonial.upsert": {
      const name = s(p.name);
      const content = s(p.content);
      const entity = s(p.entity);
      if (!name || !content || !entity) throw new Error("Nom, contenu et entité obligatoires.");
      const id = s(p.id);
      const data = {
        name,
        role: optS(p.role),
        entity,
        content,
        result: optS(p.result),
        rating: typeof p.rating === "number" ? p.rating : 5,
        status: s(p.status) || "BROUILLON",
      };
      const existing = await prisma.testimonial.findUnique({ where: { id } });
      if (existing) await prisma.testimonial.update({ where: { id }, data });
      else await prisma.testimonial.create({ data: { id, ...data } });
      return;
    }

    case "testimonial.delete": {
      await prisma.testimonial.delete({ where: { id: s(p.id) } });
      return;
    }

    default:
      throw new Error(`Type de mutation inconnu : ${m.type}`);
  }
}

/**
 * POST /api/back-office/mutations
 * Rejoue un lot de mutations issues de la file hors-ligne sur PostgreSQL,
 * puis renvoie les résultats + un instantané à jour pour réconciliation.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: { mutations?: IncomingMutation[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  const mutations = Array.isArray(body.mutations) ? body.mutations : [];
  if (mutations.length === 0) {
    return NextResponse.json({ error: "Aucune mutation" }, { status: 400 });
  }
  if (mutations.length > 200) {
    return NextResponse.json({ error: "Lot trop volumineux (200 max)" }, { status: 413 });
  }

  const results: MutationResult[] = [];
  for (const m of mutations) {
    try {
      await applyMutation(m);
      results.push({ id: m.id, ok: true });
    } catch (e) {
      if (e instanceof Error && (e.message.includes("obligatoire") || e.message.includes("manquant") || e.message.includes("introuvable"))) {
        results.push({ id: m.id, ok: false, error: e.message });
        continue;
      }
      const { replay, message } = prismaError(e);
      if (replay) {
        // rejeu idempotent d'un create déjà appliqué (réponse réseau perdue)
        results.push({ id: m.id, ok: true });
      } else {
        results.push({ id: m.id, ok: false, error: message || "Échec de l'application." });
      }
    }
  }

  // Réponses du site public visibles immédiatement après synchro.
  // Cache d'instantané invalidé : la réponse ET les prochains rendus de
  // pages servent les données post-mutations.
  invalidateBoSnapshotCache();
  const snapshot = await buildBoSnapshot({ fresh: true });
  return NextResponse.json(
    { results, serverTime: new Date().toISOString(), snapshot },
    { headers: { "Cache-Control": "no-store" } }
  );
}
