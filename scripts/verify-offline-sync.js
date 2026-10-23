// Vérification finale : le client créé hors-ligne a-t-il atteint PostgreSQL ?
import { PrismaClient } from "@prisma/client";

const url = process.env.SERMAHUB_DATABASE_URL;
if (!url) {
  console.error("Variable SERMAHUB_DATABASE_URL manquante — renseignez .env (voir .env.example).");
  process.exit(1);
}
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const client = await prisma.client.findFirst({
    where: { name: { contains: "Hors-Ligne" } },
    include: { fiscalYears: true },
  });
  if (client) {
    console.log("✔ Client synchronisé vers PostgreSQL :");
    console.log("  - id:", client.id);
    console.log("  - nom:", client.name);
    console.log("  - type:", client.type, "| secteur:", client.sector, "| contact:", client.contactName);
    console.log("  - exercice initial:", client.fiscalYears.map((y) => y.label).join(", ") || "AUCUN");
    console.log("  - id local (loc_cli_…):", client.id.startsWith("loc_cli") ? "OUI — identifiant local préservé" : "non");
  } else {
    console.log("✘ Client NON trouvé en base !");
  }
  const total = await prisma.client.count();
  console.log("Total clients en base :", total);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
