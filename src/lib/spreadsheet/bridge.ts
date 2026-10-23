/**
 * Pont entre fichiers Excel RÉELS (.xlsx — format Microsoft) et l'éditeur
 * de tableur Univer du back-office.
 *
 * Flux :
 *   .xlsx (octets)  ──xlsxToBridge──►  BridgeWorkbook  ──bridgeToUniverData──►  Univer
 *   Univer (facade) ──(extraction)──►  BridgeWorkbook  ──bridgeToXlsx──►  .xlsx (octets)
 *
 * Fidélité transportée : valeurs, formules (plus de 400 fonctions dans
 * l'éditeur), formats de nombres (patterns Excel), feuilles multiples,
 * fusions de cellules, largeurs de colonnes / hauteurs de lignes.
 *
 * Dépendance runtime : SheetJS (xlsx) uniquement — les imports Univer sont
 * des imports de TYPES (effacés à la compilation, zéro impact bundle).
 */

import * as XLSX from "xlsx";
import type { ICellData, IWorkbookData, IWorksheetData } from "@univerjs/presets";

// ─────────────────────────────────────────────────────────────
// Types du pont (représentation neutre)
// ─────────────────────────────────────────────────────────────

export interface BridgeCell {
  /** Valeur (nombre / texte / booléen) — valeur calculée pour les formules. */
  v?: string | number | boolean;
  /** Formule SANS le signe « = » initial (ex. "SUM(A1:A2)"). */
  f?: string;
  /** Format de nombre au pattern Excel (ex. "#,##0.00"). */
  z?: string;
}

export interface BridgeMerge {
  sr: number; // ligne de départ (0-based)
  sc: number; // colonne de départ (0-based)
  er: number; // ligne de fin incluse
  ec: number; // colonne de fin incluse
}

export interface BridgeSheet {
  name: string;
  hidden?: boolean;
  /** Cellules indexées « row:col » (0-based). */
  cells: Record<string, BridgeCell>;
  merges: BridgeMerge[];
  /** Largeur des colonnes en pixels, indexée par numéro de colonne. */
  colWidths: Record<number, number>;
  /** Hauteur des lignes en pixels, indexée par numéro de ligne. */
  rowHeights: Record<number, number>;
}

export interface BridgeWorkbook {
  sheets: BridgeSheet[];
}

// ─────────────────────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────────────────────

const key = (r: number, c: number) => `${r}:${c}`;

/** Convertit des caractères de largeur Excel (wch) en pixels. */
function wchToPx(wch: number): number {
  return Math.round(wch * 7.5);
}

/** Convertit des points de hauteur (hpt) en pixels. */
function hptToPx(hpt: number): number {
  return Math.round((hpt * 96) / 72);
}

function sanitizeSheetName(name: string, index: number): string {
  let n = (name || "").replace(/[\[\]:*?/\\]/g, " ").trim();
  if (!n) n = `Feuille${index + 1}`;
  return n.slice(0, 31);
}

// ─────────────────────────────────────────────────────────────
// .xlsx → Bridge
// ─────────────────────────────────────────────────────────────

