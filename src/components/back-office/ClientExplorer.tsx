"use client";

/**
 * EXPLORATEUR DE FICHIERS DU DOSSIER CLIENT — Cabinet SERMA.
 *
 * Arborescence LIBRE, exactement comme l'explorateur de fichiers Windows :
 *  - création de dossiers au nom libre, sans aucune contrainte ;
 *  - dossiers imbriqués les uns dans les autres, sans limite de profondeur ;
 *  - renommage et suppression (cascade, comme Windows) ;
 *  - fichiers Excel / Word / PDF rangés dans les dossiers ;
 *  - déplacement par glisser-déposer (cartes + arborescence) ou « Déplacer » ;
 *  - fil d'Ariane cliquable, arborescence latérale repliable.
 *
 * Offline-first : données depuis le store local (IndexedDB) dès que prêt,
 * mutations via le moteur de synchronisation (application locale immédiate
 * + rejeu PostgreSQL dès que la connexion revient).
 */

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBoData } from "@/hooks/useBoData";
import { boEngine } from "@/lib/offline/engine";
import { blobPut } from "@/lib/offline/idb";
import { folderDescendantIds, isDescendantFolder } from "@/lib/offline/mutations";
import type { BoMutation, FolderRecord } from "@/lib/offline/types";
import { childFoldersOf, folderPathSegments } from "@/lib/back-office/derive";
import {
  NEW_FOLDER_DEFAULT_NAME,
  invalidFolderNameChars,
  formatDateFr,
  formatBytes,
} from "@/lib/back-office/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderPlus,
  Folder,
  FolderOpen,
  FolderInput,
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  Upload,
  Pencil,
  Trash2,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  FilePlus2,
  HardDrive,
  List,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Types & utilitaires
// ─────────────────────────────────────────────────────────────

export interface ExplorerDocument {
  id: string;
  name: string;
  kind: string;
  source: string;
  size: number | null;
  folderId: string | null;
  updatedAt: string;
  version: number;
  pendingUpload?: boolean;
}

const KIND_META: Record<string, { label: string; icon: React.ElementType; tone: string }> = {
  SHEET: { label: "Tableur", icon: FileSpreadsheet, tone: "bg-vert-tech/10 text-[#256b4d]" },
  DOC: { label: "Document", icon: FileText, tone: "bg-orange-logo/10 text-orange-contrast" },
  FILE: { label: "Fichier", icon: FileIcon, tone: "bg-marine-profond/[0.06] text-marine-profond/70" },
};

interface DragItem {
  kind: "folder" | "document";
  id: string;
}

function mutate(type: string, payload: Record<string, unknown>) {
  void boEngine.mutate({
    id: boEngine.newId("mut"),
    type,
    createdAt: new Date().toISOString(),
    payload,
  } as unknown as BoMutation);
}

/** Nom unique dans un dossier : « Nouveau dossier », « Nouveau dossier (2) »… (comme Windows). */
function uniqueName(taken: Set<string>, desired: string): string {
  const has = (n: string) => taken.has(n.toLowerCase());
  if (!has(desired)) return desired;
  let i = 2;
  while (has(`${desired} (${i})`)) i++;
  return `${desired} (${i})`;
}

// ─────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Vue Liste / Grille — persistée dans localStorage (store externe)
// ─────────────────────────────────────────────────────────────

const VIEW_KEY = "bo-explorer-view";
const VIEW_EVENT = "bo-explorer-view-change";
type ExplorerView = "list" | "grid";

function subscribeView(callback: () => void) {
  window.addEventListener(VIEW_EVENT, callback);
  return () => window.removeEventListener(VIEW_EVENT, callback);
}
function getSnapshotView(): ExplorerView {
  return window.localStorage.getItem(VIEW_KEY) === "grid" ? "grid" : "list";
}
function getServerSnapshotView(): ExplorerView {
  return "list";
}
function setExplorerView(mode: ExplorerView) {
  window.localStorage.setItem(VIEW_KEY, mode);
  window.dispatchEvent(new Event(VIEW_EVENT));
}

// ─────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────

