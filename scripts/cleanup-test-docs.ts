/**
 * NETTOYAGE après tests E2E :
 *  1. Supprime le document de test « Budget test — vrai Excel » créé
 *     pendant la validation (+ son fichier physique).
 *  2. Régénère le VRAI fichier « Note de cadrage — ONG Santé Aloma »
 *     depuis son contenu HTML d'origine en base (le fichier avait été
 *     remplacé par la version de test d'aller-retour).
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const p = new PrismaClient();
const DIR = path.join(process.cwd(), "upload", "bo-files");

// ── 1) Suppression du document de test ──
const testDoc = await p.document.findFirst({
  where: { name: { contains: "Budget test" } },
});
if (testDoc) {
  if (testDoc.filePath) {
    try {
      fs.unlinkSync(path.join(DIR, path.basename(testDoc.filePath)));
    } catch {
      /* déjà absent */
    }
  }
  await p.document.delete({ where: { id: testDoc.id } });
  console.log("✓ Document de test supprimé :", testDoc.name);
} else {
  console.log("• Aucun document de test à supprimer");
}

// ── 2) Régénération du Note de cadrage depuis le contenu d'origine ──
const note = await p.document.findFirst({
  where: { name: { contains: "Note de cadrage — certification 2025-2026 (ONG Santé Aloma)" } },
});
if (note) {
  const { generateDocxBytes } = await import("../src/lib/office/generate");
  const bytes = await generateDocxBytes(note.name, note.content);
  const storedName = `${randomUUID()}-${note.name.replace(/[\/\\\0]/g, "_")}`;
  fs.writeFileSync(path.join(DIR, storedName), bytes);
  if (note.filePath) {
    try {
      fs.unlinkSync(path.join(DIR, path.basename(note.filePath)));
    } catch {
      /* déjà absent */
    }
  }
  await p.document.update({
    where: { id: note.id },
    data: { filePath: storedName, size: bytes.byteLength, version: { increment: 1 } },
  });
  console.log("✓ Note de cadrage régénérée depuis le contenu d'origine :", storedName.slice(0, 70));
}

await p.$disconnect();