export function xlsxToBridge(data: ArrayBuffer | Uint8Array): BridgeWorkbook {
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
  const wb = XLSX.read(buf, {
    type: "array",
    cellFormula: true, // conserver les formules
    cellNF: true, // conserver les formats de nombres
    cellStyles: false,
    sheetStubs: false,
    raw: true, // valeurs brutes (nombres, pas de formatage texte)
  });

  const sheets: BridgeSheet[] = [];
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const bridge: BridgeSheet = {
      name: sanitizeSheetName(sheetName, sheets.length),
      hidden: !!(ws as unknown as { hidden?: boolean }).hidden,
      cells: {},
      merges: [],
      colWidths: {},
      rowHeights: {},
    };

    // Plage utilisée
    const ref = (ws["!ref"] as string) || "A1:A1";
    const range = XLSX.utils.decode_range(ref);

    // Cellules : valeurs, formules, formats
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr] as XLSX.CellObject | undefined;
        if (!cell) continue;

        const out: BridgeCell = {};
        if (cell.t === "z" || cell.v === undefined) {
          // cellule vide avec éventuellement un format
          if (cell.z && typeof cell.z === "string") out.z = cell.z;
        } else {
          // Une valeur texte identique à la formule est un artefact de migration :
          // on la jette pour laisser le moteur de calcul recalculer.
          const isFormulaEcho =
            typeof cell.v === "string" && cell.v.trim().startsWith("=");
          if (!isFormulaEcho) out.v = cell.v as string | number | boolean;
          if (cell.z && typeof cell.z === "string") out.z = cell.z;
        }
        if (typeof cell.f === "string" && cell.f.length > 0) {
          // SheetJS stocke la formule sans « = »
          out.f = cell.f.startsWith("=") ? cell.f.slice(1) : cell.f;
        }
        if (out.v !== undefined || out.f !== undefined || out.z !== undefined) {
          bridge.cells[key(r, c)] = out;
        }
      }
    }

    // Fusions
    for (const m of ws["!merges"] || []) {
      bridge.merges.push({ sr: m.s.r, sc: m.s.c, er: m.e.r, ec: m.e.c });
    }

    // Largeurs de colonnes / hauteurs de lignes
    const colsInfo = ws["!cols"] ?? [];
    for (let c = 0; c < colsInfo.length; c++) {
      const col = colsInfo[c];
      if (!col) continue;
      const px = col.wpx ?? (col.wch != null ? wchToPx(col.wch) : undefined);
      if (px && px > 0) bridge.colWidths[c] = px;
    }
    const rowsInfo = ws["!rows"] ?? [];
    for (let r = 0; r < rowsInfo.length; r++) {
      const row = rowsInfo[r];
      if (!row) continue;
      const px = row.hpx ?? (row.hpt != null ? hptToPx(row.hpt) : undefined);
      if (px && px > 0) bridge.rowHeights[r] = px;
    }

    sheets.push(bridge);
  }

  return { sheets };
}

// ─────────────────────────────────────────────────────────────
// Bridge → .xlsx (vrai fichier Excel)
// ─────────────────────────────────────────────────────────────

export function bridgeToXlsx(workbook: BridgeWorkbook): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  for (let i = 0; i < workbook.sheets.length; i++) {
    const sheet = workbook.sheets[i];

    // Nom unique et sûr (31 caractères max)
    let name = sanitizeSheetName(sheet.name, i);
    let suffix = 2;
    while (usedNames.has(name.toLowerCase())) {
      name = sanitizeSheetName(`${sheet.name.slice(0, 27)} (${suffix++})`, i);
    }
    usedNames.add(name.toLowerCase());

    const ws: XLSX.WorkSheet = {};
    let maxR = 0;
    let maxC = 0;

    for (const [k, cell] of Object.entries(sheet.cells)) {
      const [rStr, cStr] = k.split(":");
      const r = Number(rStr);
      const c = Number(cStr);
      if (!Number.isFinite(r) || !Number.isFinite(c)) continue;

      const out: XLSX.CellObject = {} as XLSX.CellObject;
      if (cell.f !== undefined && cell.f !== "") {
        // SheetJS attend la formule sans « = » ET exige une valeur en cache,
        // sinon la cellule est silencieusement abandonnée à l'écriture.
        out.f = cell.f.startsWith("=") ? cell.f.slice(1) : cell.f;
        if (cell.v !== undefined && cell.v !== null) {
          out.v = cell.v;
        } else {
          out.v = 0; // recalculée par Excel / Univer à l'ouverture
        }
        if (typeof out.v === "number") out.t = "n";
        else if (typeof out.v === "boolean") out.t = "b";
        else if (typeof out.v === "string") out.t = "s";
      } else if (cell.v !== undefined && cell.v !== null) {
        out.v = cell.v;
        if (typeof cell.v === "number") out.t = "n";
        else if (typeof cell.v === "boolean") out.t = "b";
        else out.t = "s";
      } else if (cell.v === "") {
        out.v = "";
        out.t = "s";
      }
      if (cell.z) out.z = cell.z;

      if (out.v !== undefined || out.f !== undefined || out.z !== undefined) {
        ws[XLSX.utils.encode_cell({ r, c })] = out;
        if (r > maxR) maxR = r;
        if (c > maxC) maxC = c;
      }
    }

    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });

    if (sheet.merges.length > 0) {
      ws["!merges"] = sheet.merges.map((m) => ({
        s: { r: m.sr, c: m.sc },
        e: { r: m.er, c: m.ec },
      }));
    }

    const cols: XLSX.ColInfo[] = [];
    for (const [cStr, px] of Object.entries(sheet.colWidths)) {
      cols[Number(cStr)] = { wpx: Math.round(px) };
    }
    if (cols.length > 0) ws["!cols"] = cols;

    const rows: XLSX.RowInfo[] = [];
    for (const [rStr, px] of Object.entries(sheet.rowHeights)) {
      rows[Number(rStr)] = { hpx: Math.round(px) };
    }
    if (rows.length > 0) ws["!rows"] = rows;

    if (sheet.hidden) {
      (ws as unknown as { hidden?: boolean }).hidden = true;
    }

    XLSX.utils.book_append_sheet(wb, ws, name);
  }

  if (wb.SheetNames.length === 0) {
    XLSX.utils.book_append_sheet(wb, { "!ref": "A1:A1" }, "Feuille1");
  }

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  return out;
}