export function ClientExplorer({
  clientId,
  clientName,
  clientType,
  initialFolders,
  initialDocuments,
  workItemOptions,
}: {
  clientId: string;
  clientName: string;
  clientType: string;
  initialFolders: FolderRecord[];
  initialDocuments: ExplorerDocument[];
  workItemOptions: { id: string; title: string }[];
}) {
  const router = useRouter();
  const bo = useBoData();

  // ── Données (store local dès que prêt, sinon props SSR) ──
  const folders = useMemo<FolderRecord[]>(
    () =>
      bo.ready && bo.snapshot
        ? bo.snapshot.folders.filter((f) => f.clientId === clientId)
        : initialFolders,
    [bo.ready, bo.snapshot, clientId, initialFolders]
  );

  const documents = useMemo<ExplorerDocument[]>(
    () =>
      bo.ready && bo.snapshot
        ? bo.snapshot.documents
            .filter((d) => d.folderId && folders.some((f) => f.id === d.folderId))
            .map((d) => ({
              id: d.id,
              name: d.name,
              kind: d.kind,
              source: d.source,
              size: d.size,
              folderId: d.folderId,
              updatedAt: d.updatedAt,
              version: d.version,
              pendingUpload: d.pendingUpload,
            }))
        : initialDocuments,
    [bo.ready, bo.snapshot, folders, initialDocuments]
  );

  // Options de missions du client (store local dès que prêt)
  const missionOptions = useMemo(() => {
    if (bo.ready && bo.snapshot) {
      return bo.snapshot.workItems
        .filter((w) => w.clientId === clientId)
        .map((w) => ({ id: w.id, title: w.title }));
    }
    return workItemOptions;
  }, [bo.ready, bo.snapshot, clientId, workItemOptions]);

  const rootId = useMemo(() => {
    const root = folders.find((f) => f.parentId === null);
    return root?.id ?? `root_${clientId}`;
  }, [folders, clientId]);

  // ── Navigation ──
  const [currentId, setCurrentId] = useState<string | null>(null);
  const currentFolderId = currentId ?? rootId;
  const [expanded, setExpanded] = useState<Set<string>>(new Set([rootId]));
  const [treeOpen, setTreeOpen] = useState(false); // panneau mobile
  // Vue « Liste » (une ligne par élément, libellé complet) ou « Grille » (cartes
  // compactes) — comme l'explorateur Windows. Liste par défaut : libellés
  // toujours sur une seule ligne, bien visibles, jamais repliés sur deux lignes.
  // Persistée dans localStorage via un store externe (useSyncExternalStore).
  const viewMode = useSyncExternalStore(subscribeView, getSnapshotView, getServerSnapshotView);

  const currentFolder = folders.find((f) => f.id === currentFolderId);
  const breadcrumb = useMemo(
    () => folderPathSegments(folders, currentFolderId),
    [folders, currentFolderId]
  );

  function navigateTo(folderId: string) {
    setCurrentId(folderId === rootId ? null : folderId);
    // Expansion automatique du chemin (comme l'explorateur Windows)
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const seg of folderPathSegments(folders, folderId)) next.add(seg.id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Contenus du dossier courant ──
  const subfolders = useMemo(
    () => childFoldersOf(folders, clientId, currentFolderId),
    [folders, clientId, currentFolderId]
  );
  const folderDocs = useMemo(
    () =>
      documents
        .filter((d) => d.folderId === currentFolderId)
        .sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [documents, currentFolderId]
  );
  const totalItems = subfolders.length + folderDocs.length;

  // ── Glisser-déposer (dossiers et fichiers) ──
  // Ref synchronne (lue au moment du dépôt) + état (indices visuels).
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const dragItemRef = useRef<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  function updateDragItem(item: DragItem | null) {
    dragItemRef.current = item;
    setDragItem(item);
  }

  /** Cible de dépôt valide pour un item donné (pure — utilisée au rendu avec l'état, dans les gestionnaires avec le ref). */
  function canDrop(targetId: string, item: DragItem | null): boolean {
    if (!item) return false;
    if (item.kind === "document") return true;
    if (item.id === targetId) return false;
    return !isDescendantFolder(folders, targetId, item.id);
  }

  function handleDrop(targetId: string) {
    const item = dragItemRef.current;
    if (!item) {
      setDropTarget(null);
      return;
    }
    if (!canDrop(targetId, item)) {
      toast.error("Impossible : un dossier ne peut pas être déplacé dans lui-même.");
      updateDragItem(null);
      setDropTarget(null);
      return;
    }
    if (item.id === targetId && item.kind === "folder") {
      updateDragItem(null);
      setDropTarget(null);
      return;
    }
    if (item.kind === "folder") {
      mutate("folder.move", { id: item.id, parentId: targetId });
      toast.success("Dossier déplacé.");
    } else {
      mutate("document.move", { id: item.id, folderId: targetId });
      toast.success("Fichier déplacé.");
    }
    updateDragItem(null);
    setDropTarget(null);
  }

  /** Version « rendu » (base l'état React — autorisé pendant le rendu). */
  const dropAllowedFor = (targetId: string): boolean => canDrop(targetId, dragItem);

  // ── Dialogues ──
  const [nameDialog, setNameDialog] = useState<
    | { mode: "create-folder" }
    | { mode: "rename-folder"; folder: FolderRecord }
    | { mode: "rename-document"; doc: ExplorerDocument }
    | null
  >(null);
  const [moveDialog, setMoveDialog] = useState<
    { kind: "folder" | "document"; id: string; name: string } | null
  >(null);
  const [deleteDialog, setDeleteDialog] = useState<
    | { kind: "folder"; id: string; name: string; subCount: number; docCount: number }
    | { kind: "document"; id: string; name: string }
    | null
  >(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);

  function openDeleteFolder(folder: FolderRecord) {
    const dead = folderDescendantIds(folders, folder.id);
    const docCount = documents.filter(
      (d) => d.folderId && dead.has(d.folderId)
    ).length;
    setDeleteDialog({
      kind: "folder",
      id: folder.id,
      name: folder.name,
      subCount: dead.size - 1,
      docCount,
    });
  }

  /** Après une suppression de dossier : si le dossier courant a disparu, retour à la racine. */
  function afterFolderDeleted(folderId: string) {
    const dead = folderDescendantIds(folders, folderId);
    if (dead.has(currentFolderId)) setCurrentId(null);
  }

  return (
    <section
      aria-label="Explorateur de fichiers du dossier client"
      className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden"
    >
      {/* ── Fil d'Ariane (comme l'explorateur Windows) ── */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-marine-profond/[0.07] bg-gris-bleute/60 overflow-x-auto bo-scrollbar-light">
        <HardDrive className="w-4 h-4 text-marine-profond/50 shrink-0" aria-hidden />
        <button
          type="button"
          onClick={() => navigateTo(rootId)}
          className={cn(
            "text-[13px] font-semibold truncate max-w-[220px] rounded-md px-1.5 py-0.5 -ml-1 transition-colors",
            currentFolderId === rootId
              ? "text-marine-profond bg-white shadow-[0_1px_4px_rgba(12,25,61,0.08)]"
              : "text-gris-texte hover:text-marine-profond"
          )}
        >
          {clientName}
        </button>
        {breadcrumb
          .filter((s) => s.id !== rootId)
          .map((seg) => (
            <span key={seg.id} className="flex items-center gap-1.5 shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-gris-texte/40" aria-hidden />
              <button
                type="button"
                onClick={() => navigateTo(seg.id)}
                className={cn(
                  "text-[13px] truncate max-w-[180px] rounded-md px-1.5 py-0.5 transition-colors",
                  seg.id === currentFolderId
                    ? "font-semibold text-marine-profond bg-white shadow-[0_1px_4px_rgba(12,25,61,0.08)]"
                    : "text-gris-texte hover:text-marine-profond"
                )}
              >
                {seg.name}
              </button>
            </span>
          ))}
      </div>

      {/* ── Barre d'outils ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-marine-profond/[0.07]">
        <Button
          onClick={() => setNameDialog({ mode: "create-folder" })}
          className="h-9 bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
        >
          <FolderPlus className="w-4 h-4 mr-1.5" aria-hidden />
          Nouveau dossier
        </Button>
        <Button
          variant="outline"
          onClick={() => setImportDialog(true)}
          className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]"
        >
          <Upload className="w-4 h-4 mr-1.5" aria-hidden />
          Importer un fichier
        </Button>
        <Button
          variant="outline"
          onClick={() => setCreateDialog(true)}
          className="h-9 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]"
        >
          <FilePlus2 className="w-4 h-4 mr-1.5" aria-hidden />
          Tableur / Document
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-gris-texte lg:hidden"
          onClick={() => setTreeOpen((v) => !v)}
          aria-expanded={treeOpen}
        >
          <FolderOpen className="w-4 h-4 mr-1.5" aria-hidden />
          Arborescence
        </Button>
        {/* Bascule Liste / Grille (comme l'explorateur Windows) */}
        <div
          role="group"
          aria-label="Mode d'affichage des éléments"
          className="ml-auto flex items-center rounded-lg border border-marine-profond/[0.12] bg-white p-0.5"
        >
          <button
            type="button"
            aria-label="Vue Liste — libellés sur une seule ligne"
            aria-pressed={viewMode === "list"}
            title="Vue Liste — libellés sur une seule ligne"
            onClick={() => setExplorerView("list")}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
              viewMode === "list"
                ? "bg-marine-profond text-white shadow-sm"
                : "text-gris-texte hover:text-marine-profond hover:bg-gris-bleute"
            )}
          >
            <List className="w-4 h-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Vue Grille — cartes compactes"
            aria-pressed={viewMode === "grid"}
            title="Vue Grille — cartes compactes"
            onClick={() => setExplorerView("grid")}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-marine-profond text-white shadow-sm"
                : "text-gris-texte hover:text-marine-profond hover:bg-gris-bleute"
            )}
          >
            <LayoutGrid className="w-4 h-4" aria-hidden />
          </button>
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-gris-texte tabular-nums">
          {totalItems} élément{totalItems > 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Corps : arborescence + contenus ── */}
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Arborescence latérale */}
        <div
          className={cn(
            "border-b lg:border-b-0 lg:border-r border-marine-profond/[0.07] bg-gris-bleute/30 max-h-[70vh] overflow-y-auto bo-scrollbar-light",
            treeOpen ? "block" : "hidden lg:block"
          )}
          aria-label="Arborescence des dossiers"
        >
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gris-texte/70">
            Dossiers
          </p>
          <ul className="pb-3">
            <TreeNode
              id={rootId}
              name={clientName}
              isRoot
              clientType={clientType}
              depth={0}
              folders={folders}
              clientId={clientId}
              expanded={expanded}
              currentFolderId={currentFolderId}
              dropTarget={dropTarget}
              dropAllowedFor={dropAllowedFor}
              onToggle={toggleExpand}
              onNavigate={navigateTo}
              onDragItemChange={updateDragItem}
              onDragOver={setDropTarget}
              onDropTo={handleDrop}
            />
          </ul>
        </div>

        {/* Contenus du dossier courant */}
        <div className="p-4 min-h-[320px]">
          {totalItems === 0 ? (
            <div className="h-full min-h-[280px] rounded-xl border-2 border-dashed border-marine-profond/15 bg-gris-bleute/20 flex flex-col items-center justify-center text-center p-8">
              <FolderOpen className="w-10 h-10 text-marine-profond/25 mb-3" aria-hidden />
              <p className="font-semibold text-marine-profond">
                {currentFolderId === rootId
                  ? "Ce dossier client est vide"
                  : `« ${currentFolder?.name} » est vide`}
              </p>
              <p className="mt-1 text-sm text-gris-texte max-w-sm">
                Créez un dossier à l&apos;intérieur, importez un fichier Excel / Word / PDF
                ou démarrez un tableur — exactement comme dans l&apos;explorateur Windows.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => setNameDialog({ mode: "create-folder" })}
                  className="h-8 bg-orange-logo hover:bg-orange-sature text-white"
                >
                  <FolderPlus className="w-3.5 h-3.5 mr-1.5" aria-hidden /> Nouveau dossier
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setImportDialog(true)}
                  className="h-8 border-marine-profond/20"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" aria-hidden /> Importer
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3"
                  : "flex flex-col gap-1.5"
              )}
              onDragOver={(e) => {
                if (dragItem) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(currentFolderId);
              }}
            >
              {subfolders.map((f) =>
                viewMode === "grid" ? (
                  <FolderCard
                    key={f.id}
                    folder={f}
                    folders={folders}
                    documents={documents}
                    dropActive={dropTarget === f.id && canDrop(f.id, dragItem)}
                    canDrop={canDrop(f.id, dragItem)}
                    onOpen={() => navigateTo(f.id)}
                    onRename={() => setNameDialog({ mode: "rename-folder", folder: f })}
                    onMove={() => setMoveDialog({ kind: "folder", id: f.id, name: f.name })}
                    onDelete={() => openDeleteFolder(f)}
                    onDragItemChange={updateDragItem}
                    onDragOver={setDropTarget}
                    onDrop={() => handleDrop(f.id)}
                  />
                ) : (
                  <FolderRow
                    key={f.id}
                    folder={f}
                    folders={folders}
                    documents={documents}
                    dropActive={dropTarget === f.id && canDrop(f.id, dragItem)}
                    canDrop={canDrop(f.id, dragItem)}
                    onOpen={() => navigateTo(f.id)}
                    onRename={() => setNameDialog({ mode: "rename-folder", folder: f })}
                    onMove={() => setMoveDialog({ kind: "folder", id: f.id, name: f.name })}
                    onDelete={() => openDeleteFolder(f)}
                    onDragItemChange={updateDragItem}
                    onDragOver={setDropTarget}
                    onDrop={() => handleDrop(f.id)}
                  />
                )
              )}
              {folderDocs.map((d) => {
                const meta = KIND_META[d.kind] ?? KIND_META.FILE;
                return viewMode === "grid" ? (
                  <FileCard
                    key={d.id}
                    doc={d}
                    meta={meta}
                    onOpen={() => router.push(`/back-office/cabinet/documents/${d.id}`)}
                    onRename={() => setNameDialog({ mode: "rename-document", doc: d })}
                    onMove={() => setMoveDialog({ kind: "document", id: d.id, name: d.name })}
                    onDelete={() => setDeleteDialog({ kind: "document", id: d.id, name: d.name })}
                    onDragItemChange={updateDragItem}
                  />
                ) : (
                  <FileRow
                    key={d.id}
                    doc={d}
                    meta={meta}
                    onOpen={() => router.push(`/back-office/cabinet/documents/${d.id}`)}
                    onRename={() => setNameDialog({ mode: "rename-document", doc: d })}
                    onMove={() => setMoveDialog({ kind: "document", id: d.id, name: d.name })}
                    onDelete={() => setDeleteDialog({ kind: "document", id: d.id, name: d.name })}
                    onDragItemChange={updateDragItem}
                  />
                );
              })}
            </div>
          )}

          {/* Barre d'état (comme l'explorateur Windows) */}
          <div className="mt-4 pt-3 border-t border-marine-profond/[0.06] flex flex-wrap items-center gap-2 text-[11px] text-gris-texte">
            <span className="tabular-nums font-semibold">
              {totalItems} élément{totalItems > 1 ? "s" : ""}
            </span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">
              {subfolders.length} dossier{subfolders.length > 1 ? "s" : ""}
            </span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">
              {folderDocs.length} fichier{folderDocs.length > 1 ? "s" : ""}
            </span>
            {dragItem && (
              <span className="ml-auto text-orange-contrast font-semibold flex items-center gap-1">
                <FolderInput className="w-3.5 h-3.5" aria-hidden />
                Déposez sur un dossier pour déplacer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Dialogues ── */}
      <NameDialog
        state={nameDialog}
        folders={folders}
        documents={documents}
        currentFolderId={currentFolderId}
        clientId={clientId}
        onOpenChange={(open) => !open && setNameDialog(null)}
      />

      <MoveDialog
        state={moveDialog}
        folders={folders}
        rootId={rootId}
        clientName={clientName}
        onOpenChange={(open) => !open && setMoveDialog(null)}
      />

      <DeleteDialog
        state={deleteDialog}
        onAfterFolderDeleted={afterFolderDeleted}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
      />

      <CreateFileDialog
        open={createDialog}
        onOpenChange={setCreateDialog}
        folderId={currentFolderId}
        workItemOptions={missionOptions}
      />

      <ImportFileDialog
        open={importDialog}
        onOpenChange={setImportDialog}
        folderId={currentFolderId}
      />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Nœud d'arborescence
// ─────────────────────────────────────────────────────────────

function TreeNode({
  id,
  name,
  isRoot = false,
  clientType,
  depth,
  folders,
  clientId,
  expanded,
  currentFolderId,
  dropTarget,
  dropAllowedFor,
  onToggle,
  onNavigate,
  onDragItemChange,
  onDragOver,
  onDropTo,
}: {
  id: string;
  name: string;
  isRoot?: boolean;
  clientType?: string;
  depth: number;
  folders: FolderRecord[];
  clientId: string;
  expanded: Set<string>;
  currentFolderId: string;
  dropTarget: string | null;
  dropAllowedFor: (targetId: string) => boolean;
  onToggle: (id: string) => void;
  onNavigate: (id: string) => void;
  onDragItemChange: (item: DragItem | null) => void;
  onDragOver: (id: string | null) => void;
  onDropTo: (targetId: string) => void;
}) {
  const children = childFoldersOf(folders, clientId, id);
  const isExpanded = isRoot || expanded.has(id);
  const isCurrent = currentFolderId === id;
  const canDrop = dropAllowedFor(id);
  const isDrop = dropTarget === id && canDrop;
  const RootIcon = clientType === "ONG" ? FolderOpen : HardDrive;

  return (
    <li>
      <div
        draggable={!isRoot}
        onDragStart={(e) => {
          if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
          onDragItemChange({ kind: "folder", id });
        }}
        onDragEnd={() => onDragItemChange(null)}
        onDragOver={(e) => {
          if (!canDrop) return;
          e.preventDefault();
          onDragOver(id);
        }}
        onDragLeave={() => onDragOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDropTo(id);
        }}
        className={cn(
          "flex items-center gap-1 rounded-lg pr-2 py-1 cursor-pointer transition-colors",
          isCurrent
            ? "bg-white shadow-[0_1px_4px_rgba(12,25,61,0.1)] text-marine-profond font-semibold"
            : "text-marine-profond/80 hover:bg-marine-profond/[0.05]",
          isDrop && "ring-2 ring-orange-logo/60 bg-orange-logo/[0.08]"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-label={isExpanded ? `Replier ${name}` : `Déplier ${name}`}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded shrink-0 transition-colors hover:bg-marine-profond/[0.08]",
            children.length === 0 && "invisible pointer-events-none"
          )}
          tabIndex={children.length === 0 ? -1 : 0}
        >
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 text-gris-texte/60 transition-transform",
              isExpanded && "rotate-90"
            )}
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={() => onNavigate(id)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left py-0.5"
        >
          {isRoot ? (
            <RootIcon className="w-4 h-4 text-orange-contrast shrink-0" aria-hidden />
          ) : (
            <Folder
              className={cn(
                "w-4 h-4 shrink-0",
                isCurrent ? "text-orange-contrast" : "text-orange-logo/70"
              )}
              aria-hidden
            />
          )}
          <span className="truncate text-[13px]">{name}</span>
        </button>
      </div>
      {isExpanded && children.length > 0 && (
        <ul>
          {children.map((c) => (
            <TreeNode
              key={c.id}
              id={c.id}
              name={c.name}
              depth={depth + 1}
              folders={folders}
              clientId={clientId}
              expanded={expanded}
              currentFolderId={currentFolderId}
              dropTarget={dropTarget}
              dropAllowedFor={dropAllowedFor}
              onToggle={onToggle}
              onNavigate={onNavigate}
              onDragItemChange={onDragItemChange}
              onDragOver={onDragOver}
              onDropTo={onDropTo}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
// Cartes dossier / fichier
// ─────────────────────────────────────────────────────────────

function FolderCard({
  folder,
  folders,
  documents,
  dropActive,
  canDrop,
  onOpen,
  onRename,
  onMove,
  onDelete,
  onDragItemChange,
  onDragOver,
  onDrop,
}: {
  folder: FolderRecord;
  folders: FolderRecord[];
  documents: ExplorerDocument[];
  dropActive: boolean;
  canDrop: boolean;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  onDragItemChange: (item: DragItem | null) => void;
  onDragOver: (id: string | null) => void;
  onDrop: () => void;
}) {
  const descendants = folderDescendantIds(folders, folder.id);
  const subCount = descendants.size - 1;
  const docCount = documents.filter(
    (d) => d.folderId && descendants.has(d.folderId)
  ).length;

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
        onDragItemChange({ kind: "folder", id: folder.id });
      }}
      onDragEnd={() => onDragItemChange(null)}
      onDragOver={(e) => {
        if (!canDrop) return;
        e.preventDefault();
        onDragOver(folder.id);
      }}
      onDragLeave={() => onDragOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop();
      }}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      onDoubleClick={onOpen}
      className={cn(
        "group relative rounded-xl border border-marine-profond/[0.08] bg-white p-3 cursor-pointer transition-all hover:border-orange-logo/40 hover:shadow-[0_4px_16px_rgba(224,127,10,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-logo/50",
        dropActive && "ring-2 ring-orange-logo/70 bg-orange-logo/[0.06]"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-logo/[0.09] text-orange-logo shrink-0">
          <Folder className="w-6 h-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pe-10">
          <p className="font-semibold text-marine-profond text-[13.5px] leading-snug whitespace-nowrap overflow-hidden text-ellipsis">
            {folder.name}
          </p>
          <p className="text-[11px] text-gris-texte mt-1 tabular-nums">
            {subCount > 0 && `${subCount} sous-dossier${subCount > 1 ? "s" : ""} · `}
            {docCount} fichier{docCount > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <CardActions
        name={folder.name}
        onRename={onRename}
        onMove={onMove}
        onDelete={onDelete}
      />
    </div>
  );
}

function FileCard({
  doc,
  meta,
  onOpen,
  onRename,
  onMove,
  onDelete,
  onDragItemChange,
}: {
  doc: ExplorerDocument;
  meta: { label: string; icon: React.ElementType; tone: string };
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  onDragItemChange: (item: DragItem | null) => void;
}) {
  const Icon = meta.icon;
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
        onDragItemChange({ kind: "document", id: doc.id });
      }}
      onDragEnd={() => onDragItemChange(null)}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      onDoubleClick={onOpen}
      className="group relative rounded-xl border border-marine-profond/[0.08] bg-white p-3 cursor-pointer transition-all hover:border-orange-logo/40 hover:shadow-[0_4px_16px_rgba(224,127,10,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-logo/50"
    >
      <div className="flex items-start gap-3">
        <span className={cn("flex items-center justify-center w-11 h-11 rounded-xl shrink-0", meta.tone)}>
          <Icon className="w-6 h-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pe-10">
          <p className="font-semibold text-marine-profond text-[13.5px] leading-snug whitespace-nowrap overflow-hidden text-ellipsis">
            {doc.name}
          </p>
          <p className="text-[11px] text-gris-texte mt-1 tabular-nums">
            {doc.source === "IMPORT" ? "Importé" : meta.label}
            {doc.size ? ` · ${formatBytes(doc.size)}` : ""}
            {` · ${formatDateFr(doc.updatedAt)}`}
          </p>
          {doc.pendingUpload && (
            <p className="text-[10px] font-bold text-orange-contrast mt-0.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" aria-hidden /> Téléversement en attente
            </p>
          )}
        </div>
      </div>
      <CardActions name={doc.name} onRename={onRename} onMove={onMove} onDelete={onDelete} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Vue Liste — une ligne pleine largeur par élément, libellé sur
// UNE SEULE LIGNE, entièrement visible (comme les détails Windows).
// ─────────────────────────────────────────────────────────────

function FolderRow({
  folder,
  folders,
  documents,
  dropActive,
  canDrop,
  onOpen,
  onRename,
  onMove,
  onDelete,
  onDragItemChange,
  onDragOver,
  onDrop,
}: {
  folder: FolderRecord;
  folders: FolderRecord[];
  documents: ExplorerDocument[];
  dropActive: boolean;
  canDrop: boolean;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  onDragItemChange: (item: DragItem | null) => void;
  onDragOver: (id: string | null) => void;
  onDrop: () => void;
}) {
  const subCount = childFoldersOf(folders, folder.clientId, folder.id).length;
  const docCount = documents.filter((d) => d.folderId === folder.id).length;
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
        onDragItemChange({ kind: "folder", id: folder.id });
      }}
      onDragEnd={() => onDragItemChange(null)}
      onDragOver={(e) => {
        if (!canDrop) return;
        e.preventDefault();
        onDragOver(folder.id);
      }}
      onDragLeave={() => onDragOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop();
      }}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      onDoubleClick={onOpen}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border border-marine-profond/[0.07] bg-white px-3 py-2.5 cursor-pointer transition-all hover:border-orange-logo/40 hover:shadow-[0_2px_10px_rgba(224,127,10,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-logo/50",
        dropActive && "ring-2 ring-orange-logo/70 bg-orange-logo/[0.06]"
      )}
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-logo/[0.09] text-orange-logo shrink-0">
        <Folder className="w-5 h-5" aria-hidden />
      </span>
      {/* Libellé : une seule ligne, jamais replié ni tronqué sur deux lignes */}
      <p className="min-w-0 flex-1 font-semibold text-marine-profond text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">
        {folder.name}
      </p>
      <p className="hidden sm:block shrink-0 text-[11px] text-gris-texte tabular-nums pe-24">
        {subCount > 0 && `${subCount} sous-dossier${subCount > 1 ? "s" : ""} · `}
        {docCount} fichier{docCount > 1 ? "s" : ""}
      </p>
      <CardActions name={folder.name} onRename={onRename} onMove={onMove} onDelete={onDelete} />
    </div>
  );
}

