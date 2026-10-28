/**
 * BACKFILL — archive en base (table BoFile) les fichiers présents sur le
 * disque local (upload/bo-files).
 *
 * Contexte : les déploiements serverless (Vercel) n'ont PAS de disque
 * persistant. Les documents dont le fichier n'existe que sur le serveur de
 * développement ne seraient donc pas téléchargeables / ouvrables dans
 * Excel en production. Ce script copie les octets de chaque fichier en
 * base PostgreSQL (Neon) : la route /api/back-office/files/<id>/office
 * sert ensuite le disque OU la base, partout.
 *
 * Idempotent : les documents disposant déjà d'une archive BoFile sont
 * ignorés. À relancer après tout ajout de fichier directement sur disque.
 *
 * Usage : bun scripts/backfill-bofiles.ts
 */
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { resolveUploadDir } from "@/lib/office/storage";

async function main(): Promise<void> {
  const uploadDir = resolveUploadDir();
  const docs = await prisma.document.findMany({
    where: { filePath: { not: null } },
    select: { id: true, filePath: true, name: true },
    orderBy: { updatedAt: "desc" },
  });

  console.log(
    `${docs.length} document(s) avec fichier — répertoire disque : ${uploadDir}`
  );

  let archived = 0;
  let already = 0;
  let missing = 0;

  for (const d of docs) {
    const fp = d.filePath as string;
    const existing = await prisma.boFile.findUnique({
      where: { documentId: d.id },
      select: { documentId: true },
    });
    if (existing) {
      already++;
      continue;
    }
    try {
      // Sécurité : basename uniquement, aucun traversal possible.
      const bytes = await fs.readFile(path.join(uploadDir, path.basename(fp)));
      await prisma.boFile.create({ data: { documentId: d.id, data: bytes } });
      archived++;
      console.log(`  ✔ archivé : ${d.name} (${bytes.length} octets)`);
    } catch {
      missing++;
      console.warn(`  ⚠ fichier absent du disque : ${d.name} (${fp})`);
    }
  }

  console.log(
    `Backfill terminé : ${archived} archivé(s), ${already} déjà en base, ${missing} introuvable(s).`
  );
}

main()
  .catch((e) => {
    console.error("Échec du backfill :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
