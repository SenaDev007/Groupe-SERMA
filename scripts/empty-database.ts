/**
 * PURGE TOTALE DE LA BASE — plus aucune donnée de démonstration.
 *
 * Supprime TOUTES les données métier : clients (ONG et entreprises),
 * dossiers, documents (+ octets archivés en base), missions, soumissions,
 * formations, articles et témoignages — ainsi que les fichiers physiques
 * du répertoire upload/bo-files (devenus orphelins).
 *
 * CONSERVÉ : les comptes de connexion (table User) — sans eux, impossible
 * d'accéder au back-office. Pour un compte vierge également, supprimer la
 * table User manuellement.
 *
 * La base Neon étant partagée entre le développement local et la
 * production Vercel, cette purge s'applique AUX DEUX environnements.
 *
 * Usage : bun scripts/empty-database.ts
 */
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { resolveUploadDir } from "@/lib/office/storage";

async function main(): Promise<void> {
  const before = {
    clients: await prisma.client.count(),
    folders: await prisma.folder.count(),
    documents: await prisma.document.count(),
    boFiles: await prisma.boFile.count(),
    workItems: await prisma.workItem.count(),
    submissions: await prisma.submission.count(),
    formations: await prisma.formation.count(),
    articles: await prisma.article.count(),
    testimonials: await prisma.testimonial.count(),
    users: await prisma.user.count(),
  };

  console.log("État AVANT purge :");
  for (const [k, v] of Object.entries(before)) console.log(`  ${k.padEnd(14)} ${v}`);

  // Ordre sûr vis-à-vis des clés étrangères (certaines cascades auraient
  // suffi, mais chaque deleteMany est explicite).
  await prisma.boFile.deleteMany();
  await prisma.document.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.client.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.formation.deleteMany();
  await prisma.article.deleteMany();
  await prisma.testimonial.deleteMany();

  // Fichiers physiques orphelins (documents supprimés)
  const uploadDir = resolveUploadDir();
  let diskRemoved = 0;
  try {
    const entries = await fs.readdir(uploadDir);
    for (const e of entries) {
      await fs.rm(path.join(uploadDir, e), { recursive: true, force: true });
      diskRemoved++;
    }
  } catch {
    // répertoire absent
  }

  const after = {
    clients: await prisma.client.count(),
    folders: await prisma.folder.count(),
    documents: await prisma.document.count(),
    boFiles: await prisma.boFile.count(),
    workItems: await prisma.workItem.count(),
    submissions: await prisma.submission.count(),
    formations: await prisma.formation.count(),
    articles: await prisma.article.count(),
    testimonials: await prisma.testimonial.count(),
    users: await prisma.user.count(),
  };

  console.log("\nÉtat APRÈS purge :");
  for (const [k, v] of Object.entries(after)) console.log(`  ${k.padEnd(14)} ${v}`);
  console.log(`\nFichiers disque supprimés : ${diskRemoved} (répertoire ${uploadDir})`);
  console.log(
    `\nComptes de connexion conservés : ${after.users} (table User — accès back-office préservé).`
  );

  const empty =
    after.clients === 0 &&
    after.folders === 0 &&
    after.documents === 0 &&
    after.boFiles === 0 &&
    after.workItems === 0 &&
    after.submissions === 0 &&
    after.formations === 0 &&
    after.articles === 0 &&
    after.testimonials === 0;

  console.log(
    empty
      ? "\n✔ BASE VIDÉE — aucune donnée métier restante."
      : "\n✘ ATTENTION : des données restent (voir ci-dessus)."
  );
  if (!empty) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error("Échec de la purge :", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
