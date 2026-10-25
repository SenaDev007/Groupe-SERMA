/**
 * GÉNÉRATION DES VRAIS FICHIERS MICROSOFT (SERVEUR).
 *
 * Chaque tableur / document du cockpit vit sous forme de FICHIER RÉEL au
 * format Microsoft — exactement le produit Office :
 *   • SHEET → classeur .xlsx (OOXML Excel) mis en forme aux couleurs SERMA ;
 *   • DOC   → document .docx (OOXML Word) avec styles de titres réels.
 *
 * `ensureOfficeFile` matérialise le fichier d'un document qui n'en a
 * pas encore (documents hérités, créés hors-ligne avant synchronisation…)
 * puis met à jour la base : le fichier est ensuite ouvert dans la VRAIE
 * application Microsoft Excel / Word via les schémas d'URI officiels.
 *
 * Module serveur (Prisma + fs) — jamais importé côté client.
 */

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { htmlToDocxBytes, setDocxDomParser } from "@/lib/docx/convert";
import prisma from "@/lib/prisma";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Identité visuelle SERMA (marine profond + orange logo)
const MARINE = "0C193D";
const MARINE_MOYEN = "112046";
const ORANGE = "E07F0A";
const GRIS = "4A4E69";
const BORDURE = "C9CFDC";
const LIGNE_ALT = "F4F6FB";
const TOTAL_BG = "FDF3E3";

function resolveUploadDir(): string {
  const candidates = [
    process.env.BO_UPLOAD_DIR,
    path.join(process.cwd(), "upload", "bo-files"),
    path.join(process.cwd(), "..", "upload", "bo-files"),
    path.join(process.cwd(), "../..", "upload", "bo-files"),
  ].filter((p): p is string => !!p);
  for (const c of candidates) {
    try {
      if (fsSync.existsSync(c)) return c;
    } catch {
      /* continuer */
    }
  }
  return candidates[0] ?? path.join(process.cwd(), "upload", "bo-files");
}
const UPLOAD_DIR = resolveUploadDir();

function colLetter(c: number): string {
  let s = "";
  let n = c + 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Nom de fichier sûr + extension Microsoft imposée. */
function officeFileName(name: string, ext: ".xlsx" | ".docx"): string {
  const base = name
    .replace(/\.(xlsx|docx)$/i, "")
    .replace(/[\/\\\0]/g, "_")
    .trim();
  return `${base || "Document SERMA"}${ext}`;
}

async function loadExcelJS(): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("exceljs");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lib: any = mod?.default ?? mod;
  if (typeof lib?.Workbook !== "function") {
    throw new Error("ExcelJS indisponible");
  }
  return lib;
}

// ─────────────────────────────────────────────────────────────
// SHEET → VRAI CLASSEUR EXCEL (.xlsx) MIS EN FORME
// ─────────────────────────────────────────────────────────────

