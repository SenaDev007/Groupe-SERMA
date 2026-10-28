/**
 * VÉRIFICATION — simulation de l'environnement Vercel (FS lecture seule).
 *
 * Doit être lancé avec l'environnement posé par le shell AVANT le démarrage
 * du processus (le répertoire d'upload est résolu au chargement du module) :
 *
 *   mkdir -p /tmp/ro-bo-test && chmod 555 /tmp/ro-bo-test && \
 *   BO_UPLOAD_DIR=/tmp/ro-bo-test bun scripts/e2e-vercel-readonly.ts
 *
 * Reproduit exactement le comportement d'une fonction serverless Vercel :
 * le répertoire existe mais n'est PAS inscriptible → writeBoFile doit
    * basculer sur le stockage en base (table BoFile) et readBoFile doit
 * relire les octets depuis la base.
 */
import prisma from "@/lib/prisma";
import {
  writeBoFile,
  saveBoFileBytes,
  readBoFile,
  boFileExists,
  removeBoFile,
} from "@/lib/office/storage";

let failures = 0;
function check(label: string, ok: boolean, detail = ""): void {
  const mark = ok ? "✔" : "✘ ÉCHEC";
  console.log(`  ${mark} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function main(): Promise<void> {
  console.log("\n── Simulation Vercel : système de fichiers en lecture seule ──");
  console.log(`  BO_UPLOAD_DIR = ${process.env.BO_UPLOAD_DIR ?? "(non défini)"}`);

  const probeDoc = await prisma.document.create({
    data: {
      name: "Test E2E Vercel lecture seule.xlsx",
      kind: "FILE",
      entity: "CABINET",
      source: "IMPORT",
    },
  });
  try {
    const sample = Buffer.from(
      "PK\x03\x04 — octets de test E2E (simulation Vercel lecture seule)"
    );
    const stored = await writeBoFile(sample, "vercel-readonly-test.xlsx");
    check(
      "Écriture disque refusée → repli base automatique (storage=db)",
      stored.storage === "db" && !!stored.fileData,
      `storage=${stored.storage}`
    );
    if (stored.fileData) {
      await saveBoFileBytes(probeDoc.id, stored.fileData);
      const reread = await readBoFile(probeDoc.id, stored.filePath);
      check(
        "Octets relus depuis la base (comme sur Vercel)",
        !!reread && reread.equals(sample),
        `${reread?.length ?? 0} octets identiques`
      );
      check(
        "boFileExists → true sans aucun fichier disque",
        await boFileExists(probeDoc.id, stored.filePath)
      );
    }
  } finally {
    await removeBoFile(probeDoc.id, null);
    await prisma.document.delete({ where: { id: probeDoc.id } });
  }

  console.log(
    `\n${failures === 0 ? "✔ SIMULATION VERCEL RÉUSSIE" : `✘ ${failures} ÉCHEC(S)`}`
  );
}

main()
  .catch((e) => {
    console.error("Erreur simulation :", e);
    failures++;
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exitCode = failures === 0 ? 0 : 1;
  });