// ─────────────────────────────────────────────────────────────
// Bridge → données Univer (création du classeur)
// ─────────────────────────────────────────────────────────────

const BUFFER_ROWS = 40;
const BUFFER_COLS = 6;
const MAX_ROWS = 5000;
const MAX_COLS = 120;

export function bridgeToUniverData(
  docName: string,
  workbook: BridgeWorkbook
): Partial<IWorkbookData> {
  // Styles dédupliqués par pattern de format de nombre
  const styleByPattern = new Map<string, string>();
  const styles: Record<string, { n?: { pattern: string } }> = {};
  let styleSeq = 0;
  function styleKeyOf(pattern: string): string {
    let k = styleByPattern.get(pattern);
    if (!k) {
      k = `s${styleSeq++}`;
      styleByPattern.set(pattern, k);
      styles[k] = { n: { pattern } };
    }
    return k;
  }

  const sheets: Partial<IWorksheetData>[] = workbook.sheets.map((sheet, i) => {
    let maxR = 0;
    let maxC = 0;
    const cellData: Record<number, Record<number, ICellData>> = {};

    for (const [k, cell] of Object.entries(sheet.cells)) {
      const [rStr, cStr] = k.split(":");
      const r = Number(rStr);
      const c = Number(cStr);
      if (!Number.isFinite(r) || !Number.isFinite(c)) continue;

      const cd: ICellData = {};
      if (
        cell.v !== undefined &&
        cell.v !== null &&
        cell.v !== "" &&
        !(typeof cell.v === "string" && cell.v.trim().startsWith("="))
      ) {
        cd.v = cell.v;
      }
      if (cell.f !== undefined && cell.f !== "") {
        // Univer stocke la formule AVEC « = »
        cd.f = cell.f.startsWith("=") ? cell.f : `=${cell.f}`;
      }
      if (cell.z) cd.s = styleKeyOf(cell.z);
      if (cd.v !== undefined || cd.f !== undefined || cd.s !== undefined) {
        (cellData[r] ??= {})[c] = cd;
        if (r > maxR) maxR = r;
        if (c > maxC) maxC = c;
      }
    }

    const columnData: Record<number, { w?: number }> = {};
    for (const [cStr, px] of Object.entries(sheet.colWidths)) {
      columnData[Number(cStr)] = { w: Math.round(px) };
    }
    const rowData: Record<number, { h?: number }> = {};
    for (const [rStr, px] of Object.entries(sheet.rowHeights)) {
      rowData[Number(rStr)] = { h: Math.round(px) };
    }

    return {
      // PAS d'identifiant personnalisé : Univer attribue les siens et un id
      // externe casse l'index interne (getSheetBySheetId ne retrouve plus la
      // feuille → toutes les commandes d'édition échouent silencieusement).
      name: sanitizeSheetName(sheet.name, i),
      hidden: sheet.hidden ? 1 : 0,
      rowCount: Math.min(maxR + 1 + BUFFER_ROWS, MAX_ROWS),
      columnCount: Math.min(maxC + 1 + BUFFER_COLS, MAX_COLS),
      cellData,
      mergeData: sheet.merges.map((m) => ({
        startRow: m.sr,
        startColumn: m.sc,
        endRow: m.er,
        endColumn: m.ec,
      })),
      columnData,
      rowData,
    };
  });

  if (sheets.length === 0) {
    sheets.push({
      name: "Feuille 1",
      rowCount: 100,
      columnCount: 26,
      cellData: {},
      mergeData: [],
    });
  }

  // sheets doit être un RECORD (clé = id de feuille) et chaque snapshot doit
  // porter le MÊME id que la clé — sinon l'index interne d'Univer diverge et
  // toutes les commandes d'édition échouent (getSheetBySheetId introuvable).
  const sheetsRecord: Record<string, Partial<IWorksheetData>> = {};
  sheets.forEach((sheet, i) => {
    const id = `sheet-${i}`;
    sheetsRecord[id] = { ...sheet, id };
  });

  return {
    name: docName,
    styles,
    sheets: sheetsRecord,
  } as unknown as Partial<IWorkbookData>;
}

