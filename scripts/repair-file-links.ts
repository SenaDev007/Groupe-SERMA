/**
 * RÉPARATION des liens fichiers Office : la base référence des fichiers
 * (`filePath` = « UUID-nom.xlsx ») qui n'existent plus sous ce nom exact
 * sur le disque (UUID régénéré lors d'un re-seed), alors que les VRAIS
 * fichiers (mêmes noms affichés) sont bien présents.
 *
 * Ce script ré-apparie chaque document à son fichier physique par nom
 * affiché (suffixe après l'UUID) et met à jour `filePath` + `size`.
 *
 * Usage : bun scripts/repair-file-links.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const p = new PrismaClient();
const DIR = path.join(process.cwd(), "upload", "bo-files");

const docs = await p.document.findMany({
  where: { filePath: { not: null } },
  select: { id: true, name: true, filePath: true, size: true, mimeType: true },
});
const onDisk = fs.readdirSync(DIR);
const onDiskSet = new Set(onDisk);

/** Suffixe affichable après l'UUID (36 caractères 8-4-4-4-12) :
 *  « uuid-Note de cadrage….docx » → « Note de cadrage….docx ». */
function displaySuffix(filePath: string): string {
  const idx = filePath.indexOf("-", 36);
  return idx > 0 ? filePath.slice(idx + 1) : filePath;
}

// Index des fichiers présents sur disque par nom affichable
const byDisplay = new Map<string, string[]>();
for (const f of onDisk) {
  const key = displaySuffix(f);
  byDisplay.set(key, [...(byDisplay.get(key) ?? []), f]);
}

const used = new Set<string>();
let repaired = 0;
let alreadyOk = 0;
let stillMissing: string[] = [];

for (const d of docs) {
  const fp = d.filePath!;
  if (onDiskSet.has(fp)) {
    alreadyOk++;
    used.add(fp);
    continue;
  }
  // Ré-appariement par nom affichable
  const candidates = (byDisplay.get(displaySuffix(fp)) ?? []).filter((f) => !used.has(f));
  const match = candidates[0];
  if (!match) {
    stillMissing.push(`${d.name} → ${fp.slice(0, 50)}…`);
    continue;
  }
  const size = fs.statSync(path.join(DIR, match)).size;
  await p.document.update({
    where: { id: d.id },
    data: { filePath: match, ...(size ? { size } : {}) },
  });
  used.add(match);
  repaired++;
  console.log(`  ↻ « ${d.name} » → ${match.slice(0, 70)}`);
}

console.log(`\n${alreadyOk} déjà conformes, ${repaired} ré-appariés, ${stillMissing.length} introuvables.`);
if (stillMissing.length > 0) {
  console.log("Introuvables (régénérés à l'ouverture) :");
  for (const m of stillMissing) console.log("  ✖", m);
}
await p.$disconnect();
