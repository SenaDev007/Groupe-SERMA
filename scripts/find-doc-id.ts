/* eslint-disable @typescript-eslint/no-explicit-any */
async function main() {
  const mod = await import("../src/generated/prisma-sqlite");
  const prisma = new mod.PrismaClient();
  const doc = await prisma.document.findFirst({
    where: { kind: "DOC", name: { contains: "Santé Aloma" } },
  });
  if (!doc) { console.log("non trouvé"); return; }
  console.log(doc.id, "|", doc.name, "| v" + doc.version, "|", doc.mimeType, "|", doc.size, "octets");
  console.log("contenu (extrait):", (doc.content ?? "").slice(0, 150));
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e.message); process.exit(1); });
