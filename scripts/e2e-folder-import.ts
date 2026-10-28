/**
 * E2E — import d'un DOSSIER COMPLET (hiérarchie + fichiers Word/Excel).
 *
 * Reproduit exactement la séquence de mutations produite par
 * ImportFolderDialog (webkitdirectory) et envoyée par le moteur de
 * synchronisation :
 *   client.upsert → folder.create (racine importée) → folder.create × N
 *   (sous-dossiers, parents d'abord) → document.import × M (fichiers).
 *
 * Vérifie ensuite DANS LA BASE : hiérarchie des dossiers, placement des
 * documents, fichiers physiquement présents (disque ou base), parsing du
 * contenu xlsx, et le repli « dossier disparu → import non rangé ».
 *
 * Usage : bun scripts/e2e-folder-import.ts
 */
import { SignJWT } from "jose";
import * as XLSX from "xlsx";
import prisma from "@/lib/prisma";
import { boFileExists, removeBoFile } from "@/lib/office/storage";

const BASE = "http://localhost:3000";

let failures = 0;
function check(label: string, ok: boolean, detail = ""): void {
  const mark = ok ? "✔" : "✘ ÉCHEC";
  console.log(`  ${mark} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

function secretString(): string {
  return (
    process.env.BO_SESSION_SECRET ||
    process.env.DATABASE_URL + "|groupe-serma-bo|dev-secret"
  );
}

async function mintSessionCookie(): Promise<string> {
  const jwt = await new SignJWT({
    userId: "e2e-verification",
    email: "e2e@serma.dev",
    name: "Vérification E2E",
    role: "ADMIN",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secretString()));
  return `serma_bo_session=${jwt}`;
}

async function main(): Promise<void> {
  // ════════════ 1. BASE VIDE ════════════
  console.log("\n── 1. Base vide (aucune donnée seed) ──");
  const counts = {
    clients: await prisma.client.count(),
    folders: await prisma.folder.count(),
    documents: await prisma.document.count(),
    workItems: await prisma.workItem.count(),
    submissions: await prisma.submission.count(),
    formations: await prisma.formation.count(),
    articles: await prisma.article.count(),
    testimonials: await prisma.testimonial.count(),
  };
  check(
    "Aucune donnée métier en base",
    Object.values(counts).every((c) => c === 0),
    Object.entries(counts)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ")
  );

  // ════════════ 2. SÉQUENCE D'IMPORT DE DOSSIER ════════════
  console.log("\n── 2. Import d'un dossier complet (mutations réelles) ──");
  const ts = Date.now().toString(36);
  const clientId = `client_e2e_${ts}`;
  const importRootId = `folder_e2e_${ts}_root`;
  const balanceId = `folder_e2e_${ts}_bal`;
  const cadrageId = `folder_e2e_${ts}_cad`;
  const docBalance = `doc_e2e_${ts}_bal`;
  const docCadrage = `doc_e2e_${ts}_cad`;
  const docOrphelin = `doc_e2e_${ts}_orp`;

  // Vrai classeur .xlsx (SheetJS) — le serveur doit aussi le parser
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
  const xlsxBytes = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  const docxBytes = Buffer.from("PK\x03\x04 — octets docx E2E (dossier complet)");

  const mut = (i: number) => `mut_e2e_${ts}_${i}`;
  const createdAt = (i: number) =>
    new Date(Date.now() + i).toISOString(); // ordre croissant garanti

  const cookie = await mintSessionCookie();
  const res = await fetch(`${BASE}/api/back-office/mutations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      mutations: [
        {
          id: mut(1),
          type: "client.upsert",
          createdAt: createdAt(1),
          payload: { id: clientId, name: "ONG E2E Dossier Complet", type: "ONG" },
        },
        {
          id: mut(2),
          type: "folder.create",
          createdAt: createdAt(2),
          payload: {
            id: importRootId,
            clientId,
            parentId: `root_${clientId}`,
            name: "Dossier comptable 2025",
          },
        },
        {
          id: mut(3),
          type: "folder.create",
          createdAt: createdAt(3),
          payload: { id: balanceId, clientId, parentId: importRootId, name: "Balances" },
        },
        {
          id: mut(4),
          type: "folder.create",
          createdAt: createdAt(4),
          payload: { id: cadrageId, clientId, parentId: importRootId, name: "Cadrages" },
        },
        {
          id: mut(5),
          type: "document.import",
          createdAt: createdAt(5),
          payload: {
            id: docBalance,
            name: "balance-generale.xlsx",
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            size: xlsxBytes.length,
            folderId: balanceId,
          },
          fileBase64: xlsxBytes.toString("base64"),
        },
        {
          id: mut(6),
          type: "document.import",
          createdAt: createdAt(6),
          payload: {
            id: docCadrage,
            name: "note-de-cadrage.docx",
            mimeType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            size: docxBytes.length,
            folderId: cadrageId,
          },
          fileBase64: docxBytes.toString("base64"),
        },
        {
          id: mut(7),
          type: "document.import",
          createdAt: createdAt(7),
          payload: {
            id: docOrphelin,
            name: "rapport-perdu.xlsx",
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            size: xlsxBytes.length,
            folderId: "folder_inconnu_${ts}", // dossier disparu → repli
          },
          fileBase64: xlsxBytes.toString("base64"),
        },
      ],
    }),
  });
  const data = await res.json();
  const oks = (data.results ?? []) as { ok: boolean; error?: string }[];
  check(
    "Lot complet appliqué (7/7 ok)",
    res.status === 200 && oks.length === 7 && oks.every((r) => r.ok),
    oks.find((r) => !r.ok)?.error ?? `HTTP ${res.status}`
  );

  // ════════════ 3. VÉRIFICATION DE LA HIÉRARCHIE ════════════
  console.log("\n── 3. Hiérarchie recréée dans la base ──");
  const rootFolder = await prisma.folder.findUnique({
    where: { id: `root_${clientId}` },
  });
  check("Dossier racine client créé", !!rootFolder);

  const importRoot = await prisma.folder.findUnique({
    where: { id: importRootId },
  });
  check(
    "Dossier importé à la racine du client",
    !!importRoot &&
      importRoot.name === "Dossier comptable 2025" &&
      importRoot.parentId === `root_${clientId}`
  );

  const bal = await prisma.folder.findUnique({ where: { id: balanceId } });
  const cad = await prisma.folder.findUnique({ where: { id: cadrageId } });
  check(
    "Sous-dossiers imbriqués sous le dossier importé",
    !!bal && bal.name === "Balances" && bal.parentId === importRootId &&
      !!cad && cad.name === "Cadrages" && cad.parentId === importRootId
  );

  const dBal = await prisma.document.findUnique({ where: { id: docBalance } });
  const dCad = await prisma.document.findUnique({ where: { id: docCadrage } });
  check(
    "Fichiers rangés dans les bons sous-dossiers",
    dBal?.folderId === balanceId && dCad?.folderId === cadrageId,
    `balance → ${dBal?.folderId === balanceId ? "Balances ✔" : dBal?.folderId ?? "?"}, cadrage → ${
      dCad?.folderId === cadrageId ? "Cadrages ✔" : dCad?.folderId ?? "?"
    }`
  );
  check(
    "Fichiers physiquement présents (disque ou base)",
    (await boFileExists(docBalance, dBal?.filePath ?? null)) &&
      (await boFileExists(docCadrage, dCad?.filePath ?? null))
  );
  check(
    "Contenu du .xlsx parsé (grille cols/rows)",
    !!dBal?.content && dBal.content.includes("Compte")
  );

  const dOrp = await prisma.document.findUnique({ where: { id: docOrphelin } });
  check(
    "Repli dossier disparu : fichier importé NON RANGÉ (ok, sans échec)",
    !!dOrp && dOrp.folderId === null && (await boFileExists(docOrphelin, dOrp.filePath ?? null))
  );

  // ════════════ 4. NETTOYAGE + BASE REVIDÉE ════════════
  console.log("\n── 4. Nettoyage (retour à une base vide) ──");
  await removeBoFile(docOrphelin, dOrp?.filePath ?? null);
  await prisma.document.delete({ where: { id: docOrphelin } });
  await prisma.client.delete({ where: { id: clientId } }); // cascade dossiers + docs + bofiles
  const after = {
    clients: await prisma.client.count(),
    folders: await prisma.folder.count(),
    documents: await prisma.document.count(),
    boFiles: await prisma.boFile.count(),
  };
  check(
    "Base à nouveau vide après nettoyage",
    Object.values(after).every((c) => c === 0),
    Object.entries(after)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ")
  );

  console.log(
    `\n${failures === 0 ? "✔ TOUS LES TESTS PASSENT" : `✘ ${failures} ÉCHEC(S)`}`
  );
}

main()
  .catch((e) => {
    console.error("Erreur E2E :", e);
    failures++;
    console.log(`\n✘ ${failures} ÉCHEC(S) (erreur d'exécution)`);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exitCode = failures === 0 ? 0 : 1;
  });