export async function generateSheetXlsxBytes(
  docName: string,
  content: string | null
): Promise<Uint8Array> {
  // Contenu hérité { cols, rows } (tableur interne) — repli : grille vide
  let cols: string[] = ["Colonne A", "Colonne B", "Colonne C"];
  let rows: (string | number | null)[][] = Array.from({ length: 8 }, () => [
    null,
    null,
    null,
  ]);
  if (content) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.cols) && Array.isArray(parsed?.rows)) {
        cols = parsed.cols.map((c: unknown) => String(c ?? ""));
        rows = parsed.rows.map((r: unknown[]) =>
          Array.isArray(r)
            ? r.map((c) =>
                c === "" || c === undefined ? null : (c as string | number)
              )
            : []
        );
        if (rows.length === 0) rows = Array.from({ length: 8 }, () => cols.map(() => null));
      }
    } catch {
      /* contenu illisible → grille par défaut */
    }
  }

  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cabinet SERMA — Cockpit";
  wb.created = new Date();

  const ws = wb.addWorksheet("Feuil1", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 4 }],
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true },
  });

  const nCols = Math.max(cols.length, 1);
  const nRows = rows.length;

  // ── Bloc de titre SERMA (comme un classeur produit dans Excel) ──
  ws.mergeCells(1, 1, 1, nCols);
  const title = ws.getCell(1, 1);
  title.value = docName.replace(/\.xlsx?$/i, "").toUpperCase();
  title.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  title.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 30;

  ws.mergeCells(2, 1, 2, nCols);
  const subtitle = ws.getCell(2, 1);
  subtitle.value = "Groupe SERMA — Cabinet d'expertise comptable & audit";
  subtitle.font = { name: "Calibri", size: 10, italic: true, color: { argb: "FFFFFFFF" } };
  subtitle.alignment = { horizontal: "center", vertical: "middle" };
  subtitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${MARINE_MOYEN}` } };
  ws.getRow(2).height = 18;

  ws.getRow(3).height = 6;

  // ── Ligne d'en-têtes (orange logo, texte blanc) ──
  const headerRow = ws.getRow(4);
  cols.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = c;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${ORANGE}` } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: `FF${BORDURE}` } },
      left: { style: "thin", color: { argb: `FF${BORDURE}` } },
      bottom: { style: "thin", color: { argb: `FF${BORDURE}` } },
      right: { style: "thin", color: { argb: `FF${BORDURE}` } },
    };
  });
  headerRow.height = 22;

  // ── Données (lignes alternées, bordures complètes) ──
  rows.forEach((row, rIdx) => {
    const rowN = 5 + rIdx;
    const excelRow = ws.getRow(rowN);
    (row.length >= nCols ? row.slice(0, nCols) : [
      ...row,
      ...Array.from({ length: nCols - row.length }, () => null),
    ]).forEach((v, cIdx) => {
      const cell = excelRow.getCell(cIdx + 1);
      cell.value = v === null || v === undefined ? null : v;
      cell.font = { name: "Calibri", size: 11, color: { argb: `FF${GRIS}` } };
      if (rIdx % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${LIGNE_ALT}` } };
      }
      cell.border = {
        top: { style: "hair", color: { argb: `FF${BORDURE}` } },
        left: { style: "thin", color: { argb: `FF${BORDURE}` } },
        bottom: { style: "hair", color: { argb: `FF${BORDURE}` } },
        right: { style: "thin", color: { argb: `FF${BORDURE}` } },
      };
      if (typeof v === "number") cell.numFmt = "#,##0";
    });
  });

  // ── Ligne de TOTAL avec formules SOMME() sur colonnes numériques ──
  const numericCols: number[] = [];
  for (let c = 0; c < nCols; c++) {
    const hasNumbers = rows.some((r) => typeof r?.[c] === "number");
    if (hasNumbers) numericCols.push(c);
  }
  if (numericCols.length > 0) {
    const totalRow = ws.getRow(5 + nRows);
    totalRow.getCell(1).value = "TOTAL";
    cols.forEach((_c, i) => {
      const cell = totalRow.getCell(i + 1);
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: `FF${MARINE}` } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${TOTAL_BG}` } };
      cell.border = {
        top: { style: "medium", color: { argb: `FF${ORANGE}` } },
        left: { style: "thin", color: { argb: `FF${BORDURE}` } },
        bottom: { style: "thin", color: { argb: `FF${BORDURE}` } },
        right: { style: "thin", color: { argb: `FF${BORDURE}` } },
      };
      if (numericCols.includes(i)) {
        const letter = colLetter(i);
        cell.value = { formula: `SUM(${letter}5:${letter}${4 + nRows})` };
        cell.numFmt = "#,##0";
        cell.alignment = { horizontal: "right" };
      }
    });
    totalRow.getCell(1).alignment = { horizontal: "left" };
    totalRow.height = 20;
  }

  // ── Largeurs de colonnes calées sur le contenu ──
  for (let c = 0; c < nCols; c++) {
    let maxW = Math.max(String(cols[c] ?? "").length, 10);
    for (const r of rows) {
      const v = r?.[c];
      if (v !== null && v !== undefined) {
        maxW = Math.max(maxW, String(v).length + 2);
      }
    }
    ws.getColumn(c + 1).width = Math.min(maxW + 4, 42);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Uint8Array(buffer as ArrayBuffer);
}

