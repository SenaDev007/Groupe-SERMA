/**
 * Migration FiscalYear → Folder (arborescence libre type Explorateur Windows).
 *
 * Stratégie :
 *  1. Un dossier RACINE est créé pour chaque client — id déterministe
 *     `root_<clientId>` (idempotent, sans collision avec les cuid).
 *  2. Chaque FiscalYear devient un Folder : MÊME id (les documents et
 *     missions pointent déjà vers ces ids → migration sans remappage),
 *     placé à la racine du dossier client (parentId = root_<clientId>).
 *  3. Documents : folderId = fiscalYearId ; si absent, rattachement à la
 *     racine du client via la mission (workItem → fiscalYear → client).
 *  4. WorkItems : clientId = celui de leur exercice.
 *
 * Le script est idempotent : ré-exécutable sans duplication.
 */
// Client selon la base active : Neon (postgres) ou miroir local (SQLite)
const { PrismaClient } =
  process.env.SERMAHUB_DATABASE_URL &&
  !process.env.SERMAHUB_DATABASE_URL.startsWith("file:")
    ? require("@prisma/client")
    : require("../src/generated/prisma-sqlite");
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany();
  console.log(`Clients : ${clients.length}`);

  // 1. Dossiers racine
  for (const c of clients) {
    const rootId = `root_${c.id}`;
    await prisma.folder.upsert({
      where: { id: rootId },
      create: { id: rootId, clientId: c.id, parentId: null, name: c.name },
      update: { name: c.name },
    });
  }
  console.log(`Dossiers racine créés/vérifiés : ${clients.length}`);

  // 2. FiscalYear → Folder (id conservé)
  const years = await prisma.fiscalYear.findMany();
  let foldersCreated = 0;
  for (const y of years) {
    const exists = await prisma.folder.findUnique({ where: { id: y.id } });
    if (exists) continue;
    await prisma.folder.create({
      data: {
        id: y.id,
        clientId: y.clientId,
        parentId: `root_${y.clientId}`,
        name: y.label,
      },
    });
    foldersCreated++;
  }
  console.log(`Exercices migrés en dossiers : ${foldersCreated}/${years.length}`);

  // 3. Documents → folderId
  const docsNoYear = await prisma.document.findMany({ where: { fiscalYearId: null } });
  let docsDirect = 0;
  let docsViaMission = 0;
  for (const d of docsNoYear) {
    if (!d.folderId && d.workItemId) {
      const wi = await prisma.workItem.findUnique({
        where: { id: d.workItemId },
        include: { fiscalYear: true },
      });
      if (wi?.fiscalYear) {
        await prisma.document.update({
          where: { id: d.id },
          data: { folderId: wi.fiscalYear.id },
        });
        docsViaMission++;
      }
    }
  }
  const res = await prisma.$executeRawUnsafe(
    `UPDATE "Document" SET "folderId" = "fiscalYearId" WHERE "fiscalYearId" IS NOT NULL AND "folderId" IS NULL`
  );
  docsDirect = res;
  console.log(`Documents rattachés : ${docsDirect} directs + ${docsViaMission} via mission`);

  // 4. WorkItems → clientId
  const wiRes = await prisma.$executeRawUnsafe(`
    UPDATE "WorkItem" w
    SET "clientId" = f."clientId"
    FROM "FiscalYear" f
    WHERE w."fiscalYearId" = f.id AND w."clientId" IS NULL
  `);
  console.log(`Missions rattachées au client : ${wiRes}`);

  // Vérifications
  const totalFolders = await prisma.folder.count();
  const docsUnfiled = await prisma.document.count({
    where: { folderId: null, entity: "CABINET" },
  });
  const wiNoClient = await prisma.workItem.count({ where: { clientId: null } });
  console.log(`--- Vérification ---`);
  console.log(`Dossiers totaux : ${totalFolders} (attendu : ${clients.length + years.length})`);
  console.log(`Documents cabinet sans dossier : ${docsUnfiled}`);
  console.log(`Missions sans client : ${wiNoClient}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
