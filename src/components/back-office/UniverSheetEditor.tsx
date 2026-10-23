"use client";

/**
 * ÉDITEUR TABLEUR — VRAI FICHIER EXCEL (.xlsx)
 *
 * Moteur d'édition : Univer (interface complète type Microsoft Excel :
 * formules 400+ fonctions, feuilles multiples, fusions, formats de nombres,
 * barre de formule, glisser-recopie…).
 * Persistance : le document est un FICHIER .xlsx réel — créé, édité et
 * téléchargé dans le format Microsoft. Offline-first : dernier fichier
 * conservé en IndexedDB, modification enregistrée localement puis
 * synchronisée automatiquement vers PostgreSQL (Neon) au retour du réseau.
 */

import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Download,
  FileSpreadsheet,
  Printer,
  FileDown,
  CloudOff,
  Loader2,
  CircleCheck,
  TriangleAlert,
} from "lucide-react";
import { boEngine } from "@/lib/offline/engine";
import { blobGet, blobPut } from "@/lib/offline/idb";
import {
  xlsxToBridge,
  bridgeToXlsx,
  bridgeToUniverData,
  legacyGridToBridge,
  bridgeToHtmlTable,
  type BridgeWorkbook,
  type BridgeSheet,
  type LegacySheetData,
} from "@/lib/spreadsheet/bridge";
import type { FUniver } from "@univerjs/presets";
import type { ICellData, IWorksheetData } from "@univerjs/presets";

import "@univerjs/preset-sheets-core/lib/index.css";

type UniverBundle = {
  univer: { dispose: () => void };
  univerAPI: FUniver;
};

export interface UniverSheetEditorProps {
  documentId: string;
  documentName: string;
  /** true si un fichier .xlsx existe déjà côté serveur. */
  hasFile: boolean;
  /** Repli : ancienne grille JSON (documents créés avant la migration). */
  fallbackLegacy?: LegacySheetData | null;
}

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const BLOB_KEY = (docId: string) => `xlsx-${docId}`;

function blankWorkbook(): BridgeWorkbook {
  return {
    sheets: [
      {
        name: "Feuille 1",
        cells: {},
        merges: [],
        colWidths: {},
        rowHeights: {},
      },
    ],
  };
}

/** Extraction Univer → Bridge (valeurs calculées, formules, formats). */
function extractBridge(api: FUniver): BridgeWorkbook {
  const wb = api.getActiveWorkbook();
  if (!wb) return blankWorkbook();

  const snapshot = wb.getWorkbook().getSnapshot();
  const styles = (snapshot.styles ?? {}) as Record<
    string,
    { n?: { pattern: string } } | null
  >;
  const sheetSnapshots = (snapshot.sheets ?? {}) as Record<string, Partial<IWorksheetData>>;

  const sheets: BridgeSheet[] = [];
  for (const fws of wb.getSheets()) {
    const sheetId = fws.getSheetId();
    const snap = sheetSnapshots[sheetId] ?? {};
    const rows = Math.min(fws.getMaxRows(), 5000);
    const cols = Math.min(fws.getMaxColumns(), 120);

    // Valeurs calculées (résultats de formules inclus) + formules brutes
    const values = fws.getRange(0, 0, rows, cols).getValues();
    const formulas = fws.getRange(0, 0, rows, cols).getFormulas();

    const cells: Record<string, BridgeSheet["cells"][string]> = {};
    const cellData = (snap.cellData ?? {}) as Record<
      number,
      Record<number, ICellData>
    >;
    for (const [rStr, rowCells] of Object.entries(cellData)) {
      for (const [cStr, cd] of Object.entries(rowCells)) {
        const r = Number(rStr);
        const c = Number(cStr);
        if (!Number.isFinite(r) || !Number.isFinite(c)) continue;
        if (r >= rows || c >= cols) continue;

        const out: BridgeSheet["cells"][string] = {};
        const formula = formulas[r]?.[c];
        if (typeof formula === "string" && formula.startsWith("=") && formula.length > 1) {
          out.f = formula.slice(1);
          const v = values[r]?.[c];
          if (v !== null && v !== undefined) out.v = v;
        } else {
          const v = values[r]?.[c];
          if (v !== null && v !== undefined && v !== "") out.v = v;
        }
        // Format de nombre depuis le style référencé
        const sRef = cd.s;
        if (typeof sRef === "string") {
          const st = styles[sRef];
          const pattern = st?.n?.pattern;
          if (pattern) out.z = pattern;
        } else if (sRef && typeof sRef === "object" && sRef.n?.pattern) {
          out.z = sRef.n.pattern;
        }
        if (out.v !== undefined || out.f !== undefined || out.z !== undefined) {
          cells[`${r}:${c}`] = out;
        }
      }
    }

    const colWidths: Record<number, number> = {};
    const columnData = (snap.columnData ?? {}) as Record<number, { w?: number }>;
    for (const [cStr, col] of Object.entries(columnData)) {
      if (col?.w && col.w > 0) colWidths[Number(cStr)] = col.w;
    }
    const rowHeights: Record<number, number> = {};
    const rowData = (snap.rowData ?? {}) as Record<number, { h?: number }>;
    for (const [rStr, row] of Object.entries(rowData)) {
      if (row?.h && row.h > 0) rowHeights[Number(rStr)] = row.h;
    }

    sheets.push({
      name: fws.getSheetName() || `Feuille ${sheets.length + 1}`,
      hidden: !!snap.hidden,
      cells,
      merges: (snap.mergeData ?? []).map((m) => ({
        sr: m.startRow,
        sc: m.startColumn,
        er: m.endRow,
        ec: m.endColumn,
      })),
      colWidths,
      rowHeights,
    });
  }

  return { sheets: sheets.length > 0 ? sheets : blankWorkbook().sheets };
}