// ─────────────────────────────────────────────────────────────
// DOC → VRAI DOCUMENT WORD (.docx)
// ─────────────────────────────────────────────────────────────

let domParserInjected = false;

async function ensureDomParser(): Promise<void> {
  if (domParserInjected) return;
  // convert.ts s'appuie sur DOMParser (navigateur) : injection de la
  // même API côté Node via @xmldom/xmldom (motif éprouvé du script de
  // génération des classeurs mis en forme).
  const { DOMParser } = await import("@xmldom/xmldom");
  setDocxDomParser(() => new DOMParser() as unknown as DOMParser);
  domParserInjected = true;
}

export async function generateDocxBytes(
  docName: string,
  htmlContent: string | null
): Promise<Uint8Array> {
  await ensureDomParser();
  const html =
    htmlContent && htmlContent.trim() !== ""
      ? htmlContent
      : `<h1>${escapeHtml(docName.replace(/\.docx$/i, ""))}</h1><p>Commencez à rédiger ce document dans Microsoft Word.</p>`;
  return htmlToDocxBytes(html, docName.replace(/\.docx$/i, ""));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─────────────────────────────────────────────────────────────
// MATERIALIZATION : document → fichier réel sur le disque
// ─────────────────────────────────────────────────────────────

export interface MaterializedDocument {
  id: string;
  name: string;
  kind: string;
  mimeType: string;
  size: number;
  filePath: string;
}

/**
 * Garantit qu'un document SHEET/DOC possède son VRAI fichier Microsoft sur
 * le serveur — le génère (et l'enregistre) si nécessaire. Idempotent.
 * `preloaded` : document déjà chargé par la page (évite une requête).
 */
export async function ensureOfficeFile(
  docId: string,
  preloaded?: {
    id: string;
    name: string;
    kind: string;
    content: string | null;
    filePath: string | null;
    mimeType: string | null;
    size: number | null;
  }
): Promise<MaterializedDocument | null> {
  const doc =
    preloaded && preloaded.id === docId
      ? preloaded
      : await prisma.document.findUnique({ where: { id: docId } });
  if (!doc) return null;
  if (doc.filePath) {
    return {
      id: doc.id,
      name: doc.name,
      kind: doc.kind,
      mimeType: doc.mimeType ?? guessMime(doc.kind),
      size: doc.size ?? 0,
      filePath: doc.filePath,
    };
  }
  if (doc.kind !== "SHEET" && doc.kind !== "DOC") return null;

  const isSheet = doc.kind === "SHEET";
  const bytes = isSheet
    ? await generateSheetXlsxBytes(doc.name, doc.content)
    : await generateDocxBytes(doc.name, doc.content);
  const displayName = officeFileName(doc.name, isSheet ? ".xlsx" : ".docx");
  const storedName = `${randomUUID()}-${displayName}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, storedName), bytes);

  const mimeType = isSheet ? XLSX_MIME : DOCX_MIME;
  await prisma.document.update({
    where: { id: doc.id },
    data: {
      name: displayName,
      filePath: storedName,
      size: bytes.byteLength,
      mimeType,
    },
  });

  return {
    id: doc.id,
    name: displayName,
    kind: doc.kind,
    mimeType,
    size: bytes.byteLength,
    filePath: storedName,
  };
}

function guessMime(kind: string): string {
  return kind === "SHEET" ? XLSX_MIME : DOCX_MIME;
}
