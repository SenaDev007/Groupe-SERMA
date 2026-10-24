/**
 * Migration des tableurs historiques → VRAIS fichiers Excel (.xlsx).
 *
 * Chaque document de type SHEET (grille JSON {cols, rows}) sans fichier
 * physique devient un fichier .xlsx réel stocké sous upload/bo-files,
 * référencé par Document.filePath — éditable et téléchargeable comme un
 * fichier Microsoft Excel.
 *
 * Les documents FILE dont l'original est déjà un .xlsx restent intacts :
 * l'éditeur ouvre désormais directement le fichier original.
 *
 * Idempotent : ré-exécutable sans duplication.
 * Usage : node scripts/migrate-sheets-to-xlsx.js
 */
// Client selon la base active : Neon (postgres) ou miroir local (SQLite)
const { PrismaClient } =
  process.env.SERMAHUB_DATABASE_URL &&
  !process.env.SERMAHUB_DATABASE_URL.startsWith("file:")
    ? require("@prisma/client")
    : require("../src/generated/prisma-sqlite");
const { randomUUID } = require("crypto");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), "upload", "bo-files");
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Grille JSON {cols, rows} → feuille SheetJS (valeurs + formules). */

function colLetterToIndex(letters) {
  let c = 0;
  for (const ch of letters.toUpperCase()) c = c * 26 + (ch.charCodeAt(0) - 64);
  return c - 1;
}

/** Numéro depuis un texte ("12 500 000" → 12500000). */
function parseNum(v) {
  if (typeof v === "number") return v;
  const s = String(v ?? "").replace(/\s/g, "").replace(",", ".");
  if (s === "" || !/^[-\d.]+$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Mini-évaluateur des formules héritées (mêmes règles que l'ancien éditeur) :
 * SUM / AVERAGE / MIN / MAX / COUNT sur plages + expression arithmétique
 * simple avec références de cellules. Retourne la valeur en cache ou null.
 */
function evaluateLegacy(formula, grid, r0, c0) {
  const get = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length) return null;
    const row = grid[r];
    if (!row || c >= row.length) return null;
    const raw = row[c];
    if (typeof raw === "string" && raw.trim().startsWith("=")) return null; // pas de cascade
    return parseNum(raw);
  };
  const src = String(formula).replace(/^\s*=/, "").replace(/\s+/g, "");
  const fn = /^(SUM|AVERAGE|MIN|MAX|COUNT)\((.+)\)$/i.exec(src);
  if (fn) {
    const nums = [];
    for (const part of fn[2].split(",")) {
      const range = /^([A-Z]+[0-9]+):([A-Z]+[0-9]+)$/i.exec(part);
      if (range) {
        const c1 = colLetterToIndex(range[1].replace(/[0-9]/g, ""));
        const r1 = parseInt(range[1].replace(/[A-Z]/gi, ""), 10) - 1;
        const c2 = colLetterToIndex(range[2].replace(/[0-9]/g, ""));
        const r2 = parseInt(range[2].replace(/[A-Z]/gi, ""), 10) - 1;
        for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
          for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
            const v = get(r, c);
            if (v !== null) nums.push(v);
          }
        }
      } else {
        const ref = /^([A-Z]+)([0-9]+)$/i.exec(part);
        if (ref) {
          const v = get(parseInt(ref[2], 10) - 1, colLetterToIndex(ref[1]));
          if (v !== null) nums.push(v);
        } else {
          const n = parseNum(part);
          if (n !== null) nums.push(n);
        }
      }
    }
    switch (fn[1].toUpperCase()) {
      case "SUM": return nums.reduce((s, v) => s + v, 0);
      case "AVERAGE": return nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : null;
      case "MIN": return nums.length ? Math.min(...nums) : null;
      case "MAX": return nums.length ? Math.max(...nums) : null;
      case "COUNT": return nums.length;
    }
    return null;
  }
  // Expression arithmétique : nombres et refs
  const tokens = src.match(/([A-Z]+[0-9]+|[0-9]+\.?[0-9]*|[+\-*/()])/gi);
  if (!tokens) return null;
  let pos = 0;
  function peek() { return tokens[pos]; }
  function primary() {
    const t = tokens[pos];
    if (t === undefined) return null;
    if (t === "(") { pos++; const v = sum(); if (tokens[pos] === ")") pos++; return v; }
    if (t === "-") { pos++; const v = primary(); return v === null ? null : -v; }
    pos++;
    if (/^[A-Z]+[0-9]+$/i.test(t)) {
      const ref = /^([A-Z]+)([0-9]+)$/i.exec(t);
      return get(parseInt(ref[2], 10) - 1, colLetterToIndex(ref[1]));
    }
    const n = parseNum(t);
    return n;
  }
  function term() {
    let v = primary();
    while (v !== null && (peek() === "*" || peek() === "/")) {
      const op = tokens[pos++]; const rhs = primary();
      if (rhs === null) return null;
      v = op === "*" ? v * rhs : v / rhs;
    }
    return v;
  }
  function sum() {
    let v = term();
    while (v !== null && (peek() === "+" || peek() === "-")) {
      const op = tokens[pos++]; const rhs = term();
      if (rhs === null) return null;
      v = op === "+" ? v + rhs : v - rhs;
    }
    return v;
  }
  const result = sum();
  return pos === tokens.length ? result : null;
}

