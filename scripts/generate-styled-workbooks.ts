/**
 * Génération des VRAIS fichiers Microsoft avec mise en forme complète.
 *
 *  • SHEET (.xlsx) : classeurs Excel mis en forme comme dans Microsoft
 *    Excel — bloc de titre aux couleurs SERMA, en-têtes de colonnes,
 *    bordures complètes, formats de nombres (#,##0), lignes alternées,
 *    ligne de TOTAL avec formules SOMME(), volets figés, colonnes calées,
 *    mise en page A4 paysage prête à imprimer.
 *  • DOC : documents Word réels (.docx OOXML) générés depuis le contenu
 *    enrichi (titres, gras/italique/souligné, listes, citations, tableaux).
 *
 * La mise en forme est appliquée au CONTENU EXISTANT du fichier (aucune
 * donnée modifiée) : seules la présentation et les lignes de totaux sont
 * ajoutées, exactement comme un comptable les met dans Excel.
 *
 * Idempotent — ré-exécutable. Usage :
 *   bun scripts/generate-styled-workbooks.ts
 *   SERMAHUB_DATABASE_URL=… bun scripts/generate-styled-workbooks.ts  (Neon)
 */
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Client selon la base active : Neon (postgres) ou miroir local (SQLite)
/* eslint-disable @typescript-eslint/no-explicit-any */
async function getPrisma(): Promise<any> {
  const url = process.env.SERMAHUB_DATABASE_URL;
  if (url && !url.startsWith("file:")) {
    const mod = await import("@prisma/client");
    return new mod.PrismaClient();
  }
  const mod = await import("../src/generated/prisma-sqlite");
  return new mod.PrismaClient();
}

const UPLOAD_DIR =
  process.env.BO_UPLOAD_DIR ?? path.join(process.cwd(), "upload", "bo-files");

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Couleurs du cabinet (identité SERMA)
const MARINE = "0C193D";
const ORANGE = "E07F0A";
const GRIS = "4A4E69";
const BORDURE = "C9CFDC";
const LIGNE_ALT = "F4F6FB";
const TOTAL_BG = "FDF3E3";

// ─────────────────────────────────────────────────────────────
// Lecture du contenu actuel (SheetJS — valeurs + formules)
// ─────────────────────────────────────────────────────────────

import * as XLSX from "xlsx";

interface GridData {
  header: string[];
  rows: (string | number | boolean | null)[][];
  formulas: { r: number; c: number; f: string }[];
}

function readGrid(bytes: Buffer, docName: string): GridData | null {
  try {
    const wb = XLSX.read(bytes, { type: "buffer", cellFormula: true, raw: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) return null;
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
    if (aoa.length === 0) return null;

    // Détection d'un fichier DÉJÀ mis en forme (bloc de titre SERMA en
    // tête) : la ligne 1 porte le nom du document en majuscules et la
    // ligne 2 la mention du cabinet. On extrait alors en-têtes et données
    // sous ce bloc, sans les lignes de totaux régénérées.
    const first = String(aoa[0]?.[0] ?? "").trim().toUpperCase();
    const docUpper = docName.replace(/\.xlsx?$/i, "").trim().toUpperCase();
    const alreadyStyled =
      first !== "" && docUpper !== "" && first.startsWith(docUpper.slice(0, 20));
    const headerIdx = alreadyStyled ? 3 : 0;

    const header = (aoa[headerIdx] ?? []).map((c) => String(c ?? ""));
    const rows: (string | number | boolean | null)[][] = [];
    for (let i = headerIdx + 1; i < aoa.length; i++) {
      const row = aoa[i];
      if (!Array.isArray(row)) continue;
      const firstCell = String(row[0] ?? "").trim().toUpperCase();
      if (firstCell === "TOTAL" || firstCell.startsWith("SOLDE")) continue; // régénérés
      rows.push(row.map((c) => (c === "" ? null : (c as string | number | boolean | null))));
    }

    const formulas: { r: number; c: number; f: string }[] = [];
    if (!alreadyStyled) {
      // seuls les fichiers bruts portent des formules à conserver :
      // les lignes de totaux du modèle stylé sont recalculées
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let r = range.s.r; r <= range.e.r; r++) {
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cell = ws[XLSX.utils.encode_cell({ r, c })] as XLSX.CellObject | undefined;
          if (cell?.f) formulas.push({ r: r - (headerIdx + 1), c, f: String(cell.f) });
        }
      }
    }
    return { header, rows, formulas };
  } catch {
    return null;
  }
}

