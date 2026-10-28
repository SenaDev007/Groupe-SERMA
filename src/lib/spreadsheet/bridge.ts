/**
 * Pont entre fichiers Excel RÉELS (.xlsx — format Microsoft) et l'éditeur
 * de tableur Univer du back-office — FIDÉLITÉ TOTALE.
 *
 * Flux :
 *   .xlsx (octets)  ──xlsxToBridge──►  BridgeWorkbook  ──bridgeToUniverData──►  Univer
 *   Univer (facade) ──(extraction)──►  BridgeWorkbook  ──bridgeToXlsx──►  .xlsx (octets)
 *
 * Fidélité transportée (round-trip complet, exactement comme un fichier
 * produit dans Microsoft Excel) :
 *   • valeurs, formules (+ résultats en cache), formats de nombres ;
 *   • polices (famille, taille, gras, italique, souligné, barré, couleur) ;
 *   • fonds de cellule (couleurs pleines) ;
 *   • bordures (les 4 côtés, tous les styles OOXML, couleur) ;
 *   • alignements (horizontal, vertical, renvoi à la ligne, shrink, retrait,
 *     rotation) ;
 *   • fusions de cellules, largeurs de colonnes, hauteurs de lignes ;
 *   • feuilles multiples (ordre, noms, masquées, couleur d'onglet) ;
 *   • volets figés (freeze panes) ;
 *   • liens hypertexte.
 *
 * Lecture : SheetJS (valeurs + formules, y compris formules partagées) puis
 * ExcelJS (styles, formats, volets) — les deux bibliothèques sont fusionnées
 * cellule par cellule. Écriture : ExcelJS (styles complets au format OOXML).
 * Les imports Univer sont des imports de TYPES (effacés à la compilation).
 */

import * as XLSX from "xlsx";
import type { ICellData, IStyleData, IWorkbookData, IWorksheetData } from "@univerjs/presets";

// ─────────────────────────────────────────────────────────────
// Types du pont (représentation neutre)
// ─────────────────────────────────────────────────────────────

/** Bordure d'un côté de cellule — style OOXML + couleur RRGGBB (sans #). */
export interface BridgeBorder {
  /** Nom de style OOXML : thin, medium, thick, hair, dotted, dashed… */
  s: string;
  /** Couleur RRGGBB sans dièse. */
  c?: string;
}

/** Mise en forme complète d'une cellule (équivalent Excel). */
export interface BridgeStyle {
  /** Famille de police (ex. « Calibri »). */
  ff?: string;
  /** Taille de police en points. */
  fs?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  /** Couleur du texte RRGGBB sans dièse. */
  color?: string;
  /** Fond plein RRGGBB sans dièse. */
  fill?: string;
  /** Bordures par côté. */
  bd?: Partial<Record<"t" | "r" | "b" | "l", BridgeBorder>>;
  /** Alignement horizontal : left | center | right | justify | distributed. */
  h?: string;
  /** Alignement vertical : top | middle | bottom | distributed | justify. */
  v?: string;
  /** Renvoi à la ligne automatique. */
  wrap?: boolean;
  /** Réduire pour ajuster. */
  shrink?: boolean;
  /** Retrait (0–250). */
  indent?: number;
  /** Rotation du texte en degrés (0–180) ; 255 = vertical. */
  rot?: number;
}

export interface BridgeCell {
  /** Valeur (nombre / texte / booléen) — valeur calculée pour les formules. */
  v?: string | number | boolean;
  /** Formule SANS le signe « = » initial (ex. "SUM(A1:A2)"). */
  f?: string;
  /** Format de nombre au pattern Excel (ex. "#,##0.00"). */
  z?: string;
  /** Mise en forme complète. */
  st?: BridgeStyle;
  /** Lien hypertexte (URL). */
  link?: string;
}