export function UniverSheetEditor({
  documentId,
  documentName,
  hasFile,
  fallbackLegacy,
}: UniverSheetEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bundleRef = useRef<UniverBundle | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [fileState, setFileState] = useState<
    "server" | "local" | "nouveau" | "repli"
  >("nouveau");
  const [name, setName] = useState(documentName);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // ── Démarrage : octets (IndexedDB → API) → bridge → Univer ──
  useEffect(() => {
    let disposed = false;
    let univerInstance: { dispose: () => void } | null = null;

    async function boot() {
      // 1) Dernier fichier connu : cache local d'abord (hors-ligne OK)
      let bytes: Uint8Array | null = null;
      try {
        const cached = await blobGet(BLOB_KEY(documentId));
        if (cached && cached.size > 0) {
          bytes = new Uint8Array(await cached.arrayBuffer());
          setFileState("local");
        }
      } catch {
        bytes = null;
      }
      // 2) Puis le fichier serveur (et rechauffe le cache local)
      if ((!bytes || bytes.length === 0) && hasFile) {
        try {
          const res = await fetch(`/api/back-office/files/${documentId}`);
          if (res.ok) {
            bytes = new Uint8Array(await res.arrayBuffer());
            if (bytes.length > 0) {
              setFileState("server");
              await blobPut(BLOB_KEY(documentId), new Blob([bytes as BlobPart], { type: XLSX_MIME })).catch(
                () => {}
              );
            }
          }
        } catch {
          // hors-ligne sans cache → repli
        }
      }

      if (disposed) return;

      // 3) Bridge : fichier réel, repli grille héritée, ou classeur vierge
      let bridge: BridgeWorkbook;
      if (bytes && bytes.length > 0) {
        try {
          bridge = xlsxToBridge(bytes);
        } catch {
          bridge = blankWorkbook();
        }
      } else if (fallbackLegacy) {
        bridge = legacyGridToBridge(name, fallbackLegacy);
        setFileState("repli");
      } else {
        bridge = blankWorkbook();
        setFileState("nouveau");
      }

      // 4) Univer (import dynamique — hors du bundle initial)
      const [{ createUniver, LocaleType }, presetModule, localeModule] = await Promise.all([
        import("@univerjs/presets"),
        import("@univerjs/preset-sheets-core"),
        import("@univerjs/preset-sheets-core/locales/fr-FR"),
      ]);
      if (disposed) return;

      const { UniverSheetsCorePreset } = presetModule;
      const { default: frFR } = localeModule;

      const { univer, univerAPI } = createUniver({
        locale: LocaleType.FR_FR,
        locales: { [LocaleType.FR_FR]: frFR },
        presets: [
          UniverSheetsCorePreset({
            container: containerRef.current ?? undefined,
            header: true,
            footer: { sheetBar: true, statisticBar: true },
            formulaBar: true,
            toolbar: true,
            contextMenu: true,
          }),
        ],
      });
      univerInstance = univer;
      bundleRef.current = { univer, univerAPI };
      // Exposition pour le débogage / tests E2E (back-office interne uniquement)
      (window as unknown as { __boUniver?: FUniver }).__boUniver = univerAPI;

      univerAPI.createWorkbook(bridgeToUniverData(name, bridge));

      // Suivi des modifications (cellules, feuilles, mise en forme)
      univerAPI.addEvent(univerAPI.Event.CommandExecuted, (event) => {
        const id = String(event.id ?? "");
        if (
          id.startsWith("sheet.mutation") ||
          id.startsWith("sheets.mutation") ||
          id.includes("numfmt") ||
          id.includes("insert-row") ||
          id.includes("insert-col") ||
          id.includes("remove-row") ||
          id.includes("remove-col") ||
          id.includes("move-rows") ||
          id.includes("move-cols") ||
          id.includes("merge") ||
          id.includes("unmerge") ||
          id.includes("rename") ||
          id.includes("set-style")
        ) {
          setDirty(true);
        }
      });

      setStatus("ready");
    }

    boot().catch((e) => {
      console.error("Univer boot error:", e);
      setStatus("error");
    });

    return () => {
      disposed = true;
      bundleRef.current = null;
      try {
        univerInstance?.dispose();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // ── Sauvegarde : vrai .xlsx → IndexedDB + mutation de synchro ──
  async function save() {
    const bundle = bundleRef.current;
    if (!bundle) return;
    setSaving(true);
    try {
      const bridge = extractBridge(bundle.univerAPI);
      const bytes = new Uint8Array(bridgeToXlsx(bridge));

      // Cache local (réouverture hors-ligne) — même clé que l'import
      await blobPut(BLOB_KEY(documentId), new Blob([bytes], { type: XLSX_MIME }));

      // Métadonnées légères pour la liste (le contenu réel = le fichier)
      const meta = {
        engine: "xlsx",
        sheets: bridge.sheets.map((s) => ({
          name: s.name,
          cells: Object.keys(s.cells).length,
        })),
        savedAt: new Date().toISOString(),
      };

      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "document.saveContent",
        createdAt: new Date().toISOString(),
        payload: {
          id: documentId,
          name: name.trim() || documentName,
          content: JSON.stringify(meta),
          blobKey: BLOB_KEY(documentId),
          size: bytes.length,
          mimeType: XLSX_MIME,
        },
      });

      setDirty(false);
      if (fileState === "nouveau" || fileState === "repli") setFileState("local");
      const heure = new Date().toLocaleTimeString("fr-FR");
      if (navigator.onLine) {
        toast.success(`Fichier Excel enregistré à ${heure}`, {
          description: `${name} — .xlsx (${(bytes.length / 1024).toFixed(1)} Ko)`,
        });
      } else {
        toast.success(`Enregistré localement à ${heure}`, {
          description:
            "Hors-ligne — le fichier .xlsx sera synchronisé vers la base distante au retour de la connexion.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Échec de l'enregistrement du fichier Excel.");
    } finally {
      setSaving(false);
    }
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (status === "ready") void save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, name]);

  // ── Téléchargement du vrai fichier .xlsx ──
  function download() {
    const bundle = bundleRef.current;
    if (!bundle) return;
    try {
      const bridge = extractBridge(bundle.univerAPI);
      const bytes = bridgeToXlsx(bridge);
      const safe = (name || "classeur").replace(/[\/\\:*\?"<>|]/g, "_");
      const filename = /\.xlsx?$/i.test(safe) ? safe : `${safe}.xlsx`;
      const blob = new Blob([bytes], { type: XLSX_MIME });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Fichier Excel téléchargé", {
        description: `${filename} — s'ouvre dans Microsoft Excel`,
      });
    } catch {
      toast.error("Échec de la génération du fichier .xlsx.");
    }
  }

  // ── Export CSV (feuille active) ──
  function exportCsv() {
    const bundle = bundleRef.current;
    if (!bundle) return;
    try {
      const bridge = extractBridge(bundle.univerAPI);
      const sheet = bridge.sheets.find((s) => !s.hidden) ?? bridge.sheets[0];
      if (!sheet) return;
      let maxR = 0;
      let maxC = 0;
      for (const k of Object.keys(sheet.cells)) {
        const [r, c] = k.split(":").map(Number);
        if (r > maxR) maxR = r;
        if (c > maxC) maxC = c;
      }
      const lines: string[] = [];
      const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
      for (let r = 0; r <= maxR; r++) {
        const row: string[] = [];
        for (let c = 0; c <= maxC; c++) {
          const cell = sheet.cells[`${r}:${c}`];
          row.push(cell?.v !== undefined ? esc(String(cell.v)) : "");
        }
        lines.push(row.join(";"));
      }
      const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(name || "classeur").replace(/[\/\\:*\?"<>|]/g, "_")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Échec de l'export CSV.");
    }
  }

  // ── Impression / PDF ──
  function printPdf() {
    const bundle = bundleRef.current;
    if (!bundle) return;
    const win = window.open("", "_blank", "width=1000,height=700");
    if (!win) {
      toast.error("Autorisez les fenêtres pop-up pour générer le PDF.");
      return;
    }
    const bridge = extractBridge(bundle.univerAPI);
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const tables = bridge.sheets
      .filter((s) => !s.hidden)
      .map(
        (s) =>
          `<h2>${esc(s.name)}</h2>${bridgeToHtmlTable(s).replace(
            /<td>([\d.,\s-]+)<\/td>/g,
            '<td class="num">$1</td>'
          )}`
      )
      .join('<div style="page-break-after:always"></div>');

    win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${esc(name)}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#0C193D; padding:28px; }
  h1 { font-size:20px; margin:0 0 4px; }
  h2 { font-size:14px; margin:22px 0 8px; }
  .meta { color:#4A4E69; font-size:11px; margin-bottom:14px; }
  table.sheet { border-collapse:collapse; width:100%; }
  .sheet td { border:1px solid #c9cfdc; padding:5px 9px; font-size:12px; text-align:left; }
  .sheet td.num { text-align:right; font-variant-numeric: tabular-nums; }
  .sheet tr:nth-child(even) td { background:#F4F6FB; }
  .sheet tr:first-child td { background:#0C193D; color:#fff; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; }
  footer { margin-top:22px; color:#4A4E69; font-size:10px; }
</style></head><body>
<h1>${esc(name)}</h1>
<div class="meta">Cabinet SERMA — document de travail · généré le ${new Date().toLocaleDateString("fr-FR")}</div>
${tables}
<footer>Cabinet SERMA SARL · Parakou, Bénin — confidentiel</footer>
<script>window.onload = () => window.print();</script>
</body></html>`);
    win.document.close();
  }

  const fileLabels: Record<typeof fileState, string> = {
    server: "Fichier Excel du serveur",
    local: "Dernier enregistrement local",
    nouveau: "Nouveau classeur — pas encore enregistré",
    repli: "Contenu migré — pensez à enregistrer",
  };

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
          {dirty && (
            <span className="text-[11px] font-bold text-orange-contrast">modifié</span>
          )}
        </div>

        <div className="w-px h-6 bg-marine-profond/10 mx-1" aria-hidden />

        <Button
          onClick={save}
          disabled={saving || status !== "ready"}
          size="sm"
          className="h-9 bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden />
          ) : (
            <Save className="w-4 h-4 mr-1.5" aria-hidden />
          )}
          {saving ? "Enregistrement…" : "Enregistrer (.xlsx)"}
        </Button>
        <Button
          onClick={download}
          disabled={status !== "ready"}
          variant="outline"
          size="sm"
          className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]"
        >
          <Download className="w-4 h-4 mr-1.5" aria-hidden />
          Fichier Excel
        </Button>
        <Button
          onClick={exportCsv}
          disabled={status !== "ready"}
          variant="outline"
          size="sm"
          className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]"
        >
          <FileDown className="w-4 h-4 mr-1.5" aria-hidden />
          CSV
        </Button>
        <Button
          onClick={printPdf}
          disabled={status !== "ready"}
          variant="outline"
          size="sm"
          className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]"
        >
          <Printer className="w-4 h-4 mr-1.5" aria-hidden />
          PDF
        </Button>

        <div className="ml-auto flex items-center gap-2 text-[11px] font-semibold">
          {!online && (
            <span className="flex items-center gap-1 text-orange-contrast">
              <CloudOff className="w-3.5 h-3.5" aria-hidden /> Hors-ligne
            </span>
          )}
          {status === "ready" && !dirty && (
            <span className="flex items-center gap-1 text-vert-tech">
              <CircleCheck className="w-3.5 h-3.5" aria-hidden /> {fileLabels[fileState]}
            </span>
          )}
          {status === "ready" && dirty && (
            <span className="flex items-center gap-1 text-orange-contrast">
              <TriangleAlert className="w-3.5 h-3.5" aria-hidden /> Modifications non enregistrées
            </span>
          )}
        </div>
      </div>

      {/* Grille Univer — pleine interface Excel.
          IMPORTANT : le conteneur est TOUJOURS monté et visible (jamais
          display:none) — le moteur de rendu Univer doit s'initialiser avec
          des dimensions réelles, sinon toutes les commandes d'édition
          échouent silencieusement. Les états de chargement/erreur sont des
          calques superposés. */}
      <div className="relative rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden">
        {status === "loading" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-gris-texte bg-white">
            <Loader2 className="w-8 h-8 animate-spin text-orange-logo" aria-hidden />
            <p className="text-sm font-semibold">Chargement du classeur Excel…</p>
            <p className="text-xs">Moteur de calcul Univer (400+ fonctions)</p>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-gris-texte bg-white">
            <TriangleAlert className="w-8 h-8 text-orange-contrast" aria-hidden />
            <p className="text-sm font-semibold text-marine-profond">
              Impossible de démarrer l&apos;éditeur Excel.
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        )}
        <div
          ref={containerRef}
          className="h-[640px] w-full"
          aria-label="Grille de calcul Excel"
        />
      </div>

      <p className="text-[11px] text-gris-texte leading-relaxed">
        Vrai fichier Excel (.xlsx) — s&apos;ouvre directement dans Microsoft Excel,
        Google Sheets et LibreOffice. Formules, formats, feuilles multiples et fusions
        sont conservés. Raccourci <strong>Ctrl+S</strong> pour enregistrer.
      </p>
    </div>
  );
}