/** Décale les références A1 d'une formule de delta lignes. */
function shiftFormulaRefs(f: string, delta: number): string {
  return String(f).replace(/([A-Z]{1,3})(\d{1,5})(?![\d(])/gi, (_m, col, row) => {
    return `${col}${Math.max(1, parseInt(row, 10) + delta)}`;
  });
}

function colLetter(c: number): string {
  let s = "";
  let n = c + 1;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// ─────────────────────────────────────────────────────────────
// Génération du classeur stylé (ExcelJS — fidélité Excel totale)
// ─────────────────────────────────────────────────────────────

import ExcelJS from "exceljs";

const TITLE_ROW = 1;
const SUBTITLE_ROW = 2;
const SPACER_ROW = 3;
const HEADER_ROW = 4;
const DATA_OFFSET = 4; // première ligne de données = ligne 5

async function buildStyledWorkbook(
  docName: string,
  grid: GridData
): Promise<{ buffer: Buffer; sheetName: string }> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cabinet SERMA — Back-office";
  wb.created = new Date();

  const sheetName = sanitizeSheetName(docName.replace(/\.xlsx?$/i, "")) || "Feuille 1";
  const ws = wb.addWorksheet(sheetName, {
    properties: { tabColor: { argb: `FF${MARINE}` } },
  });

  const colCount = Math.max(grid.header.length, 1);

  // ── Bloc de titre (fusionné, marine, blanc) ──
  ws.mergeCells(TITLE_ROW, 1, TITLE_ROW, colCount);
  const title = ws.getCell(TITLE_ROW, 1);
  title.value = docName.replace(/\.xlsx?$/i, "").toUpperCase();
  title.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  title.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${MARINE}` },
  };
  title.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(TITLE_ROW).height = 30;

  // ── Sous-titre (cabinet, confidentiel) ──
  ws.mergeCells(SUBTITLE_ROW, 1, SUBTITLE_ROW, colCount);
  const subtitle = ws.getCell(SUBTITLE_ROW, 1);
  subtitle.value =
    "Cabinet SERMA SARL · Parakou — Document de travail confidentiel";
  subtitle.font = { name: "Calibri", size: 9, italic: true, color: { argb: `FF${GRIS}` } };
  subtitle.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(SUBTITLE_ROW).height = 16;
  ws.getRow(SPACER_ROW).height = 6;

  // ── En-têtes de colonnes (orange SERMA, blanc, bordures) ──
  const headerRow = ws.getRow(HEADER_ROW);
  headerRow.height = 24;
  for (let c = 0; c < colCount; c++) {
    const cell = headerRow.getCell(c + 1);
    cell.value = grid.header[c] ?? "";
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${ORANGE}` },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = allBorders("thin", "FFFFFF");
  }

  // ── Détection des colonnes numériques / dates ──
  const isNumeric = new Array(colCount).fill(false);
  const isDate = new Array(colCount).fill(false);
  const headerTexts = grid.header.map((h) => h.toUpperCase());
  for (let c = 0; c < colCount; c++) {
    if (/DATE|JOURN/.test(headerTexts[c] ?? "")) isDate[c] = true;
    let nums = 0;
    let vals = 0;
    for (const row of grid.rows) {
      const v = row[c];
      if (v === null || v === undefined || v === "") continue;
      vals++;
      if (typeof v === "number") nums++;
    }
    if (vals > 0 && nums / vals >= 0.7) isNumeric[c] = true;
  }

  // ── Lignes de données ──
  const thin = allBorders("thin", BORDURE);
  grid.rows.forEach((row, i) => {
    const excelRow = ws.getRow(DATA_OFFSET + 1 + i);
    excelRow.height = 18;
    const alt = i % 2 === 1;
    for (let c = 0; c < colCount; c++) {
      const cell = excelRow.getCell(c + 1);
      const v = row[c];
      cell.value = v === null || v === undefined ? "" : v;
      cell.border = thin;
      if (alt) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${LIGNE_ALT}` },
        };
      }
      if (isNumeric[c]) {
        cell.numFmt = "#,##0";
        cell.alignment = { horizontal: "right", vertical: "middle" };
      } else if (isDate[c]) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    }
  });

  // ── Formules existantes (références décalées sous le bloc de titre) ──
  for (const { r, c, f } of grid.formulas) {
    const target = ws.getCell(DATA_OFFSET + 1 + r, c + 1); // +1 : ligne 0 = en-têtes
    const shifted = shiftFormulaRefs(f.replace(/^\=/, ""), DATA_OFFSET + 1);
    if (typeof target.value === "number" || typeof target.value === "string") {
      target.value = { formula: shifted, result: target.value };
    } else {
      target.value = { formula: shifted };
    }
  }

  // ── Ligne de TOTAL (formules SOMME) ──
  const dataFirst = DATA_OFFSET + 1;
  const dataLast = DATA_OFFSET + grid.rows.length;
  if (grid.rows.length >= 2) {
    const totalRow = ws.getRow(dataLast + 1);
    totalRow.height = 22;
    for (let c = 0; c < colCount; c++) {
      const cell = totalRow.getCell(c + 1);
      cell.border = {
        top: { style: "double", color: { argb: `FF${MARINE}` } },
        left: { style: "thin", color: { argb: `FF${BORDURE}` } },
        bottom: { style: "thin", color: { argb: `FF${BORDURE}` } },
        right: { style: "thin", color: { argb: `FF${BORDURE}` } },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${TOTAL_BG}` },
      };
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: `FF${MARINE}` } };
      if (c === 0) {
        cell.value = "TOTAL";
        cell.alignment = { horizontal: "left", vertical: "middle" };
      } else if (isNumeric[c]) {
        const L = colLetter(c);
        // Résultat en cache calculé (affichage immédiat dans Excel,
        // recalcul automatique à l'ouverture sinon)
        let sum = 0;
        for (const row of grid.rows) {
          const v = row[c];
          if (typeof v === "number") sum += v;
        }
        cell.value = { formula: `SUM(${L}${dataFirst}:${L}${dataLast})`, result: sum };
        cell.numFmt = "#,##0";
        cell.alignment = { horizontal: "right", vertical: "middle" };
      }
    }

    // Journal de caisse : solde entrées − sorties
    const ent = headerTexts.findIndex((h) => /ENTR[ÉE]E/.test(h ?? ""));
    const sor = headerTexts.findIndex((h) => /SORTIE/.test(h ?? ""));
    if (ent >= 0 && sor >= 0 && ent !== sor) {
      const soldeRow = ws.getRow(dataLast + 2);
      soldeRow.height = 22;
      for (let c = 0; c < colCount; c++) {
        const cell = soldeRow.getCell(c + 1);
        cell.border = {
          bottom: { style: "double", color: { argb: `FF${MARINE}` } },
          left: { style: "thin", color: { argb: `FF${BORDURE}` } },
          top: { style: "thin", color: { argb: `FF${BORDURE}` } },
          right: { style: "thin", color: { argb: `FF${BORDURE}` } },
        };
        cell.font = { name: "Calibri", size: 11, bold: true, italic: true, color: { argb: `FF${ORANGE}` } };
        if (c === 0) {
          cell.value = "SOLDE EN CAISSE";
          cell.alignment = { horizontal: "left", vertical: "middle" };
        } else if (c === Math.max(ent, sor)) {
          const E = colLetter(ent);
          const S = colLetter(sor);
          let sumE = 0;
          let sumS = 0;
          for (const row of grid.rows) {
            if (typeof row[ent] === "number") sumE += row[ent] as number;
            if (typeof row[sor] === "number") sumS += row[sor] as number;
          }
          cell.value = {
            formula: `SUM(${E}${dataFirst}:${E}${dataLast})-SUM(${S}${dataFirst}:${S}${dataLast})`,
            result: sumE - sumS,
          };
          cell.numFmt = "#,##0";
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: `FF${TOTAL_BG}` },
          };
        }
      }
    }
  }

  // ── Largeurs de colonnes calées sur le contenu ──
  for (let c = 0; c < colCount; c++) {
    let maxLen = String(grid.header[c] ?? "").length;
    for (const row of grid.rows) {
      const v = row[c];
      if (v === null || v === undefined) continue;
      maxLen = Math.max(maxLen, String(v).length);
    }
    const width = Math.min(38, Math.max(11, maxLen + 4));
    ws.getColumn(c + 1).width = width;
  }

  // ── Volets figés : titres + en-têtes toujours visibles ──
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: HEADER_ROW }];

  // ── Mise en page A4 paysage prête à imprimer ──
  ws.pageSetup = {
    paperSize: 9, // A4
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.6,
      bottom: 0.6,
      header: 0.25,
      footer: 0.25,
    },
  };
  ws.headerFooter = {
    oddFooter: `&L&Cabinet SERMA SARL — Parakou&C&P. &P / &N`,
  };
  // Ligne d'en-têtes répétée sur chaque page imprimée
  ws.pageSetup.printTitlesRow = `${HEADER_ROW}:${HEADER_ROW}`;

  const out = await wb.xlsx.writeBuffer();
  return { buffer: Buffer.from(out as unknown as Buffer), sheetName };
}

