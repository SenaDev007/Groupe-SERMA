/**
 * Prépare un dossier de test HIÉRARCHISÉ sur le disque pour l'E2E
 * navigateur de l'import de dossier (ImportFolderDialog) :
 *
 *   /tmp/e2e-dossier/Dossier comptable 2025/
 *     ├── Balances/balance-generale.xlsx   (vrai classeur SheetJS)
 *     ├── Cadrages/note-de-cadrage.docx    (octets docx factices)
 *     └── a-ignorer.txt                    (ni Word ni Excel → ignoré)
 *
 * Usage : bun scripts/make-e2e-folder.ts
 */
import * as XLSX from "xlsx";
import fs from "fs/promises";

const ROOT = "/tmp/e2e-dossier/Dossier comptable 2025";

async function main(): Promise<void> {
  await fs.rm("/tmp/e2e-dossier", { recursive: true, force: true });
  await fs.mkdir(`${ROOT}/Balances`, { recursive: true });
  await fs.mkdir(`${ROOT}/Cadrages`, { recursive: true });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Compte", "Libellé", "Solde"],
      ["101", "Caisse", 125000],
      ["701", "Ventes", 98500],
    ]),
    "Feuil1"
  );
  const xlsx = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  await fs.writeFile(`${ROOT}/Balances/balance-generale.xlsx`, xlsx);
  await fs.writeFile(
    `${ROOT}/Cadrages/note-de-cadrage.docx`,
    Buffer.from("PK\x03\x04 — note de cadrage E2E (import dossier)")
  );
  await fs.writeFile(`${ROOT}/a-ignorer.txt`, "fichier non Office — doit être ignoré");

  console.log("Dossier de test créé :");
  const walk = async (dir: string, prefix = "") => {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      console.log(`${prefix}${e.name}${e.isDirectory() ? "/" : ""}`);
      if (e.isDirectory()) await walk(`${dir}/${e.name}`, `${prefix}  `);
    }
  };
  await walk(ROOT);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