// ─────────────────────────────────────────────────────────────
// Ancienne grille JSON (SHEET historique) → Bridge
// Utilisée par la migration et le repli sans fichier.
// ─────────────────────────────────────────────────────────────

export interface LegacySheetData {
  cols: string[];
  rows: string[][];
}

export function legacyGridToBridge(docName: string, legacy: LegacySheetData): BridgeWorkbook {
  const cells: Record<string, BridgeCell> = {};
  const colWidths: Record<number, number> = {};

  // Ligne 1 = en-têtes de colonnes
  legacy.cols.forEach((label, c) => {
    if (label) cells[key(0, c)] = { v: String(label) };
    colWidths[c] = 140;
  });

  legacy.rows.forEach((row, r) => {
    row.forEach((raw, c) => {
      const value = String(raw ?? "");
      if (value === "") return;
      if (value.startsWith("=")) {
        cells[key(r + 1, c)] = { f: value.slice(1) };
      } else {
        const num = Number(value.replace(/\s/g, "").replace(",", "."));
        if (value.trim() !== "" && Number.isFinite(num) && /^[\d\s.,-]+$/.test(value)) {
          cells[key(r + 1, c)] = { v: num };
        } else {
          cells[key(r + 1, c)] = { v: value };
        }
      }
    });
  });

  const sheet: BridgeSheet = {
    name: sanitizeSheetName(docName.replace(/\.xlsx?$/i, ""), 0) || "Feuille 1",
    cells,
    merges: [],
    colWidths,
    rowHeights: {},
  };

  return { sheets: [sheet] };
}

/** Convertit une feuille en table HTML (impression / export PDF). */
export function bridgeToHtmlTable(sheet: BridgeSheet): string {
  let maxR = 0;
  let maxC = 0;
  for (const k of Object.keys(sheet.cells)) {
    const [r, c] = k.split(":").map(Number);
    if (r > maxR) maxR = r;
    if (c > maxC) maxC = c;
  }
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const rows: string[] = [];
  for (let r = 0; r <= maxR; r++) {
    const tds: string[] = [];
    for (let c = 0; c <= maxC; c++) {
      const cell = sheet.cells[key(r, c)];
      const text = cell?.v !== undefined ? String(cell.v) : "";
      tds.push(`<td>${esc(text)}</td>`);
    }
    rows.push(`<tr>${tds.join("")}</tr>`);
  }
  return `<table class="sheet">${rows.join("")}</table>`;
}
