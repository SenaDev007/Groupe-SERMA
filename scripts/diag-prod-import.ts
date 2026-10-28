// Test : mutation document.import en production (reproduction exacte du flux utilisateur)
import { readFileSync } from "fs";

// Génère un vrai fichier xlsx minimal via la lib xlsx du projet
import * as XLSX from "xlsx";

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([
  ["Colonne A", "Colonne B"],
  ["1", "2"],
  ["3", "4"],
]);
XLSX.utils.book_append_sheet(wb, ws, "Feuil1");
const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
const b64 = buf.toString("base64");

const PROD = "https://groupe-serma.vercel.app";

async function main() {
  // 1) Login (server action = compliqué ; on passe par le formulaire POST de la page ?)
  // Non — la page login utilise une server action Next.js. On utilise le cookie
  // déjà obtenu via agent-browser : le script est appelé avec --cookie.
  const cookie = process.env.BO_COOKIE;
  if (!cookie) throw new Error("BO_COOKIE manquant");

  const mutation = {
    id: `mut_diag_${Date.now()}`,
    type: "document.import",
    createdAt: new Date().toISOString(),
    payload: {
      id: `doc_diag_${Date.now()}`,
      name: "diag-import-test.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: buf.length,
      folderId: "folder_inexistant_diag",
      blobKey: `blob_diag_${Date.now()}`,
    },
    fileBase64: b64,
  };

  console.log("Taille base64:", b64.length, "caractères");

  const res = await fetch(`${PROD}/api/back-office/mutations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ mutations: [mutation] }),
  });
  const text = await res.text();
  console.log("HTTP", res.status);
  try {
    const data = JSON.parse(text);
    console.log("Résultats:", JSON.stringify(data.results, null, 2));
    const doc = (data.snapshot?.documents || []).find(
      (d: { id: string }) => d.id === mutation.payload.id
    );
    console.log(
      "Document créé côté serveur:",
      doc ? JSON.stringify(doc, null, 2) : "NON TROUVÉ"
    );
  } catch {
    console.log("Réponse brute:", text.slice(0, 2000));
  }
}

void main();