function FileRow({
  doc,
  meta,
  onOpen,
  onRename,
  onMove,
  onDelete,
  onDragItemChange,
}: {
  doc: ExplorerDocument;
  meta: { label: string; icon: React.ElementType; tone: string };
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  onDragItemChange: (item: DragItem | null) => void;
}) {
  const Icon = meta.icon;
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
        onDragItemChange({ kind: "document", id: doc.id });
      }}
      onDragEnd={() => onDragItemChange(null)}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      onDoubleClick={onOpen}
      className="group relative flex items-center gap-3 rounded-lg border border-marine-profond/[0.07] bg-white px-3 py-2.5 cursor-pointer transition-all hover:border-orange-logo/40 hover:shadow-[0_2px_10px_rgba(224,127,10,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-logo/50"
    >
      <span className={cn("flex items-center justify-center w-9 h-9 rounded-lg shrink-0", meta.tone)}>
        <Icon className="w-5 h-5" aria-hidden />
      </span>
      {/* Libellé : une seule ligne, jamais replié ni tronqué sur deux lignes */}
      <p className="min-w-0 flex-1 font-semibold text-marine-profond text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">
        {doc.name}
        {doc.pendingUpload && (
          <span className="ml-2 text-[10px] font-bold text-orange-contrast inline-flex items-center gap-1 align-middle">
            <AlertCircle className="w-3 h-3" aria-hidden /> Téléversement en attente
          </span>
        )}
      </p>
      <p className="hidden sm:block shrink-0 text-[11px] text-gris-texte tabular-nums pe-24">
        {doc.source === "IMPORT" ? "Importé" : meta.label}
        {doc.size ? ` · ${formatBytes(doc.size)}` : ""}
        {` · ${formatDateFr(doc.updatedAt)}`}
      </p>
      <CardActions name={doc.name} onRename={onRename} onMove={onMove} onDelete={onDelete} />
    </div>
  );
}