function allBorders(style: string, color: string): ExcelJS.Borders {
  const b = { style, color: { argb: `FF${color}` } };
  return { top: b, left: b, bottom: b, right: b } as ExcelJS.Borders;
}

function sanitizeSheetName(name: string): string {
  let n = (name || "").replace(/[\[\]:*?/\\]/g, " ").trim();
  return n.slice(0, 31);
}

// ─────────────────────────────────────────────────────────────
// Documents Word : contenu HTML → vrai .docx
// ─────────────────────────────────────────────────────────────

async function generateDocxFile(html: string, docName: string): Promise<Buffer> {
  const { DOMParser } = await import("@xmldom/xmldom");
  const convert = await import("../src/lib/docx/convert");
  convert.setDocxDomParser(() => new DOMParser() as unknown as DOMParser);
  const bytes = await convert.htmlToDocxBytes(html || "<p></p>", docName);
  return Buffer.from(bytes);
}

// ─────────────────────────────────────────────────────────────
// Programme principal
// ─────────────────────────────────────────────────────────────

/** Grille JSON héritée {cols, rows} → GridData. */
function legacyToGrid(content: string | null): GridData | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed?.cols) || !Array.isArray(parsed?.rows)) return null;
    const header = parsed.cols.map((c: unknown) => String(c ?? ""));
    const rows: (string | number | boolean | null)[][] = parsed.rows.map(
      (row: unknown[]) =>
        Array.isArray(row)
          ? row.map((c) => {
              const v = String(c ?? "");
              if (v === "") return null;
              const num = Number(v.replace(/\s/g, "").replace(",", "."));
              if (Number.isFinite(num) && /^[\d\s.,-]+$/.test(v)) return num;
              return v;
            })
          : []
    );
    return { header, rows, formulas: [] };
  } catch {
    return null;
  }
}

