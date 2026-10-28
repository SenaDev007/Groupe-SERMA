import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";

/**
 * STOCKAGE UNIFIÉ DES FICHIERS DU BACK-OFFICE — disque OU base PostgreSQL.
 *
 * Pourquoi : les fonctions serverless (Vercel) ont un système de fichiers
 * EN LECTURE SEULE — `fs.mkdir`/`fs.writeFile` vers upload/bo-files y
 * échouent systématiquement (EROFS/EACCES). C'est ce qui faisait échouer
 * durablement la mutation `document.import` en production
 * (« Échec de l'application (document.import) ») alors que tout
 * fonctionnait en développement local.
 *
 * Stratégie (transparente pour les appelants) :
 *   • ÉCRITURE : on tente le disque (rapide, fichiers volumineux, dev +
 *     serveur du cabinet) ; si le disque refuse (Vercel…), les octets sont
 *     renvoyés pour stockage en base (table `BoFile`, PostgreSQL/Neon).
 *     Dans les DEUX cas un `filePath` est renvoyé : il reste le drapeau
 *     « ce document possède un fichier » partout dans l'application.
 *   • LECTURE : disque d'abord, puis repli base — les fichiers créés sur
 *     un serveur sans disque persistent donc sur tous les déploiements.
 *
 * Module serveur (Prisma + fs) — jamais importé côté client.
 */

/** Répertoire des fichiers : fonctionne quel que soit le répertoire de
 *  travail (dev, build standalone lancé depuis la racine du projet…). */
export function resolveUploadDir(): string {
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

export interface StoredBoFile {
  /** Toujours renseigné (même en stockage base) : drapeau « a un fichier ». */
  filePath: string;
  /** Octets à écrire en base (présents uniquement si le disque a refusé). */
  fileData?: Uint8Array;
  /** Emplacement effectif — informatif pour les journaux. */
  storage: "disk" | "db";
}

/**
 * Écrit les octets d'un fichier : sur le disque si possible, sinon les
 * renvoie pour archivage en base (Vercel : FS en lecture seule).
 * Ne JAMAIS laisser remonter une erreur d'écriture disque : le repli base
 * garantit que l'import / la mise à jour de version réussit partout.
 */
export async function writeBoFile(
  bytes: Uint8Array,
  displayName: string
): Promise<StoredBoFile> {
  const safeName = displayName.replace(/[/\\\0]/g, "_");
  const storedName = `${randomUUID()}-${safeName}`;
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, storedName), bytes);
    return { filePath: storedName, storage: "disk" };
  } catch {
    // Disque indisponible (serverless lecture seule, quota, droits…) :
    // les octets partent en base — le filePath conserve son rôle de
    // drapeau « a un fichier » pour toute l'application.
    return { filePath: storedName, storage: "db", fileData: bytes };
  }
}

/** Archive (ou remplace) les octets d'un document en base. */
export async function saveBoFileBytes(
  documentId: string,
  bytes: Uint8Array
): Promise<void> {
  await prisma.boFile.upsert({
    where: { documentId },
    create: { documentId, data: Buffer.from(bytes) },
    update: { data: Buffer.from(bytes) },
  });
}

/** Lit le fichier d'un document : disque d'abord, puis repli base. */
export async function readBoFile(
  documentId: string,
  filePath: string | null
): Promise<Buffer | null> {
  if (filePath) {
    try {
      // Sécurité : basename uniquement, aucun traversal possible.
      return await fs.readFile(path.join(UPLOAD_DIR, path.basename(filePath)));
    } catch {
      /* absent du disque (autre serveur…) → essayer la base */
    }
  }
  const row = await prisma.boFile.findUnique({ where: { documentId } });
  return row ? Buffer.from(row.data) : null;
}

/** Le document possède-t-il physiquement son fichier (disque OU base) ? */
export async function boFileExists(
  documentId: string,
  filePath: string | null
): Promise<boolean> {
  if (filePath) {
    try {
      if (
        fsSync.existsSync(path.join(UPLOAD_DIR, path.basename(filePath)))
      ) {
        return true;
      }
    } catch {
      /* continuer */
    }
  }
  const row = await prisma.boFile.findUnique({
    where: { documentId },
    select: { documentId: true },
  });
  return !!row;
}

/** Supprime le fichier d'un document : disque + base (silencieux). */
export async function removeBoFile(
  documentId: string,
  filePath: string | null
): Promise<void> {
  if (filePath) {
    try {
      await fs.unlink(path.join(UPLOAD_DIR, path.basename(filePath)));
    } catch {
      // fichier déjà absent
    }
  }
  try {
    // deleteMany : aucun bruit dans les journaux si l'entrée est absente.
    await prisma.boFile.deleteMany({ where: { documentId } });
  } catch {
    // base momentanément indisponible : la cascade Document s'en chargera
  }
}
