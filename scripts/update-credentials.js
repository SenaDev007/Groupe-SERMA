// Mise à jour des identifiants administrateur back-office.
// Les secrets sont lus depuis l'environnement (.env) — jamais versionnés :
//   SERMAHUB_DATABASE_URL, SERMAHUB_DIRECT_URL,
//   BO_ADMIN_EMAIL, BO_ADMIN_PASSWORD, BO_ADMIN_NAME
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const POOLER = process.env.SERMAHUB_DATABASE_URL;
const DIRECT = process.env.SERMAHUB_DIRECT_URL;

const NEW_EMAIL = process.env.BO_ADMIN_EMAIL;
const NEW_PASSWORD = process.env.BO_ADMIN_PASSWORD;
const NEW_NAME = process.env.BO_ADMIN_NAME || "Administrateur";

if (!POOLER || !DIRECT || !NEW_EMAIL || !NEW_PASSWORD) {
  console.error(
    "Variables d'environnement manquantes. Renseignez .env à partir de .env.example :\n" +
      "  SERMAHUB_DATABASE_URL, SERMAHUB_DIRECT_URL, BO_ADMIN_EMAIL, BO_ADMIN_PASSWORD"
  );
  process.exit(1);
}

async function tryUrl(url, label) {
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    await p.$connect();
    const n = await p.user.count();
    console.log(`[OK] ${label} connecté — ${n} utilisateur(s)`);
    return p;
  } catch (e) {
    console.log(`[ÉCHEC] ${label} : ${String(e.message).slice(0, 120)}`);
    await p.$disconnect().catch(() => {});
    return null;
  }
}

async function main() {
  let prisma = await tryUrl(POOLER, "Pooler");
  if (!prisma) prisma = await tryUrl(DIRECT, "Direct");
  if (!prisma) process.exit(1);

  const hash = await bcrypt.hash(NEW_PASSWORD, 10);

  // Désactive l'ancien admin, crée (ou met à jour) le nouveau
  await prisma.user.updateMany({
    where: { email: { not: NEW_EMAIL } },
    data: { role: "LECTEUR" },
  });

  const existing = await prisma.user.findUnique({ where: { email: NEW_EMAIL } });
  if (existing) {
    await prisma.user.update({
      where: { email: NEW_EMAIL },
      data: { passwordHash: hash, role: "ADMIN", name: NEW_NAME },
    });
    console.log("Utilisateur existant mis à jour → ADMIN");
  } else {
    await prisma.user.create({
      data: { email: NEW_EMAIL, passwordHash: hash, role: "ADMIN", name: NEW_NAME },
    });
    console.log("Nouvel administrateur créé");
  }

  // L'ancien compte n'est plus connectable : on le supprime
  await prisma.user.deleteMany({ where: { email: "admin@sermagroupe.bj" } });

  const users = await prisma.user.findMany({ select: { email: true, role: true, name: true } });
  console.log("Utilisateurs finaux :", JSON.stringify(users, null, 2));

  // Vérification du hash
  const u = await prisma.user.findUnique({ where: { email: NEW_EMAIL } });
  console.log("Vérification bcrypt :", (await bcrypt.compare(NEW_PASSWORD, u.passwordHash)) ? "OK" : "ÉCHEC");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