/** Décale les références d'une formule d'une ligne vers le bas
 * (la migration insère une ligne d'en-têtes en haut de feuille). */
function shiftFormulaRefs(f) {
  return String(f).replace(/([A-Z]{1,3})(\d{1,5})/gi, (m, col, row) => {
    return col + String(parseInt(row, 10) + 1);
  });
}

function legacyToSheet(legacy) {
  // Valeurs simples (les formules sont posées après coup : aoa_to_sheet
  // ne transporte pas les formules des objets-cellules)
  const aoa = [legacy.cols.map((c) => String(c ?? ""))];
  const formulaCells = []; // { r, c, f, v }
  legacy.rows.forEach((row, r) => {
    const out = [];
    row.forEach((cell, c) => {
      const v = String(cell ?? "");
      if (v.startsWith("=") && v.length > 1) {
        const cached = evaluateLegacy(v, legacy.rows, r, c);
        formulaCells.push({ r: r + 1, c, f: v.slice(1), v: cached });
        out.push(cached !== null ? cached : null);
      } else {
        const num = Number(v.replace(/\s/g, "").replace(",", "."));
        if (v.trim() !== "" && Number.isFinite(num) && /^[\d\s.,-]+$/.test(v)) {
          out.push(num);
        } else {
          out.push(v);
        }
      }
    });
    aoa.push(out);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Formules explicites + valeur calculée en cache (SheetJS exige une
  // valeur, sinon la formule est silencieusement abandonnée à l'écriture).
  // Les références sont décalées d'une ligne : l'en-tête occupe désormais
  // la ligne 1 du classeur.
  for (const { r, c, f, v } of formulaCells) {
    ws[XLSX.utils.encode_cell({ r, c })] = { t: "n", v: v ?? 0, f: shiftFormulaRefs(f) };
  }
  ws["!cols"] = legacy.cols.map(() => ({ wpx: 140 }));
  return ws;
}

async function main() {
  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });

  const sheets = await prisma.document.findMany({
    where: { kind: "SHEET", filePath: null },
  });
  console.log(`Documents SHEET sans fichier : ${sheets.length}`);

  let migrated = 0;
  let blank = 0;
  for (const doc of sheets) {
    let legacy = null;
    try {
      const parsed = JSON.parse(doc.content ?? "null");
      if (parsed && Array.isArray(parsed.cols) && Array.isArray(parsed.rows)) {
        legacy = parsed;
      }
    } catch {
      /* contenu illisible */
    }

    // Classeur : grille convertie, ou classeur vierge
    const wb = XLSX.utils.book_new();
    const displayName = doc.name.replace(/\.xlsx?$/i, "");
    if (legacy && (legacy.cols.some((c) => String(c ?? "") !== "") || legacy.rows.length > 0)) {
      XLSX.utils.book_append_sheet(wb, legacyToSheet(legacy), "Feuille 1");
    } else {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[]]), "Feuille 1");
      blank++;
    }

    const bytes = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    const safeName = `${displayName.replace(/[\/\\\0]/g, "_")}.xlsx`;
    const storedName = `${randomUUID()}-${safeName}`;
    await fs.promises.writeFile(path.join(UPLOAD_DIR, storedName), bytes);

    await prisma.document.update({
      where: { id: doc.id },
      data: {
        filePath: storedName,
        mimeType: XLSX_MIME,
        size: bytes.length,
        // content conservé tel quel (repli) — le fichier fait foi
      },
    });
    migrated++;
    console.log(
      `  ✔ « ${doc.name} » → ${safeName} (${(bytes.length / 1024).toFixed(1)} Ko)`
    );
  }

  // État des lieux
  const totalSheets = await prisma.document.count({ where: { kind: "SHEET" } });
  const withFile = await prisma.document.count({
    where: { kind: "SHEET", filePath: { not: null } },
  });
  console.log(
    `\nBilan : ${migrated} migré(s) (+${blank} vierge(s)), ${totalSheets} SHEET au total, ${withFile} avec fichier réel.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
