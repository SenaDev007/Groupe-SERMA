"use client";

/**
 * IMPORT D'UN DOSSIER COMPLET (AVEC SES SOUS-DOSSIERS) — Cabinet SERMA.
 *
 * Comme un copier-coller depuis l'explorateur Windows vers le dossier
 * client : l'utilisateur choisit un dossier entier de son disque, toute
 * la hiérarchie est recréée (dossiers et sous-dossiers, sans limite de
 * profondeur) et les fichiers Word / Excel qu'il contient sont importés
 * à leur place.
 *
 * Techniques :
 *  - <input type="file" webkitdirectory> : le navigateur fournit tous les
 *    fichiers avec leur chemin relatif (webkitRelativePath) — la structure
 *    du dossier est reconstruite à partir de ces chemins ;
 *  - les dossiers sont créés par des mutations `folder.create` (parents
 *    d'abord), puis chaque fichier par une mutation `document.import` avec
 *    le blob conservé en local (IndexedDB) → l'import fonctionne même
 *    hors-ligne, la synchro téléverse tout dès que la connexion revient ;
 *  - hors-ligne comme en ligne, l'arborescence apparaît immédiatement.
 *
 * Filtres : Word (.docx .doc), Excel (.xlsx .xls .xlsm .csv) — les autres
 * fichiers du dossier sont ignorés (comptés dans le récapitulatif).
 * Chaque fichier ≤ 3 Mo (plafond de téléversement en ligne).
 */

import { useRef, useState } from "react";
import { toast } from "sonner";
import { boEngine } from "@/lib/offline/engine";
import { blobPut } from "@/lib/offline/idb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FolderInput,
  FolderTree,
  Loader2,
  Upload,
} from "lucide-react";

// Attributs non typés dans React : le sélecteur de dossier du navigateur.
type DirectoryInputProps = React.InputHTMLAttributes<HTMLInputElement> &
  Record<string, string>;
const directoryProps: DirectoryInputProps = {
  webkitdirectory: "",
  directory: "",
};

/** Extensions acceptées (Word et Excel, + CSV tableur). */
const ALLOWED_EXTENSIONS = new Set(["docx", "doc", "xlsx", "xls", "xlsm", "csv"]);

/** Types MIME précis (les navigateurs donnent souvent une valeur vide). */
const MIME_BY_EXT: Record<string, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xlsm: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

/** Dossiers/fichiers système à ignorer (Windows/macOS). */
const SYSTEM_NAMES = new Set(["thumbs.db", "desktop.ini", ".ds_store"]);
const HIDDEN_DIR = /^(\.|__MACOSX$|\$RECYCLE\.BIN$|System Volume Information$)/i;

const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3 Mo par fichier (synchro en ligne)
const MAX_FILES = 400; // garde-fou sur les dossiers très volumineux

interface KeptFile {
  file: File;
  /** Chemin relatif complet (ex. « Dossier client/2025/balance.xlsx »). */
  path: string;
  /** Chemin du dossier CONTENANT le fichier (ex. « Dossier client/2025 »). */
  dirPath: string;
  name: string;
  ext: string;
}

interface ScanSummary {
  rootName: string;
  kept: KeptFile[];
  /** Chemins uniques des dossiers à créer, parents d'abord. */
  folderPaths: string[];
  skipped: { path: string; reason: string }[];
}

function fileRelativePath(f: File): string {
  const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath;
  return rel && rel.length > 0 ? rel : f.name;
}