async function main() {
  const prisma = await getPrisma();
  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });

  // ── 1) Classeurs Excel : mise en forme complète ──
  //    (fichier existant relu et remis en forme, ou création depuis la
  //     grille héritée quand le document n'a pas encore de fichier)
  const sheets = await prisma.document.findMany({ where: { kind: "SHEET" } });
  console.log(`Classeurs Excel à mettre en forme : ${sheets.length}`);

  let styled = 0;
  let skipped = 0;
  for (const doc of sheets) {
    let grid: GridData | null = null;
    let storedName: string | null = doc.filePath ? path.basename(doc.filePath) : null;

    if (storedName) {
      // fichier existant → on relit les valeurs réelles (aucune perte)
      try {
        const bytes = await fs.promises.readFile(path.join(UPLOAD_DIR, storedName));
        grid = readGrid(bytes, doc.name);
      } catch {
        grid = null;
      }
      if (!grid) {
        // fichier illisible → repli sur la grille héritée si possible
        grid = legacyToGrid(doc.content);
      }
    } else {
      grid = legacyToGrid(doc.content);
    }

    if (!grid || (grid.header.every((h) => !h) && grid.rows.length === 0)) {
      console.warn(`  ✖ aucune donnée pour « ${doc.name} »`);
      skipped++;
      continue;
    }

    if (!storedName) {
      const safeName = `${(doc.name || "Classeur").replace(/\.xlsx?$/i, "").replace(/[\/\\\0]/g, "_")}.xlsx`;
      storedName = `${randomUUID()}-${safeName}`;
    }

    const { buffer } = await buildStyledWorkbook(doc.name, grid);
    await fs.promises.writeFile(path.join(UPLOAD_DIR, storedName), buffer);
    await prisma.document.update({
      where: { id: doc.id },
      data: {
        filePath: storedName,
        size: buffer.length,
        mimeType: XLSX_MIME,
      },
    });
    styled++;
    console.log(
      `  ✔ « ${doc.name} » — ${grid.rows.length} lignes + TOTAL (${(buffer.length / 1024).toFixed(1)} Ko)`
    );
  }

  // ── 2) Documents Word : génération de vrais .docx ──
  const docs = await prisma.document.findMany({ where: { kind: "DOC" } });
  console.log(`\nDocuments Word à générer : ${docs.length}`);

  let generated = 0;
  for (const doc of docs) {
    const safeName = `${(doc.name || "Document").replace(/\.docx?$/i, "").replace(/[\/\\\0]/g, "_")}.docx`;
    const storedName = `${randomUUID()}-${safeName}`;
    try {
      const buffer = await generateDocxFile(doc.content ?? "<p></p>", doc.name);
      await fs.promises.writeFile(path.join(UPLOAD_DIR, storedName), buffer);
      // L'ancien fichier devient orphelin → nettoyage silencieux
      if (doc.filePath) {
        await fs.promises
          .unlink(path.join(UPLOAD_DIR, path.basename(doc.filePath)))
          .catch(() => {});
      }
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          filePath: storedName,
          mimeType: DOCX_MIME,
          size: buffer.length,
        },
      });
      generated++;
      console.log(
        `  ✔ « ${doc.name} » → ${safeName} (${(buffer.length / 1024).toFixed(1)} Ko)`
      );
    } catch (e) {
      console.warn(`  ✖ échec .docx pour « ${doc.name} » :`, (e as Error).message);
    }
  }

  console.log(
    `\nBilan : ${styled} classeur(s) Excel mis en forme, ${generated} document(s) Word générés, ${skipped} ignoré(s).`
  );
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
