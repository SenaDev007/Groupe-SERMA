/**
 * VÉRIFICATION E2E — corrections « Office ne reconnaît pas la commande »
 * et « Échec de l'application (document.import) ».
 *
 * Partie A — Jeton Office compact :
 *   • longueur de l'URL complète (doit rester ≤ 216 car., limite Excel) ;
 *   • signature/vérification, jeton falsifié, périmé, mauvais document ;
 *   • compatibilité avec l'ancien format JWT (transition).
 * Partie B — Routes HTTP (serveur dev local) :
 *   • GET /files/<id>/office?token=<compact> → 200 + vrai .xlsx ;
 *   • GET avec jeton invalide → 401.
 * Partie C — Mutation document.import de bout en bout (vraie route POST) :
 *   • import → ok:true, fichier présent, rejeu idempotent → ok:true.
 *
 * La simulation Vercel (FS lecture seule) est dans un processus séparé :
 *   scripts/e2e-vercel-readonly.ts (l'environnement doit être posé par le
 *   shell avant le chargement des modules).
 *
 * Usage : bun scripts/e2e-office-fix.ts
 */
import { SignJWT } from "jose";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";
import { signOfficeFileToken, verifyOfficeFileToken, officeFilePath } from "@/lib/office/token";
import { readBoFile, boFileExists, removeBoFile } from "@/lib/office/storage";

const BASE = "http://localhost:3000";
const DOC_ID = "cmvkx0q5y000ivd8f04ugf05u"; // Balance générale — ONG Santé Aloma
const PROD_ORIGIN = "https://groupe-serma.vercel.app";

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
  // ══════════════════ PARTIE A — JETON COMPACT ══════════════════
  console.log("\n── A. Jeton Office compact (limite Excel 216 car.) ──");
  const token = await signOfficeFileToken(DOC_ID);
  const url = `${PROD_ORIGIN}${officeFilePath(DOC_ID, token)}`;
  check(
    "URL complète ≤ 216 caractères (limite Excel [MS-OFFURI] §1.7)",
    url.length <= 216,
    `${url.length} car. (ancien JWT : ~251 car.)`
  );
  check("Vérification du jeton signé", await verifyOfficeFileToken(token, DOC_ID));
  check(
    "Jeton falsifié refusé",
    !(await verifyOfficeFileToken(token.slice(0, -2) + "x9", DOC_ID))
  );
  check("Mauvais document refusé", !(await verifyOfficeFileToken(token, "autre-doc")));
  const past = Math.floor(Date.now() / 1000) - 3600;
  const past36 = past.toString(36);
  const expired = `${past36}.${createHmac("sha256", secretString())
    .update(`${DOC_ID}.${past36}`)
    .digest()
    .subarray(0, 16)
    .toString("base64url")}`;
  check("Jeton périmé refusé", !(await verifyOfficeFileToken(expired, DOC_ID)));

  const legacyJwt = await new SignJWT({ docId: DOC_ID })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("6h")
    .sign(new TextEncoder().encode(secretString()));
  check(
    "Ancien jeton JWT toujours accepté (transition)",
    await verifyOfficeFileToken(legacyJwt, DOC_ID)
  );

  // ══════════════════ PARTIE B — ROUTES HTTP ══════════════════
  console.log("\n── B. Route du fichier Office (serveur local) ──");
  const okRes = await fetch(`${BASE}/api/back-office/files/${DOC_ID}/office?token=${token}`);
  const body = new Uint8Array(await okRes.arrayBuffer());
  check(
    "GET fichier avec jeton compact → 200",
    okRes.status === 200,
    `HTTP ${okRes.status}, ${body.length} octets`
  );
  check(
    "Content-Type OOXML Excel",
    !!okRes.headers.get("content-type")?.includes("spreadsheetml.sheet")
  );
  const badRes = await fetch(`${BASE}/api/back-office/files/${DOC_ID}/office?token=eyJfaux`);
  check("GET avec jeton invalide → 401", badRes.status === 401, `HTTP ${badRes.status}`);

  // ══════════════════ PARTIE C — MUTATION document.import ══════════════════
  console.log("\n── C. Mutation document.import (vraie route POST) ──");
  const cookie = await mintSessionCookie();
  const doc = await prisma.document.findUnique({ where: { id: DOC_ID } });
  const fileBytes = doc ? await readBoFile(DOC_ID, doc.filePath) : null;
  check(
    "Fichier du document lisible (disque/base)",
    !!fileBytes,
    `${fileBytes?.length ?? 0} octets`
  );

  if (fileBytes) {
    const ts = Date.now().toString(36);
    const mutId = `mut_e2e_${ts}`;
    const docId = `doc_e2e_${ts}`;
    const payload = {
      mutations: [
        {
          id: mutId,
          type: "document.import",
          createdAt: new Date().toISOString(),
          payload: {
            id: docId,
            name: "Test E2E import.xlsx",
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            size: fileBytes.length,
            blobKey: `blob_e2e_${ts}`,
          },
          fileBase64: Buffer.from(fileBytes).toString("base64"),
        },
      ],
    };

    const res1 = await fetch(`${BASE}/api/back-office/mutations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(payload),
    });
    const data1 = await res1.json();
    check(
      "POST document.import → ok:true",
      res1.status === 200 && data1.results?.[0]?.ok === true,
      data1.results?.[0]?.error ?? `HTTP ${res1.status}`
    );
    const created = await prisma.document.findUnique({ where: { id: docId } });
    check(
      "Document créé avec son fichier",
      !!created?.filePath && (await boFileExists(docId, created.filePath))
    );

    // Rejeu du même lot (coupure réseau simulée côté client) → idempotent
    const res2 = await fetch(`${BASE}/api/back-office/mutations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(payload),
    });
    const data2 = await res2.json();
    check(
      "Rejeu idempotent → ok:true (sans erreur, sans doublon)",
      res2.status === 200 && data2.results?.[0]?.ok === true,
      data2.results?.[0]?.error ?? ""
    );

    // Nettoyage des données de test
    if (created) {
      await removeBoFile(docId, created.filePath);
      await prisma.document.delete({ where: { id: docId } });
      check(
        "Nettoyage du document de test",
        !(await prisma.document.findUnique({ where: { id: docId } }))
      );
    }
  }

  // ══════════════════ BILAN ══════════════════
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
