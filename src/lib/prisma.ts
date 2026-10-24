/**
 * Client Prisma du back-office Groupe SERMA — DOUBLE PROVIDER.
 *
 * Deux bases possibles, choisies automatiquement selon l'environnement :
 *  - PostgreSQL distant (Neon « SermaHub ») : la base de production,
 *    activée dès que SERMAHUB_DATABASE_URL est présente (URL postgres://).
 *  - SQLite locale (miroir de démonstration) : repli automatique via
 *    DATABASE_URL / BO_FALLBACK_URL (URL file:…) lorsque la variable
 *    Neon n'est pas disponible (redémarrage de session sans secret, mode
 *    démo hors connexion). Le schéma SQLite est prisma/schema-sqlite.prisma.
 *
 * Le choix est fait UNE fois par processus ; un changement d'URL recrée
 * proprement le client (bascule à chaud en dev).
 */

import fsSync from "fs";
import path from "path";
import { PrismaClient as PrismaClientPg } from "@prisma/client";
import { PrismaClient as PrismaClientSqlite } from "@/generated/prisma-sqlite";

type AnyPrisma = PrismaClientPg | PrismaClientSqlite;

const globalForPrisma = globalThis as unknown as {
  prisma?: AnyPrisma;
  prismaUrl?: string;
};

/** Base SQLite locale par défaut : cherchée près du répertoire de travail
 *  (racine du projet ou dossier .next/standalone du build de production). */
function defaultSqliteUrl(): string {
  const candidates = [
    process.env.BO_FALLBACK_URL,
    process.env.DATABASE_URL,
    path.join(process.cwd(), "db", "custom.db"),
    path.join(process.cwd(), "..", "db", "custom.db"),
    path.join(process.cwd(), "db", "test.db"),
  ].filter((v): v is string => !!v);

  for (const c of candidates) {
    const p = c.startsWith("file:") ? c.slice(5) : c;
    try {
      if (fsSync.existsSync(p)) return `file:${p}`;
    } catch {
      /* continuer */
    }
  }
  // Rien trouvé sur le disque : on rend le premier candidat non vide —
  // Prisma signalera proprement l'absence de fichier.
  const first = candidates[0];
  return first ? (first.startsWith("file:") ? first : `file:${first}`) : "";
}

/** URL effective : Neon d'abord, repli local ensuite. */
export function resolveDatabaseUrl(): string {
  const primary = process.env.SERMAHUB_DATABASE_URL;
  if (primary && !primary.startsWith("file:")) return primary;
  return defaultSqliteUrl();
}

function isSqliteUrl(url: string): boolean {
  return url.startsWith("file:");
}

function createClient(url: string): AnyPrisma {
  if (isSqliteUrl(url)) {
    // Le client SQLite généré lit sa propre variable de connexion :
    // on la renseigne avant l'instanciation (aucune configuration
    // préalable du processus n'est nécessaire).
    if (!process.env.BO_FALLBACK_URL) process.env.BO_FALLBACK_URL = url;
    return new PrismaClientSqlite({ log: ["error", "warn"] });
  }
  return new PrismaClientPg({ log: ["error", "warn"] });
}

const url = resolveDatabaseUrl();

// Bascule de base (ex. SQLite → PostgreSQL) : recrée le client si l'URL
// change, même si le processus dev n'a pas redémarré.
if (globalForPrisma.prisma && globalForPrisma.prismaUrl !== url) {
  const old = globalForPrisma.prisma;
  globalForPrisma.prisma = undefined;
  void old.$disconnect().catch(() => {});
}
globalForPrisma.prismaUrl = url;

export const prisma: AnyPrisma =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = createClient(url));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