/** Analyse la sélection et reconstruit la hiérarchie du dossier choisi. */
function scanSelection(files: File[]): ScanSummary | null {
  const kept: KeptFile[] = [];
  const skipped: { path: string; reason: string }[] = [];
  const folderPaths = new Set<string>();
  let rootName = "";

  for (const f of files) {
    const path = fileRelativePath(f);
    const segs = path.split("/").filter((s) => s.length > 0);
    const name = segs[segs.length - 1];
    const dirSegs = segs.slice(0, -1);

    // Dossiers cachés / système dans le chemin → ignorés
    if (dirSegs.some((s) => HIDDEN_DIR.test(s))) {
      skipped.push({ path, reason: "dossier masqué / système" });
      continue;
    }
    if (SYSTEM_NAMES.has(name.toLowerCase()) || name.startsWith("~$") || name.startsWith(".")) {
      skipped.push({ path, reason: "fichier masqué / système" });
      continue;
    }

    const ext = (name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      skipped.push({ path, reason: "ni Word ni Excel" });
      continue;
    }
    if (f.size > MAX_FILE_BYTES) {
      skipped.push({ path, reason: "plus de 3 Mo" });
      continue;
    }
    if (f.size === 0) {
      skipped.push({ path, reason: "fichier vide" });
      continue;
    }

    if (dirSegs.length > 0) {
      folderPaths.add(dirSegs.join("/"));
      if (rootName === "") rootName = dirSegs[0];
    }
    kept.push({ file: f, path, dirPath: dirSegs.join("/"), name, ext });
  }

  // Parents toujours avant enfants (tri par profondeur puis alphabétique)
  const sortedFolderPaths = [...folderPaths].sort((a, b) => {
    const da = a.split("/").length;
    const db = b.split("/").length;
    return da !== db ? da - db : a.localeCompare(b, "fr", { sensitivity: "base" });
  });

  return { rootName, kept, folderPaths: sortedFolderPaths, skipped };
}