function CardActions({
  name,
  onRename,
  onMove,
  onDelete,
}: {
  name: string;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <button
        type="button"
        aria-label={`Renommer ${name}`}
        onClick={(e) => {
          e.stopPropagation();
          onRename();
        }}
        className="w-7 h-7 flex items-center justify-center rounded-md bg-white/95 border border-marine-profond/[0.1] shadow-sm text-gris-texte hover:text-marine-profond hover:border-marine-profond/30 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Déplacer ${name}`}
        onClick={(e) => {
          e.stopPropagation();
          onMove();
        }}
        className="w-7 h-7 flex items-center justify-center rounded-md bg-white/95 border border-marine-profond/[0.1] shadow-sm text-gris-texte hover:text-marine-profond hover:border-marine-profond/30 transition-colors"
      >
        <FolderInput className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Supprimer ${name}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-7 h-7 flex items-center justify-center rounded-md bg-white/95 border border-marine-profond/[0.1] shadow-sm text-gris-texte hover:text-red-600 hover:border-red-300 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dialogue : nom (création / renommage)
// ─────────────────────────────────────────────────────────────

function NameDialog({
  state,
  folders,
  documents,
  currentFolderId,
  clientId,
  onOpenChange,
}: {
  state:
    | { mode: "create-folder" }
    | { mode: "rename-folder"; folder: FolderRecord }
    | { mode: "rename-document"; doc: ExplorerDocument }
    | null;
  folders: FolderRecord[];
  documents: ExplorerDocument[];
  currentFolderId: string;
  clientId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const mode = state?.mode;
  const title =
    mode === "create-folder"
      ? "Nouveau dossier"
      : mode === "rename-folder"
        ? "Renommer le dossier"
        : "Renommer le fichier";

  const description =
    mode === "create-folder"
      ? "Le dossier sera créé dans le dossier courant. Donnez-lui le nom de votre choix — aucune contrainte."
      : mode === "rename-folder" && state
        ? `Nouveau nom pour « ${state.folder.name} ».`
        : `Nouveau nom pour « ${state?.doc?.name ?? ""} ».`;

  const suggested = useMemo(() => {
    if (!state) return "";
    if (state.mode === "create-folder") {
      const siblings = new Set(
        folders.filter((f) => f.parentId === currentFolderId).map((f) => f.name)
      );
      return uniqueName(siblings, NEW_FOLDER_DEFAULT_NAME);
    }
    if (state.mode === "rename-folder") return state.folder.name;
    return state.doc.name;
  }, [state, folders, currentFolderId]);

  function handleSubmit(fd: FormData) {
    if (!state) return;
    const name = String(fd.get("name") || "").trim();
    if (!name) {
      setError("Le nom est obligatoire.");
      return;
    }
    const bad = invalidFolderNameChars(name);
    if (bad.length > 0) {
      setError(`Caractère${bad.length > 1 ? "s" : ""} interdit${bad.length > 1 ? "s" : ""} : ${bad.join(" ")}`);
      return;
    }
    if (name.length > 255) {
      setError("255 caractères maximum.");
      return;
    }

    if (state.mode === "create-folder") {
      const duplicates = folders.filter(
        (f) => f.parentId === currentFolderId && f.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicates.length > 0) {
        setError("Un dossier portant ce nom existe déjà à cet emplacement.");
        return;
      }
      mutate("folder.create", {
        id: boEngine.newId("fld"),
        clientId,
        parentId: currentFolderId,
        name,
      });
      toast.success(`Dossier « ${name} » créé.`);
    } else if (state.mode === "rename-folder") {
      const duplicates = folders.filter(
        (f) =>
          f.id !== state.folder.id &&
          f.parentId === state.folder.parentId &&
          f.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicates.length > 0) {
        setError("Un dossier portant ce nom existe déjà à cet emplacement.");
        return;
      }
      mutate("folder.rename", { id: state.folder.id, name });
      toast.success("Dossier renommé.");
    } else {
      const duplicates = documents.filter(
        (d) =>
          d.id !== state.doc.id &&
          d.folderId === state.doc.folderId &&
          d.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicates.length > 0) {
        setError("Un fichier portant ce nom existe déjà dans ce dossier.");
        return;
      }
      mutate("document.rename", { id: state.doc.id, name });
      toast.success("Fichier renommé.");
    }
    setError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={!!state} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl font-black text-marine-profond flex items-center gap-2">
            {state?.mode === "rename-document" ? (
              <FileText className="w-5 h-5 text-orange-contrast" aria-hidden />
            ) : (
              <FolderPlus className="w-5 h-5 text-orange-contrast" aria-hidden />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => handleSubmit(fd)}
          className="space-y-4"
          key={state ? `${state.mode}-${suggested}` : "none"}
        >
          <div className="space-y-2">
            <Label htmlFor="f-name">Nom</Label>
            <Input
              id="f-name"
              name="name"
              required
              autoFocus
              defaultValue={suggested}
              onFocus={(e) => e.currentTarget.select()}
              placeholder="Ex. Déclarations fiscales, Balance 2026, Correspondances…"
              className="h-10"
            />
            <p className="text-[11px] text-gris-texte">
              Caractères interdits : <code className="font-mono">\ /</code> — tout le reste est libre.
            </p>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-orange-logo hover:bg-orange-sature text-white shadow-orange">
              {state?.mode === "create-folder" ? "Créer le dossier" : "Renommer"}
              <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Dialogue : déplacer vers…
// ─────────────────────────────────────────────────────────────

function MoveDialog({
  state,
  folders,
  rootId,
  clientName,
  onOpenChange,
}: {
  state: { kind: "folder" | "document"; id: string; name: string } | null;
  folders: FolderRecord[];
  rootId: string;
  clientName: string;
  onOpenChange: (open: boolean) => void;
}) {
  const destinations = useMemo(() => {
    if (!state) return [] as { id: string; name: string; depth: number }[];
    const excluded =
      state.kind === "folder" ? folderDescendantIds(folders, state.id) : new Set<string>();
    const list: { id: string; name: string; depth: number }[] = [];

    function walk(parentId: string, depth: number) {
      for (const f of folders
        .filter((x) => x.parentId === parentId && !excluded.has(x.id))
        .sort((a, b) => a.name.localeCompare(b.name, "fr"))) {
        list.push({ id: f.id, name: f.name, depth });
        walk(f.id, depth + 1);
      }
    }
    walk(rootId, 0);
    return list;
  }, [state, folders, rootId]);

  const currentParent = useMemo(() => {
    if (!state) return rootId;
    if (state.kind === "folder") {
      return folders.find((f) => f.id === state.id)?.parentId ?? rootId;
    }
    return null; // déterminé par le parent (document) — racine par défaut
  }, [state, folders, rootId]);

  const [selected, setSelected] = useState<string>(rootId);
  const [selectionInit, setSelectionInit] = useState<string | null>(null);

  // À l'ouverture : pré-sélection du parent actuel
  const effectiveSelected =
    selectionInit === (state?.id ?? null) ? selected : currentParent ?? rootId;

  function select(id: string) {
    setSelectionInit(state?.id ?? null);
    setSelected(id);
  }

  function handleConfirm() {
    if (!state) return;
    if (state.kind === "folder") {
      mutate("folder.move", { id: state.id, parentId: effectiveSelected });
      toast.success("Dossier déplacé.");
    } else {
      mutate("document.move", { id: state.id, folderId: effectiveSelected });
      toast.success("Fichier déplacé.");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={!!state} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl font-black text-marine-profond flex items-center gap-2">
            <FolderInput className="w-5 h-5 text-orange-contrast" aria-hidden />
            Déplacer « {state?.name} »
          </DialogTitle>
          <DialogDescription>
            Choisissez le dossier de destination — la racine ou n&apos;importe quel
            sous-dossier, comme dans l&apos;explorateur Windows.
          </DialogDescription>
        </DialogHeader>

        <div
          role="radiogroup"
          aria-label="Dossier de destination"
          className="max-h-[320px] overflow-y-auto rounded-xl border border-marine-profond/[0.1] divide-y divide-marine-profond/[0.05] bo-scrollbar-light"
        >
          <button
            type="button"
            role="radio"
            aria-checked={effectiveSelected === rootId}
            onClick={() => select(rootId)}
            className={cn(
              "flex items-center gap-2.5 w-full text-left px-4 py-2.5 transition-colors",
              effectiveSelected === rootId
                ? "bg-orange-logo/[0.08]"
                : "hover:bg-gris-bleute/50"
            )}
          >
            <HardDrive className="w-4 h-4 text-orange-contrast shrink-0" aria-hidden />
            <span className="text-[13px] font-semibold text-marine-profond truncate">
              Racine — {clientName}
            </span>
            {effectiveSelected === rootId && (
              <span className="ml-auto w-2 h-2 rounded-full bg-orange-logo shrink-0" aria-hidden />
            )}
          </button>
          {destinations.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={effectiveSelected === d.id}
              onClick={() => select(d.id)}
              className={cn(
                "flex items-center gap-2.5 w-full text-left py-2.5 pr-4 transition-colors",
                effectiveSelected === d.id ? "bg-orange-logo/[0.08]" : "hover:bg-gris-bleute/50"
              )}
              style={{ paddingLeft: `${16 + d.depth * 18}px` }}
            >
              <Folder className="w-4 h-4 text-orange-logo/70 shrink-0" aria-hidden />
              <span className="text-[13px] text-marine-profond truncate">{d.name}</span>
              {effectiveSelected === d.id && (
                <span className="ml-auto w-2 h-2 rounded-full bg-orange-logo shrink-0" aria-hidden />
              )}
            </button>
          ))}
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
          >
            Déplacer ici
            <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Dialogue : suppression (cascade comme Windows)
// ─────────────────────────────────────────────────────────────

function DeleteDialog({
  state,
  onAfterFolderDeleted,
  onOpenChange,
}: {
  state:
    | { kind: "folder"; id: string; name: string; subCount: number; docCount: number }
    | { kind: "document"; id: string; name: string }
    | null;
  onAfterFolderDeleted: (folderId: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  function handleConfirm() {
    if (!state) return;
    if (state.kind === "folder") {
      mutate("folder.delete", { id: state.id });
      onAfterFolderDeleted(state.id);
      toast.success(`Dossier « ${state.name} » supprimé.`);
    } else {
      mutate("document.delete", { id: state.id });
      toast.success(`Fichier « ${state.name} » supprimé.`);
    }
    onOpenChange(false);
  }

  return (
    <AlertDialog open={!!state} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {state?.kind === "folder"
              ? `Supprimer le dossier « ${state.name} » ?`
              : `Supprimer « ${state?.name} » ?`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {state?.kind === "folder" ? (
                state.subCount > 0 || state.docCount > 0 ? (
                  <>
                    Comme dans l&apos;explorateur Windows, tout le contenu sera définitivement
                    supprimé :{" "}
                    <strong className="text-marine-profond">
                      {state.subCount > 0 &&
                        `${state.subCount} sous-dossier${state.subCount > 1 ? "s" : ""}`}
                      {state.subCount > 0 && state.docCount > 0 && " et "}
                      {state.docCount > 0 &&
                        `${state.docCount} fichier${state.docCount > 1 ? "s" : ""}`}
                    </strong>
                    . Cette action est irréversible.
                  </>
                ) : (
                  <>
                    Ce dossier est vide — il sera définitivement supprimé.
                    Cette action est irréversible.
                  </>
                )
              ) : (
                <>
                  Le fichier sera définitivement supprimé, y compris ses versions
                  successives. Cette action est irréversible.
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirm}
            >
              Supprimer définitivement
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Dialogue : création tableur / document
// ─────────────────────────────────────────────────────────────

function CreateFileDialog({
  open,
  onOpenChange,
  folderId,
  workItemOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  workItemOptions: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState("SHEET");
  const [workItemId, setWorkItemId] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl font-black text-marine-profond">
            Créer un fichier dans ce dossier
          </DialogTitle>
          <DialogDescription>
            Vrai classeur Microsoft Excel (.xlsx) ou vrai document Microsoft
            Word (.docx), créé au format Office et ouvert dans Microsoft
            Excel / Word avec toutes leurs fonctionnalités.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => {
            const name = String(fd.get("name") || "").trim();
            if (!name) return;
            const id = boEngine.newId("doc");
            mutate("document.create", {
              id,
              name,
              kind: String(fd.get("kind") || "SHEET"),
              entity: "CABINET",
              folderId,
              workItemId: String(fd.get("workItemId") || "") || undefined,
            });
            onOpenChange(false);
            router.push(`/back-office/cabinet/documents/${id}`);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="workItemId" value={workItemId || ""} />

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "SHEET", label: "Tableur Excel", desc: "Classeur .xlsx", icon: FileSpreadsheet },
              { value: "DOC", label: "Document Word", desc: "Document .docx", icon: FileText },
            ].map((option) => {
              const Icon = option.icon;
              const active = kind === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setKind(option.value)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    active
                      ? "border-orange-logo/60 bg-orange-logo/[0.06]"
                      : "border-marine-profond/[0.1] hover:border-marine-profond/25"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${active ? "text-orange-contrast" : "text-marine-profond/50"}`}
                    aria-hidden
                  />
                  <span>
                    <span className="block font-semibold text-marine-profond text-sm">
                      {option.label}
                    </span>
                    <span className="block text-[11px] text-gris-texte">{option.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-name">Nom du fichier *</Label>
            <Input
              id="d-name"
              name="name"
              required
              placeholder={
                kind === "SHEET"
                  ? "Ex. Balance générale — Mars 2026"
                  : "Ex. Note de cadrage certification"
              }
              className="h-10"
            />
          </div>

          {workItemOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="d-work">Rattacher à une mission (optionnel)</Label>
              <Select
                value={workItemId || "none"}
                onValueChange={(v) => setWorkItemId(v === "none" ? "" : v)}
              >
                <SelectTrigger id="d-work" className="h-10">
                  <SelectValue placeholder="Aucune mission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune mission</SelectItem>
                  {workItemOptions.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
            >
              Créer et ouvrir
              <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Dialogue : import de fichier existant
// ─────────────────────────────────────────────────────────────

function ImportFileDialog({
  open,
  onOpenChange,
  folderId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit() {
    const f = file;
    if (!f || f.size === 0) {
      setError("Sélectionnez un fichier à importer.");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      setError("Fichier trop volumineux (3 Mo maximum).");
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      // Le fichier est conservé localement (IndexedDB) : l'import fonctionne
      // même hors-ligne ; le téléversement vers le serveur se fera à la
      // synchronisation (le vrai fichier .xlsx / .docx est alors archivé
      // et ouvrable dans Microsoft Excel / Word).
      const blobKey = boEngine.newId("blob");
      await blobPut(blobKey, f);
      await boEngine.mutate({
        id: boEngine.newId("mut"),
        type: "document.import",
        createdAt: new Date().toISOString(),
        payload: {
          id: boEngine.newId("doc"),
          name: f.name,
          mimeType: f.type || "application/octet-stream",
          size: f.size,
          folderId,
          blobKey,
        },
      });
      setSuccess(true);
      setFileName("");
      setFile(null);
    } catch {
      setError("Import impossible sur cet appareil.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl font-black text-marine-profond">
            Importer un fichier dans ce dossier
          </DialogTitle>
          <DialogDescription>
            Excel (.xlsx), Word (.docx), PDF ou tout autre fichier professionnel.
            Les fichiers Excel et Word s&apos;ouvrent dans Microsoft Office
            (bouton « Ouvrir dans l&apos;application ») avec l&apos;intégralité de
            leurs fonctionnalités.
          </DialogDescription>
        </DialogHeader>

        <form
          action={() => {
            void handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="i-file">Fichier (3 Mo max) *</Label>
            <div className="rounded-xl border-2 border-dashed border-marine-profond/15 p-5 text-center hover:border-orange-logo/50 transition-colors">
              <input
                id="i-file"
                name="file"
                type="file"
                required
                accept=".xlsx,.xls,.csv,.doc,.docx,.odt,.pdf,.txt,image/*"
                className="mx-auto block text-sm text-gris-texte file:mr-3 file:rounded-full file:border-0 file:bg-marine-profond file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-marine-moyen"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setFileName(e.target.files?.[0]?.name ?? "");
                  setSuccess(false);
                }}
              />
              {fileName && (
                <p className="mt-3 text-xs font-semibold text-marine-profond flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-orange-contrast" aria-hidden />
                  {fileName}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div role="status" className="flex items-start gap-2 rounded-lg border border-vert-tech/30 bg-vert-tech/[0.08] px-3.5 py-2.5 text-sm text-[#256b4d]">
              <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>
                Fichier importé dans le dossier — il apparaît immédiatement (téléversé
                vers le serveur dès que possible).
              </span>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-orange-logo hover:bg-orange-sature text-white shadow-orange"
            >
              {pending ? "Import en cours…" : "Importer le fichier"}
              {!pending && <Upload className="w-4 h-4 ml-1.5" aria-hidden />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
