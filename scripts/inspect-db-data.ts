// Inspection rapide de la base : données des classeurs par client
/* eslint-disable @typescript-eslint/no-explicit-any */
async function main() {
  const mod = await import("../src/generated/prisma-sqlite");
  const prisma = new mod.PrismaClient();

  const sheets = await prisma.document.findMany({
    where: { kind: "SHEET" },
    include: { folder: { include: { client: true } } },
  });

  console.log(`=== ${sheets.length} classeurs ===`);
  for (const doc of sheets) {
    const client = (doc as any).folder?.client?.name ?? "?";
    // Résumé du contenu (grille héritée) : nb lignes + première valeur numérique de la 2e ligne
    let summary = "";
    try {
      const parsed = JSON.parse(doc.content ?? "{}");
      const rows = parsed.rows ?? [];
      const firstDataRow = rows[1] ?? rows[0] ?? [];
      summary = `${parsed.cols?.length ?? 0} cols × ${rows.length} lignes | ligne1: ${JSON.stringify(firstDataRow).slice(0, 120)}`;
    } catch {
      summary = `(fichier .xlsx: ${(doc as any).filePath ?? "—"})`;
    }
    console.log(`• [${client}] ${doc.name}`);
    console.log(`   ${summary}`);
  }

  // Vérif : les contenus sont-ils identiques entre clients ?
  const contents = new Map<string, number>();
  for (const doc of sheets) {
    const key = (doc.content ?? "").slice(0, 500);
    contents.set(key, (contents.get(key) ?? 0) + 1);
  }
  console.log(`\nContenus uniques: ${contents.size} / ${sheets.length} classeurs`);

  const docs = await prisma.document.findMany({ where: { kind: "DOC" } });
  console.log(`\n=== ${docs.length} documents Word ===`);
  const docContents = new Map<string, number>();
  for (const d of docs) {
    const key = (d.content ?? "").slice(0, 500);
    docContents.set(key, (docContents.get(key) ?? 0) + 1);
    console.log(`• ${d.name} — ${(d.content ?? "").length} caractères HTML`);
  }
  console.log(`Contenus uniques: ${docContents.size} / ${docs.length} documents`);

  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