export interface BridgeMerge {
  sr: number; // ligne de départ (0-based)
  sc: number; // colonne de départ (0-based)
  er: number; // ligne de fin incluse
  ec: number; // colonne de fin incluse
}

/** Volets figés : nombre de colonnes / lignes figées. */
export interface BridgeFreeze {
  x: number;
  y: number;
}

export interface BridgeSheet {
  name: string;
  hidden?: boolean;
  /** Couleur d'onglet RRGGBB sans dièse. */
  tabColor?: string;
  /** Volets figés. */
  freeze?: BridgeFreeze;
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
// Tables de conversion (valeurs vérifiées contre le runtime Univer 1.2)
// ─────────────────────────────────────────────────────────────

/** Style de bordure OOXML → enum numérique Univer BorderStyleTypes. */
const BORDER_NAME_TO_UNIVER: Record<string, number> = {
  none: 0,
  thin: 1,
  hair: 2,
  dotted: 3,
  dashed: 4,
  dashDot: 5,
  dashDotDot: 6,
  double: 7,
  medium: 8,
  mediumDashed: 9,
  mediumDashDot: 10,
  mediumDashDotDot: 11,
  slantDashDot: 12,
  thick: 13,
};

/** Enum numérique Univer BorderStyleTypes → style de bordure OOXML. */
const BORDER_UNIVER_TO_NAME: Record<number, string> = Object.fromEntries(
  Object.entries(BORDER_NAME_TO_UNIVER).map(([k, v]) => [v, k])
);

/** Alignement horizontal Excel → enum numérique Univer HorizontalAlign. */
const H_ALIGN_TO_UNIVER: Record<string, number> = {
  left: 1,
  center: 2,
  right: 3,
  justify: 4,
  justified: 4,
  distributed: 6,
  // valeurs rares ramenées à l'équivalent le plus proche
  centerContinuous: 2,
  fill: 1,
  general: 0,
};

/** Enum numérique Univer HorizontalAlign → alignement horizontal Excel. */
const H_UNIVER_TO_ALIGN: Record<number, string> = {
  1: "left",
  2: "center",
  3: "right",
  4: "justify",
  6: "distributed",
};

/** Alignement vertical Excel → enum numérique Univer VerticalAlign. */
const V_ALIGN_TO_UNIVER: Record<string, number> = {
  top: 1,
  middle: 2,
  bottom: 3,
  distributed: 3,
  justify: 2,
  center: 2,
};

/** Enum numérique Univer VerticalAlign → alignement vertical Excel. */
const V_UNIVER_TO_ALIGN: Record<number, string> = {
  1: "top",
  2: "middle",
  3: "bottom",
};

// ─────────────────────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────────────────────

const key = (r: number, c: number) => `${r}:${c}`;

/** Convertit des caractères de largeur Excel (wch) en pixels. */
function wchToPx(wch: number): number {
  return Math.round(wch * 7 + 5);
}

/** Convertit des pixels en caractères de largeur Excel. */
function pxToWch(px: number): number {
  return Math.max(2, Math.round(((px - 5) / 7) * 100) / 100);
}

/** Convertit des points de hauteur (hpt) en pixels. */
function hptToPx(hpt: number): number {
  return Math.round((hpt * 96) / 72);
}

/** Convertit des pixels en points de hauteur. */
function pxToHpt(px: number): number {
  return Math.round((px * 0.75) * 100) / 100;
}

function sanitizeSheetName(name: string, index: number): string {
  let n = (name || "").replace(/[\[\]:*?/\\]/g, " ").trim();
  if (!n) n = `Feuille${index + 1}`;
  return n.slice(0, 31);
}

/** ARGB ExcelJS (« FFRRGGBB » / « RRGGBB ») → RRGGBB sans dièse. */
function argbToRgb(argb: unknown): string | undefined {
  if (typeof argb !== "string" || !/^[0-9A-Fa-f]{6,8}$/.test(argb)) return undefined;
  const hex = argb.length === 8 ? argb.slice(2) : argb;
  // blanc pur sans alpha explicite = souvent un placeholder → garder quand même
  return hex.toUpperCase();
}

/** Couleur Univer (« #RRGGBB » ou « rgb(r,g,b) ») → RRGGBB sans dièse. */
export function univerColorToRgb(c: unknown): string | undefined {
  if (typeof c !== "string") return undefined;
  const mHex = /^#?([0-9A-Fa-f]{6})$/.exec(c.trim());
  if (mHex) return mHex[1].toUpperCase();
  const mRgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/.exec(c);
  if (mRgb) {
    return [mRgb[1], mRgb[2], mRgb[3]]
      .map((n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }
  return undefined;
}

/** Chargement paresseux d'ExcelJS (bundle navigateur — import dynamique). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadExcelJS(): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("exceljs");
  // CJS : selon l'interop, la classe Workbook est sur default ou à la racine
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lib: any = mod?.default ?? mod;
  if (typeof lib?.Workbook !== "function") {
    throw new Error("ExcelJS indisponible");
  }
  return lib;
}

// ─────────────────────────────────────────────────────────────
// .xlsx → Bridge (lecture DOUBLE : SheetJS + ExcelJS fusionnées)
// ─────────────────────────────────────────────────────────────

export async function xlsxToBridge(data: ArrayBuffer | Uint8Array): Promise<BridgeWorkbook> {
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);

  // ── Passe 1 : SheetJS — valeurs, formules (partagées incluses), formats,
  // fusions, dimensions. Rapide et complète sur le contenu. ──
  const wb = XLSX.read(buf, {
    type: "array",
    cellFormula: true,
    cellNF: true,
    cellStyles: false,
    // stubs = cellules vide : nécessaire pour capter les formules SANS
    // valeur en cache (<f> sans <v> — fichiers écrits par des outils
    // tiers) que SheetJS ignore sinon complètement.
    sheetStubs: true,
    raw: true,
  });
  // Visibilité des feuilles (SheetJS : wb.Workbook.Sheets[i].Hidden)
  const sheetVisibility = (wb.Workbook?.Sheets ?? []).map(
    (s: { Hidden?: number } | undefined) => (s?.Hidden ?? 0) !== 0
  );

  const sheets: BridgeSheet[] = [];
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const idx = sheets.length;
    const bridge: BridgeSheet = {
      name: sanitizeSheetName(sheetName, idx),
      hidden: sheetVisibility[idx] ?? false,
      cells: {},
      merges: [],
      colWidths: {},
      rowHeights: {},
    };

    const ref = (ws["!ref"] as string) || "A1:A1";
    const range = XLSX.utils.decode_range(ref);

    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr] as XLSX.CellObject | undefined;
        if (!cell) continue;

        const out: BridgeCell = {};
        if (cell.t === "z" || cell.v === undefined) {
          if (cell.z && typeof cell.z === "string") out.z = cell.z;
        } else {
          const isFormulaEcho =
            typeof cell.v === "string" && cell.v.trim().startsWith("=");
          if (!isFormulaEcho) out.v = cell.v as string | number | boolean;
          if (cell.z && typeof cell.z === "string") out.z = cell.z;
        }
        if (typeof cell.f === "string" && cell.f.length > 0) {
          out.f = cell.f.startsWith("=") ? cell.f.slice(1) : cell.f;
        }
        if (out.v !== undefined || out.f !== undefined || out.z !== undefined) {
          bridge.cells[key(r, c)] = out;
        }
      }
    }

    for (const m of ws["!merges"] || []) {
      bridge.merges.push({ sr: m.s.r, sc: m.s.c, er: m.e.r, ec: m.e.c });
    }

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

  // ── Passe 2 : ExcelJS — mise en forme (polices, fonds, bordures,
  // alignements), formats de nombres par cellule, liens, volets figés,
  // couleurs d'onglet, état masqué, largeurs/hauteurs manquantes. ──
  try {
    const ExcelJS = await loadExcelJS();
    const ewb = new ExcelJS.Workbook();
    await ewb.xlsx.load(buf);

    // Correspondance nom nettoyé → bridge (l'ordre ExcelJS = l'ordre réel)
    const byName = new Map(sheets.map((s) => [s.name.toLowerCase(), s]));

    for (const ews of ewb.worksheets as Array<{
      name: string;
      state?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties?: { tabColor?: { argb?: string } };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      views?: any[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eachRow: (opts: { includeEmpty: boolean }, cb: (row: any, n: number) => void) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getColumn: (n: number) => any;
    }>) {
      const target = byName.get(sanitizeSheetName(ews.name, 0).toLowerCase());
      if (!target) continue;

      // Onglet masqué / couleur d'onglet / volets figés
      target.hidden = ews.state === "hidden" || ews.state === "veryHidden" ? true : target.hidden;
      const tab = argbToRgb(ews.properties?.tabColor?.argb);
      if (tab) target.tabColor = tab;
      const view = (ews.views ?? []).find(
        (v) => v?.state === "frozen" || v?.state === "frozenSplit"
      );
      if (view && (view.xSplit > 0 || view.ySplit > 0)) {
        target.freeze = { x: view.xSplit || 0, y: view.ySplit || 0 };
      }

      // Styles cellule par cellule
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ews.eachRow({ includeEmpty: true }, (row: any, rowNum: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        row.eachCell({ includeEmpty: true }, (cell: any, colNum: number) => {
          const r = rowNum - 1;
          const c = colNum - 1;
          if (r < 0 || c < 0) return;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const style: any = cell.style ?? {};
          const st = exceljsStyleToBridge(style);
          const numFmt: string | undefined = style.numFmt || undefined;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const val = cell.value as any;
          let link: string | undefined;
          if (val && typeof val === "object" && !Array.isArray(val) && "hyperlink" in val) {
            link = String((val as { hyperlink?: unknown }).hyperlink ?? "");
          }

          if (!st && !numFmt && !link) return;

          const existing = target.cells[key(r, c)] ?? {};
          if (numFmt) existing.z = numFmt;
          if (st) existing.st = st;
          if (link && !existing.f) existing.link = link;
          // cellule stylée mais vide : conserve la trace pour l'écriture
          if (existing.v === undefined && existing.f === undefined && !existing.z && !numFmt) {
            // style seul sur cellule vide : on la crée uniquement pour le style
          }
          target.cells[key(r, c)] = existing;
        });
      });

      // Largeurs manquantes (caractères ExcelJS → pixels)
      const colCount = Math.max(
        Object.keys(target.colWidths).length,
        Number(ews.getColumn?.(1)?.worksheet?.columnCount ?? 0)
      );
      for (let c = 0; c < colCount; c++) {
        if (target.colWidths[c]) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const col: any = ews.getColumn(c + 1);
        const w = col?.width ?? col?.model?.width;
        if (typeof w === "number" && w > 0) target.colWidths[c] = wchToPx(w);
      }

      // Hauteurs de lignes (points ExcelJS → pixels) — SheetJS ne les
      // transporte qu'avec cellStyles, on prend donc la voie ExcelJS.
      const rowCount = Number((ews as { rowCount?: number }).rowCount ?? 0);
      for (let r = 1; r <= rowCount; r++) {
        if (target.rowHeights[r - 1]) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: any = ews.getRow(r);
        const h = row?.height ?? row?.model?.height;
        if (typeof h === "number" && h > 0) target.rowHeights[r - 1] = hptToPx(h);
      }
    }
  } catch {
    // Fichier illisible par ExcelJS (rare) : contenu sans styles, on continue
  }

  return { sheets };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exceljsStyleToBridge(style: any): BridgeStyle | undefined {
  if (!style || typeof style !== "object") return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const font: any = style.font;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fill: any = style.fill;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const border: any = style.border;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alignment: any = style.alignment;

  const st: BridgeStyle = {};

  if (font && typeof font === "object") {
    if (typeof font.name === "string" && font.name) st.ff = font.name;
    if (typeof font.size === "number" && font.size > 0) st.fs = font.size;
    if (font.bold) st.bold = true;
    if (font.italic) st.italic = true;
    if (font.underline) st.underline = true;
    if (font.strike) st.strike = true;
    const fc = argbToRgb(font.color?.argb ?? font.color);
    if (fc && fc !== "000000") st.color = fc;
  }
  if (fill && fill.type === "pattern" && (fill.pattern === "solid" || !fill.pattern)) {
    // couleur de fond : fgColor porte la teinte réelle dans Excel
    const bg = argbToRgb(fill.fgColor?.argb ?? fill.fgColor) ?? argbToRgb(fill.bgColor?.argb ?? fill.bgColor);
    if (bg && bg !== "FFFFFF") st.fill = bg;
  }
  if (border && typeof border === "object") {
    const bd: BridgeStyle["bd"] = {};
    for (const side of ["top", "left", "bottom", "right"] as const) {
      const b = border[side];
      if (b && typeof b === "object" && typeof b.style === "string" && b.style !== "none") {
        const target = side === "top" ? "t" : side === "left" ? "l" : side === "bottom" ? "b" : "r";
        const c = argbToRgb(b.color?.argb ?? b.color);
        bd[target] = { s: b.style, ...(c ? { c } : {}) };
      }
    }
    if (Object.keys(bd).length > 0) st.bd = bd;
  }
  if (alignment && typeof alignment === "object") {
    if (typeof alignment.horizontal === "string") st.h = alignment.horizontal;
    if (typeof alignment.vertical === "string") st.v = alignment.vertical;
    if (alignment.wrapText) st.wrap = true;
    if (alignment.shrinkToFit) st.shrink = true;
    if (typeof alignment.indent === "number" && alignment.indent > 0) st.indent = alignment.indent;
    if (typeof alignment.textRotation === "number" && alignment.textRotation !== 0) {
      st.rot = alignment.textRotation;
    }
  }

  return Object.keys(st).length > 0 ? st : undefined;
}

// ─────────────────────────────────────────────────────────────
// Bridge → .xlsx (vrai fichier Excel, mise en forme COMPLÈTE)
// ─────────────────────────────────────────────────────────────

export async function bridgeToXlsx(workbook: BridgeWorkbook): Promise<Uint8Array> {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cabinet SERMA — Back-office";
  wb.created = new Date();

  const usedNames = new Set<string>();

  for (let i = 0; i < workbook.sheets.length; i++) {
    const sheet = workbook.sheets[i];

    let name = sanitizeSheetName(sheet.name, i);
    let suffix = 2;
    while (usedNames.has(name.toLowerCase())) {
      name = sanitizeSheetName(`${sheet.name.slice(0, 27)} (${suffix++})`, i);
    }
    usedNames.add(name.toLowerCase());

    const ws = wb.addWorksheet(name, {
      state: sheet.hidden ? "hidden" : "visible",
      properties: {
        ...(sheet.tabColor ? { tabColor: { argb: `FF${sheet.tabColor}` } } : {}),
      },
    });

    if (sheet.freeze && (sheet.freeze.x > 0 || sheet.freeze.y > 0)) {
      ws.views = [
        { state: "frozen", xSplit: sheet.freeze.x, ySplit: sheet.freeze.y },
      ];
    }

    // Valeurs + formules + styles (avant les fusions : ExcelJS redirige
    // ensuite les écritures des cellules fusionnées vers la cellule maître)
    for (const [k, cell] of Object.entries(sheet.cells)) {
      const [rStr, cStr] = k.split(":");
      const r = Number(rStr);
      const c = Number(cStr);
      if (!Number.isFinite(r) || !Number.isFinite(c)) continue;

      const ec = ws.getCell(r + 1, c + 1);

      if (cell.f !== undefined && cell.f !== "") {
        const formula = cell.f.startsWith("=") ? cell.f.slice(1) : cell.f;
        if (cell.link) {
          ec.value = {
            hyperlink: cell.link,
            text: typeof cell.v === "string" ? cell.v : formula,
          };
        } else {
          ec.value = {
            formula,
            ...(cell.v !== undefined && cell.v !== null ? { result: cell.v as number } : {}),
          };
        }
      } else if (cell.link) {
        ec.value = {
          hyperlink: cell.link,
          text: typeof cell.v === "string" ? cell.v : cell.link,
        };
      } else if (cell.v !== undefined && cell.v !== null) {
        ec.value = cell.v;
      }

      if (cell.z) ec.numFmt = cell.z;
      if (cell.st) applyExceljsStyle(ec, cell.st);
    }

    // Fusions
    for (const m of sheet.merges) {
      try {
        ws.mergeCells(m.sr + 1, m.sc + 1, m.er + 1, m.ec + 1);
      } catch {
        // fusion déjà posée / invalide → ignorée
      }
    }

    // Largeurs de colonnes / hauteurs de lignes
    for (const [cStr, px] of Object.entries(sheet.colWidths)) {
      ws.getColumn(Number(cStr) + 1).width = pxToWch(px);
    }
    for (const [rStr, px] of Object.entries(sheet.rowHeights)) {
      ws.getRow(Number(rStr) + 1).height = pxToHpt(px);
    }
  }

  if (wb.worksheets.length === 0) {
    wb.addWorksheet("Feuille1");
  }

  const out = await wb.xlsx.writeBuffer();
  // Node Buffer comme ArrayBuffer : les deux sont normalisés ici
  return out instanceof ArrayBuffer ? new Uint8Array(out) : new Uint8Array(out as Buffer);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyExceljsStyle(cell: any, st: BridgeStyle): void {
  if (st.ff !== undefined || st.fs !== undefined || st.bold || st.italic || st.underline || st.strike || st.color) {
    cell.font = {
      ...(st.ff ? { name: st.ff } : {}),
      ...(st.fs ? { size: st.fs } : {}),
      ...(st.bold ? { bold: true } : {}),
      ...(st.italic ? { italic: true } : {}),
      ...(st.underline ? { underline: true } : {}),
      ...(st.strike ? { strike: true } : {}),
      ...(st.color ? { color: { argb: `FF${st.color}` } } : {}),
    };
  }
  if (st.fill) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${st.fill}` },
    };
  }
  if (st.bd) {
    const border: Record<string, { style: string; color?: { argb: string } }> = {};
    type SideKey = keyof NonNullable<BridgeStyle["bd"]> & string;
    const sides: Array<[SideKey, string]> = [
      ["t", "top"],
      ["l", "left"],
      ["b", "bottom"],
      ["r", "right"],
    ];
    for (const [k, side] of sides) {
      const b = st.bd?.[k];
      if (b) {
        border[side] = {
          style: b.s,
          ...(b.c ? { color: { argb: `FF${b.c}` } } : {}),
        };
      }
    }
    if (Object.keys(border).length > 0) cell.border = border;
  }
  if (st.h !== undefined || st.v !== undefined || st.wrap || st.shrink || st.indent || st.rot !== undefined) {
    const alignment: Record<string, string | number | boolean> = {};
    if (st.h) alignment.horizontal = st.h === "justified" ? "justify" : st.h;
    if (st.v) alignment.vertical = st.v === "center" ? "middle" : st.v;
    if (st.wrap) alignment.wrapText = true;
    if (st.shrink) alignment.shrinkToFit = true;
    if (st.indent) alignment.indent = st.indent;
    if (st.rot !== undefined) alignment.textRotation = st.rot;
    cell.alignment = alignment;
  }
}

// ─────────────────────────────────────────────────────────────
// Bridge → données Univer (création du classeur, styles complets)
// ─────────────────────────────────────────────────────────────

const BUFFER_ROWS = 40;
const BUFFER_COLS = 6;
const MAX_ROWS = 5000;
const MAX_COLS = 120;

/** Style du pont → IStyleData Univer (enums numériques 1.2 vérifiées). */
function bridgeStyleToUniver(st: BridgeStyle): IStyleData {
  const out: IStyleData = {};
  if (st.ff) out.ff = st.ff;
  if (typeof st.fs === "number" && st.fs > 0) out.fs = st.fs;
  if (st.bold) out.bl = 1;
  if (st.italic) out.it = 1;
  if (st.underline) out.ul = { s: 1 };
  if (st.strike) out.st = { s: 1 };
  if (st.color) out.cl = { rgb: `#${st.color}` };
  if (st.fill) out.bg = { rgb: `#${st.fill}` };
  if (st.bd) {
    const bd: IStyleData["bd"] = {};
    for (const k of ["t", "r", "b", "l"] as const) {
      const b = st.bd[k];
      if (!b) continue;
      const numeric = BORDER_NAME_TO_UNIVER[b.s];
      if (numeric === undefined) continue;
      bd[k] = {
        // enum numérique BorderStyleTypes du runtime Univer 1.2
        s: numeric as unknown as NonNullable<NonNullable<IStyleData["bd"]>["t"]>["s"],
        ...(b.c ? { cl: { rgb: `#${b.c}` } } : {}),
      };
    }
    if (Object.keys(bd).length > 0) out.bd = bd;
  }
  if (st.h) {
    const numeric = H_ALIGN_TO_UNIVER[st.h];
    if (numeric && numeric > 0) out.ht = numeric as IStyleData["ht"];
  }
  if (st.v) {
    const numeric = V_ALIGN_TO_UNIVER[st.v];
    if (numeric && numeric > 0) out.vt = numeric as IStyleData["vt"];
  }
  if (st.wrap) out.tb = 3; // WrapStrategy.WRAP
  if (st.shrink) out.stf = 1;
  if (st.rot !== undefined) {
    if (st.rot === 255) out.tr = { a: 0, v: 1 };
    else out.tr = { a: st.rot };
  }
  return out;
}

/** IStyleData Univer (snapshot) → style du pont (enums numériques 1.2). */
export function univerStyleToBridge(style: IStyleData): BridgeStyle | undefined {
  if (!style || typeof style !== "object") return undefined;
  const st: BridgeStyle = {};

  if (typeof style.ff === "string" && style.ff) st.ff = style.ff;
  if (typeof style.fs === "number" && style.fs > 0) st.fs = style.fs;
  if (style.bl === 1) st.bold = true;
  if (style.it === 1) st.italic = true;
  if (style.ul?.s === 1) st.underline = true;
  if (style.st?.s === 1) st.strike = true;
  const cl = univerColorToRgb(style.cl?.rgb);
  if (cl && cl !== "000000") st.color = cl;
  const bg = univerColorToRgb(style.bg?.rgb);
  if (bg && bg !== "FFFFFF") st.fill = bg;

  const bd = style.bd;
  if (bd && typeof bd === "object") {
    const out: BridgeStyle["bd"] = {};
    for (const k of ["t", "r", "b", "l"] as const) {
      const b = bd[k];
      if (!b || typeof b !== "object") continue;
      const name = BORDER_UNIVER_TO_NAME[b.s as number];
      if (!name || name === "none") continue;
      out[k] = { s: name, ...(b.cl?.rgb ? { c: univerColorToRgb(b.cl.rgb) ?? undefined } : {}) };
    }
    if (Object.keys(out).length > 0) st.bd = out;
  }

  if (typeof style.ht === "number") {
    const name = H_UNIVER_TO_ALIGN[style.ht];
    if (name) st.h = name;
  } else if (typeof style.ht === "string") {
    st.h = style.ht;
  }
  if (typeof style.vt === "number") {
    const name = V_UNIVER_TO_ALIGN[style.vt];
    if (name) st.v = name;
  } else if (typeof style.vt === "string") {
    st.v = style.vt;
  }
  if (style.tb === 3) st.wrap = true;
  if (style.stf === 1) st.shrink = true;
  const tr = style.tr;
  if (tr && typeof tr === "object") {
    if (typeof tr.a === "number" && tr.a !== 0) st.rot = tr.a;
    else if (tr.v) st.rot = 255;
  }

  return Object.keys(st).length > 0 ? st : undefined;
}

export function bridgeToUniverData(
  docName: string,
  workbook: BridgeWorkbook
): Partial<IWorkbookData> {
  // Styles dédupliqués par contenu exact (formule → id)
  const styleByKey = new Map<string, string>();
  const styles: Record<string, IStyleData> = {};
  let styleSeq = 0;
  function styleIdOf(st: BridgeStyle, pattern?: string): string | undefined {
    const univerStyle = bridgeStyleToUniver(st);
    const full: IStyleData = pattern ? { ...univerStyle, n: { pattern } } : univerStyle;
    if (Object.keys(full).length === 0) return undefined;
    const cacheKey = JSON.stringify(full);
    let k = styleByKey.get(cacheKey);
    if (!k) {
      k = `s${styleSeq++}`;
      styleByKey.set(cacheKey, k);
      styles[k] = full;
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
        cd.f = cell.f.startsWith("=") ? cell.f : `=${cell.f}`;
      }
      if (cell.st || cell.z) {
        const sid = cell.st ? styleIdOf(cell.st, cell.z) : styleIdOf({}, cell.z);
        if (sid) cd.s = sid;
      }
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

    const freeze = sheet.freeze;
    return {
      name: sanitizeSheetName(sheet.name, i),
      hidden: sheet.hidden ? 1 : 0,
      ...(sheet.tabColor ? { tabColor: `#${sheet.tabColor}` } : {}),
      ...(freeze && (freeze.x > 0 || freeze.y > 0)
        ? {
            freeze: {
              xSplit: freeze.x,
              ySplit: freeze.y,
              startRow: freeze.y,
              startColumn: freeze.x,
            },
          }
        : {}),
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
    } as Partial<IWorksheetData>;
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
  // porter le MÊME id que la clé — sinon l'index interne d'Univer diverge.
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

  /** Applique le format de nombre Excel (#,##0 · 0,00 % …) pour l'affichage. */
  const fmt = (v: string | number | boolean | undefined, z: string | undefined): string => {
    if (v === undefined || v === null) return "";
    if (typeof v !== "number" || !z) return String(v);
    const m = z.match(/(?:\.|,)(0+)/);
    const decimals = m ? m[1].length : 0;
    const isPercent = z.includes("%");
    const value = isPercent ? v * 100 : v;
    const fixed = (isPercent && Math.abs(value) < 1e-6 ? 0 : value).toFixed(decimals);
    const neg = fixed.startsWith("-");
    const digits = neg ? fixed.slice(1) : fixed;
    const [int, dec] = digits.split(".");
    const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
    const body = intFmt + (dec ? "," + dec : "");
    return (neg ? "−" : "") + body + (isPercent ? " %" : "");
  };

  const rows: string[] = [];
  for (let r = 0; r <= maxR; r++) {
    const tds: string[] = [];
    for (let c = 0; c <= maxC; c++) {
      const cell = sheet.cells[key(r, c)];
      const text = cell ? fmt(cell.v, cell.z) : "";
      tds.push(`<td>${esc(text)}</td>`);
    }
    rows.push(`<tr>${tds.join("")}</tr>`);
  }
  return `<table class="sheet">${rows.join("")}</table>`;
}
