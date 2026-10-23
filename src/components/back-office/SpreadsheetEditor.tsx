"use client";

import React from "react";
import { useBoData } from "@/hooks/useBoData";
import { boEngine } from "@/lib/offline/engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import {
  Save,
  Download,
  FileSpreadsheet,
  Plus,
  Trash2,
  Printer,
  ExternalLink,
  Table as TableIcon,
  Sigma,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═════════════════════════════════════════════════════════════
// Moteur de formules — =SUM(A1:A5), =AVERAGE(...), =B2+100*C1…
// ═════════════════════════════════════════════════════════════

export interface SheetData {
  cols: string[];
  rows: string[][];
}

function colLetter(index: number): string {
  let s = "";
  let i = index;
  while (i >= 0) {
    s = String.fromCharCode(65 + (i % 26)) + s;
    i = Math.floor(i / 26) - 1;
  }
  return s;
}

function parseCellRef(ref: string): { r: number; c: number } | null {
  const m = /^([A-Z]+)([0-9]+)$/.exec(ref.trim().toUpperCase());
  if (!m) return null;
  let c = 0;
  for (const ch of m[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
  return { r: parseInt(m[2], 10) - 1, c: c - 1 };
}

function evaluate(
  expr: string,
  getRaw: (r: number, c: number) => string,
  visited: Set<string>
): number {
  const src = expr.replace(/\s+/g, "");

  // Fonctions — SUM / AVERAGE / MIN / MAX / COUNT
  const fnMatch = /^(SUM|AVERAGE|MIN|MAX|COUNT)\((.+)\)$/.exec(src);
  if (fnMatch) {
    const fn = fnMatch[1];
    const args: number[] = [];
    for (const part of fnMatch[2].split(",")) {
      const range = /^([A-Z]+[0-9]+):([A-Z]+[0-9]+)$/.exec(part);
      if (range) {
        const a = parseCellRef(range[1])!;
        const b = parseCellRef(range[2])!;
        for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r); r++) {
          for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) {
            const v = getComputed(r, c);
            if (isFinite(v)) args.push(v);
          }
        }
      } else {
        const ref = parseCellRef(part);
        if (ref) {
          const v = getComputed(ref.r, ref.c);
          if (isFinite(v)) args.push(v);
        } else {
          const n = Number(part);
          if (isFinite(n)) args.push(n);
        }
      }
    }
    switch (fn) {
      case "SUM": return args.reduce((s, v) => s + v, 0);
      case "AVERAGE": return args.length ? args.reduce((s, v) => s + v, 0) / args.length : NaN;
      case "MIN": return args.length ? Math.min(...args) : NaN;
      case "MAX": return args.length ? Math.max(...args) : NaN;
      case "COUNT": return args.length;
    }
  }

  // Expression arithmétique : nombres, refs de cellules, + - * / ( )
  const tokenList = src.match(/([A-Z]+[0-9]+|[0-9]+\.?[0-9]*|[+\-*/()])/g);
  if (!tokenList) return NaN;
  const tokens: string[] = tokenList;

  let pos = 0;
  function peek(): string | undefined {
    return tokens[pos];
  }
  function parsePrimary(): number {
    const t = tokens[pos];
    if (t === undefined) return NaN;
    if (t === "(") {
      pos++;
      const v = parseSum();
      if (tokens[pos] === ")") pos++;
      return v;
    }
    if (t === "-") {
      pos++;
      return -parsePrimary();
    }
    if (t === "+") {
      pos++;
      return parsePrimary();
    }
    pos++;
    if (/^[A-Z]+[0-9]+$/.test(t)) {
      const ref = parseCellRef(t)!;
      return getComputed(ref.r, ref.c);
    }
    return Number(t);
  }
  function parseProduct(): number {
    let v = parsePrimary();
    while (peek() === "*" || peek() === "/") {
      const op = tokens[pos++]!;
      const rhs = parsePrimary();
      v = op === "*" ? v * rhs : v / rhs;
    }
    return v;
  }
  function parseSum(): number {
    let v = parseProduct();
    while (peek() === "+" || peek() === "-") {
      const op = tokens[pos++]!;
      const rhs = parseProduct();
      v = op === "+" ? v + rhs : v - rhs;
    }
    return v;
  }

  function getComputed(r: number, c: number): number {
    if (r < 0 || c < 0) return NaN;
    const key = `${r}:${c}`;
    if (visited.has(key)) return NaN; // dépendance circulaire
    const raw = getRaw(r, c);
    if (!raw) return NaN;
    if (raw.startsWith("=")) {
      visited.add(key);
      const v = evaluate(raw.slice(1), getRaw, visited);
      visited.delete(key);
      return v;
    }
    const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
    return n;
  }

  const result = parseSum();
  return result;
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return "#ERREUR!";
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