export function ImportFolderDialog({
  open,
  onOpenChange,
  clientId,
  targetFolderId,
  targetFolderName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  /** Dossier du cockpit dans lequel le dossier choisi sera importé. */
  targetFolderId: string;
  targetFolderName: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [done, setDone] = useState<{ folders: number; files: number } | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setDone(null);
    setError(null);
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) {
      setSummary(null);
      return;
    }
    const scan = scanSelection(files);
    if (!scan || scan.kept.length === 0) {
      setSummary(scan);
      setError(
        "Aucun fichier Word ou Excel trouvé dans ce dossier (xlsx, xls, xlsm, csv, docx, doc)."
      );
      return;
    }
    if (scan.kept.length > MAX_FILES) {
      setSummary(null);
      setError(
        `Trop de fichiers (${scan.kept.length}) — ${MAX_FILES} maximum par import.`
      );
      return;
    }
    setSummary(scan);
  }

  async function handleSubmit() {
    const scan = summary;
    if (!scan || scan.kept.length === 0) {
      setError("Sélectionnez d'abord un dossier à importer.");
      return;
    }
    setPending(true);
    setError(null);
    setDone(null);
    setProgress({ current: 0, total: scan.kept.length });
    try {
      // 1) Dossiers (parents d'abord) — mutations folder.create locales
      //    immédiates + rejeu serveur dans l'ordre (createdAt croissant).
      const pathToId = new Map<string, string>();
      for (const dirPath of scan.folderPaths) {
        const segs = dirPath.split("/");
        const name = segs[segs.length - 1];
        const parentPath = segs.slice(0, -1).join("/");
        const parentId = parentPath ? (pathToId.get(parentPath) as string) : targetFolderId;
        const folderId = boEngine.newId("folder");
        await boEngine.mutate({
          id: boEngine.newId("mut"),
          type: "folder.create",
          createdAt: new Date().toISOString(),
          payload: { id: folderId, clientId, parentId, name },
        });
        pathToId.set(dirPath, folderId);
      }

      // 2) Fichiers — blobs en local (IndexedDB) + mutation document.import
      let n = 0;
      for (const k of scan.kept) {
        const blobKey = boEngine.newId("blob");
        await blobPut(blobKey, k.file);
        await boEngine.mutate({
          id: boEngine.newId("mut"),
          type: "document.import",
          createdAt: new Date().toISOString(),
          payload: {
            id: boEngine.newId("doc"),
            name: k.name,
            mimeType: MIME_BY_EXT[k.ext] || "application/octet-stream",
            size: k.file.size,
            // Fichier à la racine du dossier choisi → dossier choisi ;
            // sinon → sous-dossier correspondant à son emplacement d'origine.
            folderId: k.dirPath
              ? (pathToId.get(k.dirPath) as string)
              : targetFolderId,
            blobKey,
          },
        });
        n++;
        setProgress({ current: n, total: scan.kept.length });
      }

      setDone({ folders: scan.folderPaths.length, files: scan.kept.length });
      setSummary(null);
      if (inputRef.current) inputRef.current.value = "";
      toast.success("Dossier importé", {
        description: `${scan.folderPaths.length} dossier(s) et ${scan.kept.length} fichier(s) ajoutés.`,
      });
    } catch {
      setError("Import impossible sur cet appareil (stockage local indisponible ?).");
    } finally {
      setProgress(null);
      setPending(false);
    }
  }

  const subCount = summary ? summary.folderPaths.length - 1 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl font-black text-marine-profond flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-orange-contrast" aria-hidden />
            Importer un dossier complet
          </DialogTitle>
          <DialogDescription>
            Choisissez un dossier entier de votre ordinateur : toute sa
            hiérarchie est recréée dans «&nbsp;{targetFolderName}&nbsp;» et les
            fichiers Word / Excel qu&apos;il contient sont importés à leur
            place — exactement comme un copier-coller depuis l&apos;explorateur
            Windows.
          </DialogDescription>
        </DialogHeader>

        <form
          action={() => {
            void handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="i-dir">Dossier à importer (Word et Excel, 3 Mo par fichier)</Label>
            <div className="rounded-xl border-2 border-dashed border-marine-profond/15 p-5 text-center hover:border-orange-logo/50 transition-colors">
              <input
                {...directoryProps}
                ref={inputRef}
                id="i-dir"
                name="dir"
                type="file"
                multiple
                className="mx-auto block w-full text-sm text-gris-texte file:mr-3 file:rounded-full file:border-0 file:bg-marine-profond file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-marine-moyen"
                onChange={handleSelect}
              />
              <p className="mt-3 text-xs text-gris-texte/80">
                Le sélecteur parcourt le dossier et tous ses sous-dossiers.
              </p>
            </div>
          </div>

          {summary && summary.kept.length > 0 && (
            <div className="rounded-xl border border-marine-profond/10 bg-gris-bleute/40 px-4 py-3 space-y-2">
              <p className="text-sm font-bold text-marine-profond flex items-center gap-1.5">
                <FolderInput className="w-4 h-4 text-orange-contrast" aria-hidden />
                {summary.rootName || "Sélection"}
                <span className="font-normal text-gris-texte">
                  — {summary.folderPaths.length} dossier(s), {summary.kept.length} fichier(s)
                </span>
              </p>
              <ul className="max-h-36 overflow-y-auto bo-scrollbar-light text-xs text-gris-texte space-y-0.5">
                {summary.kept.slice(0, 14).map((k) => (
                  <li key={k.path} className="truncate font-mono">
                    {k.path}
                  </li>
                ))}
                {summary.kept.length > 14 && (
                  <li className="text-gris-texte/70">
                    … et {summary.kept.length - 14} autre(s) fichier(s)
                  </li>
                )}
              </ul>
              {subCount > 0 && (
                <p className="text-[11px] text-gris-texte/80">
                  {subCount} sous-dossier(s) recréé(s) dans «&nbsp;{summary.rootName}&nbsp;».
                </p>
              )}
              {summary.skipped.length > 0 && (
                <p className="text-[11px] text-orange-contrast">
                  {summary.skipped.length} fichier(s) ignoré(s)&nbsp;:{" "}
                  {summary.skipped
                    .slice(0, 4)
                    .map((s) => s.path.split("/").pop())
                    .join(", ")}
                  {summary.skipped.length > 4 ? "…" : ""}{" "}
                  (ni Word ni Excel, ou trop volumineux)
                </p>
              )}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          {progress && (
            <div role="status" className="flex items-center gap-2 text-sm text-marine-profond">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Import en cours — {progress.current}/{progress.total} fichier(s)…
            </div>
          )}

          {done && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg border border-vert-tech/30 bg-vert-tech/[0.08] px-3.5 py-2.5 text-sm text-[#256b4d]"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>
                Dossier importé : {done.folders} dossier(s) et {done.files} fichier(s)
                ajoutés à «&nbsp;{targetFolderName}&nbsp;». L&apos;arborescence
                apparaît immédiatement&nbsp;;
                <ExternalLink className="inline w-3.5 h-3.5 mx-1 -mt-0.5" aria-hidden />
                le téléversement vers le serveur suit automatiquement.
              </span>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button
              type="submit"
              disabled={pending || !summary || summary.kept.length === 0}
              className="bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
            >
              {pending ? "Import en cours…" : "Importer le dossier"}
              {!pending && <Upload className="w-4 h-4 ml-1.5" aria-hidden />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