// ═════════════════════════════════════════════════════════════
// Composant éditeur
// ═════════════════════════════════════════════════════════════

export function SpreadsheetEditor({
  documentId,
  documentName,
  initialData,
  initialVersion = 1,
}: {
  documentId: string;
  documentName: string;
  initialData: SheetData;
  initialVersion?: number;
}) {
  const bo = useBoData();
  const [name, setName] = React.useState(documentName);
  const [data, setData] = React.useState<SheetData>(initialData);
  const [selected, setSelected] = React.useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [editing, setEditing] = React.useState<{ r: number; c: number } | null>(null);
  const [draft, setDraft] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const tableRef = React.useRef<HTMLDivElement>(null);
  const loadedVersion = React.useRef(initialVersion);

  // Hors-ligne : restaure la dernière version enregistrée localement
  // (IndexedDB) si elle est plus récente que le rendu serveur en cache.
  const storeDoc = bo.snapshot?.documents.find((d) => d.id === documentId);
  React.useEffect(() => {
    if (!storeDoc || !storeDoc.content || dirty) return;
    if ((storeDoc.version ?? 0) <= loadedVersion.current) return;
    loadedVersion.current = storeDoc.version;
    try {
      const parsed = JSON.parse(storeDoc.content);
      if (Array.isArray(parsed?.cols) && Array.isArray(parsed?.rows)) {
        setData({
          cols: parsed.cols.map((c: unknown) => String(c ?? "")),
          rows: parsed.rows.map((r: unknown[]) =>
            Array.isArray(r) ? r.map((c) => String(c ?? "")) : []
          ),
        });
        setName(storeDoc.name);
      }
    } catch {
      // contenu illisible — on garde la version affichée
    }
  }, [storeDoc, dirty]);

  const colCount = data.cols.length;
  const rowCount = data.rows.length;

  const getRaw = React.useCallback(
    (r: number, c: number) => data.rows[r]?.[c] ?? "",
    [data.rows]
  );

  const displayValue = React.useCallback(
    (r: number, c: number): string => {
      const raw = getRaw(r, c);
      if (raw.startsWith("=")) {
        const v = evaluate(raw.slice(1), getRaw, new Set());
        return formatNumber(v);
      }
      return raw;
    },
    [getRaw]
  );

  function setCell(r: number, c: number, value: string) {
    setData((d) => {
      const rows = d.rows.map((row) => [...row]);
      while (rows.length <= r) rows.push(Array(d.cols.length).fill(""));
      rows[r][c] = value;
      return { ...d, rows };
    });
    setDirty(true);
  }

  function setColName(c: number, value: string) {
    setData((d) => {
      const cols = [...d.cols];
      cols[c] = value;
      return { ...d, cols };
    });
    setDirty(true);
  }

  function addRow() {
    setData((d) => ({ ...d, rows: [...d.rows, Array(d.cols.length).fill("")] }));
    setDirty(true);
  }
  function addCol() {
    setData((d) => ({
      cols: [...d.cols, `Colonne ${colLetter(d.cols.length)}`],
      rows: d.rows.map((row) => [...row, ""]),
    }));
    setDirty(true);
  }
  function deleteRow(r: number) {
    setData((d) => ({ ...d, rows: d.rows.filter((_, i) => i !== r) }));
    setDirty(true);
  }
  function deleteCol(c: number) {
    if (colCount <= 1) return;
    setData((d) => ({
      cols: d.cols.filter((_, i) => i !== c),
      rows: d.rows.map((row) => row.filter((_, i) => i !== c)),
    }));
    setDirty(true);
  }

  // Sauvegarde — locale immédiate (IndexedDB) + synchronisation automatique
  // vers la base distante dès que la connexion est disponible.
  async function save() {
    setSaving(true);
    try {
      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "document.saveContent",
        createdAt: new Date().toISOString(),
        payload: {
          id: documentId,
          name,
          content: JSON.stringify(data),
        },
      });
      loadedVersion.current += 1;
      setDirty(false);
      const heure = new Date().toLocaleTimeString("fr-FR");
      if (navigator.onLine) {
        toast.success(`Enregistré à ${heure}`, { description: name });
      } else {
        toast.success(`Enregistré localement à ${heure}`, {
          description: "Hors-ligne — synchronisation automatique dès le retour de la connexion.",
        });
      }
    } catch {
      toast.error("Échec de l’enregistrement local.");
    } finally {
      setSaving(false);
    }
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, name]);

  // Navigation clavier sur la grille
  function onGridKeyDown(e: React.KeyboardEvent, r: number, c: number) {
    if (editing) return;
    if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      startEdit(r, c);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected({ r: Math.min(r + 1, rowCount - 1), c });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected({ r: Math.max(r - 1, 0), c });
    } else if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      setSelected({ r, c: Math.min(c + 1, colCount - 1) });
    } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      setSelected({ r, c: Math.max(c - 1, 0) });
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      setCell(r, c, "");
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      startEdit(r, c, e.key);
    }
  }

  function startEdit(r: number, c: number, initial?: string) {
    // Si une autre cellule était en édition, valider sa valeur d'abord
    if (editing) {
      setCell(editing.r, editing.c, draft);
    }
    setEditing({ r, c });
    setDraft(initial ?? getRaw(r, c));
  }

  function commitEdit() {
    if (editing) {
      setCell(editing.r, editing.c, draft);
      setEditing(null);
    }
  }

  // ── Exports ──
  async function exportXlsx() {
    const XLSX = await import("xlsx");
    const aoa: (string | number)[][] = [data.cols];
    for (let r = 0; r < rowCount; r++) {
      const row: (string | number)[] = [];
      for (let c = 0; c < colCount; c++) {
        const raw = getRaw(r, c);
        if (raw.startsWith("=")) {
          const v = evaluate(raw.slice(1), getRaw, new Set());
          row.push(isFinite(v) ? Math.round(v * 100) / 100 : raw);
        } else {
          const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
          row.push(raw !== "" && isFinite(n) ? n : raw);
        }
      }
      aoa.push(row);
    }
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feuille 1");
    XLSX.writeFile(wb, `${name.replace(/[\/\\:*\?"<>|]/g, "_")}.xlsx`);
    toast.success("Export Excel généré", { description: "Compatible Excel, Google Sheets et LibreOffice." });
  }

  async function exportCsv() {
    const XLSX = await import("xlsx");
    const aoa: (string | number)[][] = [data.cols];
    for (let r = 0; r < rowCount; r++) {
      aoa.push(data.rows[r].map((raw) => raw));
    }
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const csv = XLSX.utils.sheet_to_csv(ws, { FS: ";" });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/[\/\\:*\?"<>|]/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPdf() {
    const win = window.open("", "_blank", "width=1000,height=700");
    if (!win) {
      toast.error("Autorisez les fenêtres pop-up pour générer le PDF.");
      return;
    }
    const rowsHtml = data.rows
      .map(
        (row, r) =>
          `<tr>${data.cols
            .map((_, c) => {
              const v = displayValue(r, c);
              const isNum = /^[\d\s,.]+$/.test(v) && v.trim() !== "";
              return `<td class="${isNum ? "num" : ""}">${escapeHtml(v)}</td>`;
            })
            .join("")}</tr>`
      )
      .join("");
    win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(name)}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#0C193D; padding:32px; }
  h1 { font-size:20px; margin:0 0 4px; }
  .meta { color:#4A4E69; font-size:11px; margin-bottom:18px; }
  table { border-collapse:collapse; width:100%; }
  th, td { border:1px solid #c9cfdc; padding:6px 10px; font-size:12px; text-align:left; }
  th { background:#0C193D; color:#fff; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; }
  td.num { text-align:right; font-variant-numeric: tabular-nums; }
  tr:nth-child(even) td { background:#F4F6FB; }
  footer { margin-top:24px; color:#4A4E69; font-size:10px; }
</style></head><body>
<h1>${escapeHtml(name)}</h1>
<div class="meta">Cabinet SERMA — document de travail · généré le ${new Date().toLocaleDateString("fr-FR")}</div>
<table><thead><tr>${data.cols.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table>
<footer>Cabinet SERMA SARL · Parakou, Bénin — confidentiel</footer>
<script>window.onload = () => window.print();</script>
</body></html>`);
    win.document.close();
  }

  const selRaw = getRaw(selected.r, selected.c);
  const selDisplay = displayValue(selected.r, selected.c);
  const hasFormula = selRaw.startsWith("=");

  return (
    <div className="flex flex-col gap-4">
      <Toaster richColors position="top-right" />

      {/* Barre d'outils */}
      <div className="bo-no-print rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] p-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-vert-tech/10 text-[#256b4d] shrink-0">
            <FileSpreadsheet className="w-[18px] h-[18px]" aria-hidden />
          </span>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setDirty(true);
            }}
            className="h-9 w-56 font-semibold text-marine-profond border-marine-profond/15 focus-visible:ring-orange-logo/50"
            aria-label="Nom du document"
          />
          {dirty && <span className="text-[11px] font-bold text-orange-contrast">•</span>}
        </div>

        <div className="w-px h-6 bg-marine-profond/10 mx-1" aria-hidden />

        <Button onClick={save} disabled={saving} size="sm" className="h-9 bg-orange-logo hover:bg-orange-sature text-white shadow-orange">
          <Save className="w-4 h-4 mr-1.5" aria-hidden />
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button onClick={exportXlsx} variant="outline" size="sm" className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
          <Download className="w-4 h-4 mr-1.5" aria-hidden />
          Excel (.xlsx)
        </Button>
        <Button onClick={exportCsv} variant="outline" size="sm" className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
          <FileDown className="w-4 h-4 mr-1.5" aria-hidden />
          CSV
        </Button>
        <Button onClick={printPdf} variant="outline" size="sm" className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
          <Printer className="w-4 h-4 mr-1.5" aria-hidden />
          PDF
        </Button>

        <div className="w-px h-6 bg-marine-profond/10 mx-1" aria-hidden />

        <Button onClick={addRow} variant="outline" size="sm" className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
          <Plus className="w-4 h-4 mr-1" aria-hidden />
          Ligne
        </Button>
        <Button onClick={addCol} variant="outline" size="sm" className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
          <Plus className="w-4 h-4 mr-1" aria-hidden />
          Colonne
        </Button>
        <Button
          onClick={() => deleteRow(selected.r)}
          variant="outline"
          size="sm"
          className="h-9 border-marine-profond/20 text-gris-texte hover:text-red-600 hover:border-red-300"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" aria-hidden />
          Suppr. ligne
        </Button>
        <Button
          onClick={() => deleteCol(selected.c)}
          variant="outline"
          size="sm"
          className="h-9 border-marine-profond/20 text-gris-texte hover:text-red-600 hover:border-red-300"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" aria-hidden />
          Suppr. colonne
        </Button>

        <a
          href="https://sheets.google.com/create"
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-gris-texte hover:text-marine-profond transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          Ouvrir Google Sheets
        </a>
      </div>

      {/* Barre de formule */}
      <div className="bo-no-print flex items-center gap-2 rounded-xl border border-marine-profond/[0.07] bg-white px-3 py-2 shadow-[0_2px_12px_rgba(12,25,61,0.05)]">
        <span className="font-inter text-[11px] font-extrabold text-marine-profond/60 w-14 text-center shrink-0 tabular-nums">
          {colLetter(selected.c)}
          {selected.r + 1}
        </span>
        <Sigma className="w-4 h-4 text-orange-contrast shrink-0" aria-hidden />
        <Input
          value={editing && editing.r === selected.r && editing.c === selected.c ? draft : selRaw}
          onChange={(e) => {
            if (editing && editing.r === selected.r && editing.c === selected.c) setDraft(e.target.value);
            else {
              setEditing({ ...selected });
              setDraft(e.target.value);
            }
          }}
          onFocus={() => {
            if (!editing) {
              setEditing({ ...selected });
              setDraft(selRaw);
            }
          }}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitEdit();
              inputRef.current?.blur();
              tableRef.current?.focus();
            }
            if (e.key === "Escape") {
              setEditing(null);
            }
          }}
          ref={inputRef}
          placeholder="Valeur ou formule — ex. =SUM(D2:D8)"
          className="h-8 font-inter text-[13px] tabular-nums border-transparent focus-visible:border-orange-logo/40 bg-gris-bleute/40"
          aria-label="Barre de formule"
        />
        {hasFormula && (
          <span className="font-inter text-[11px] text-gris-texte shrink-0 tabular-nums">
            = {selDisplay}
          </span>
        )}
      </div>

      {/* Grille */}
      <div
        ref={tableRef}
        tabIndex={0}
        role="grid"
        aria-label={`Feuille ${name}`}
        onKeyDown={(e) => onGridKeyDown(e, selected.r, selected.c)}
        className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-auto bo-scrollbar-light max-h-[62vh] focus:outline-none focus:ring-2 focus:ring-orange-logo/40"
      >
        <table className="bo-sheet-table w-min min-w-full text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="bo-sheet-row-header sticky left-0 z-20 w-10 min-w-10 px-1 py-1.5 text-[10.5px] font-bold text-marine-profond/50 border border-marine-profond/10" aria-label="Numéros de ligne" />
              {data.cols.map((col, c) => (
                <th key={c} className="bo-sheet-row-header px-1 py-1 min-w-[150px] border-b border-marine-profond/10">
                  <input
                    value={col}
                    onChange={(e) => setColName(c, e.target.value)}
                    aria-label={`Nom de la colonne ${colLetter(c)}`}
                    className="w-full bg-transparent text-[11px] font-bold uppercase tracking-wide text-marine-profond/70 text-center focus:text-marine-profond focus:bg-orange-logo/[0.06] outline-none px-2 py-1 rounded"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, r) => (
              <tr key={r} className="group/row">
                <td className="bo-sheet-row-header sticky left-0 z-10 text-center text-[10.5px] font-bold text-marine-profond/50 tabular-nums border border-marine-profond/10 w-10 min-w-10">
                  <span className="group-hover/row:hidden">{r + 1}</span>
                  <button
                    type="button"
                    onClick={() => deleteRow(r)}
                    className="hidden group-hover/row:inline-flex items-center justify-center w-5 h-5 rounded text-red-500 hover:bg-red-50"
                    aria-label={`Supprimer la ligne ${r + 1}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
                {data.cols.map((_, c) => {
                  const isSelected = selected.r === r && selected.c === c;
                  const isEditing = editing?.r === r && editing?.c === c;
                  const value = displayValue(r, c);
                  const isNum = /^[\d\s,.]+/.test(value) && value.trim() !== "";
                  return (
                    <td
                      key={c}
                      onClick={() => {
                        if (!isEditing) setSelected({ r, c });
                      }}
                      onDoubleClick={() => startEdit(r, c)}
                      className={cn(
                        "px-2.5 py-1.5 min-w-[150px] h-8 cursor-cell whitespace-nowrap",
                        isSelected && !isEditing && "bo-sheet-cell-selected",
                        isNum && "text-right font-inter tabular-nums"
                      )}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              commitEdit();
                              setSelected({ r: Math.min(r + 1, rowCount - 1), c });
                              tableRef.current?.focus();
                            }
                            if (e.key === "Tab") {
                              e.preventDefault();
                              commitEdit();
                              setSelected({ r, c: Math.min(c + 1, colCount - 1) });
                              tableRef.current?.focus();
                            }
                            if (e.key === "Escape") {
                              setEditing(null);
                              tableRef.current?.focus();
                            }
                          }}
                          className="w-full bg-white outline-none text-[13px] font-inter"
                        />
                      ) : (
                        <span className={cn(getRaw(r, c).startsWith("=") && "text-orange-contrast font-medium")}>
                          {value}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pied : aides et stats */}
      <div className="bo-no-print flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-gris-texte">
        <p className="flex items-center gap-1.5">
          <TableIcon className="w-3.5 h-3.5" aria-hidden />
          {rowCount} lignes × {colCount} colonnes — Ctrl+S pour enregistrer, double-clic pour éditer une cellule.
        </p>
        <p>
          Formules prises en charge :{" "}
          <code className="font-inter text-marine-profond bg-gris-bleute px-1.5 py-0.5 rounded">=SUM(B2:B10)</code>{" "}
          <code className="font-inter text-marine-profond bg-gris-bleute px-1.5 py-0.5 rounded">=AVERAGE(…)</code>{" "}
          <code className="font-inter text-marine-profond bg-gris-bleute px-1.5 py-0.5 rounded">=B2*1.18</code>
        </p>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
