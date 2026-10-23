"use client";

/**
 * Bibliothèque des documents & fichiers du cabinet (vue globale).
 * L'organisation en dossiers se fait dans l'explorateur de chaque dossier
 * client (ClientExplorer) — cette vue liste, filtre et ouvre.
 *
 * Offline-first : données depuis le store local (IndexedDB) dès que prêt,
 * sinon props du rendu serveur.
 */

import { useMemo } from "react";
import Link from "next/link";
import { useBoData } from "@/hooks/useBoData";
import { folderPathLabel } from "@/lib/back-office/derive";
import { formatDateFr } from "@/lib/back-office/constants";
import {
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  ArrowRight,
} from "lucide-react";

export interface DocumentRow {
  id: string;
  name: string;
  kind: string;
  source: string;
  size: number | null;
  mimeType: string | null;
  updatedAt: string;
  version: number;
  clientName: string | null;
  folderPath: string | null;
  workItemTitle: string | null;
}

const KIND_META: Record<string, { label: string; icon: React.ElementType; tone: string }> = {
  SHEET: { label: "Tableur", icon: FileSpreadsheet, tone: "bg-vert-tech/10 text-[#256b4d]" },
  DOC: { label: "Document", icon: FileText, tone: "bg-orange-logo/10 text-orange-contrast" },
  FILE: { label: "Fichier", icon: FileIcon, tone: "bg-marine-profond/[0.06] text-marine-profond/70" },
};

export function DocumentsPanel({ documents }: { documents: DocumentRow[] }) {
  const bo = useBoData();

  // Store offline-first : documents depuis IndexedDB dès que prêt,
  // sinon props du rendu serveur.
  const rows = useMemo<DocumentRow[]>(() => {
    if (bo.ready && bo.snapshot) {
      const clients = bo.snapshot.clients;
      const clientName = (clientId: string) =>
        clients.find((c) => c.id === clientId)?.name ?? null;
      return bo.snapshot.documents
        .filter((d) => d.entity === "CABINET")
        .map((d) => {
          const folder = bo.snapshot!.folders.find((f) => f.id === d.folderId);
          return {
            id: d.id,
            name: d.name,
            kind: d.kind,
            source: d.source,
            size: d.size,
            mimeType: d.mimeType,
            updatedAt: d.updatedAt,
            version: d.version,
            clientName: folder ? clientName(folder.clientId) : null,
            folderPath: folderPathLabel(bo.snapshot!.folders, d.folderId),
            workItemTitle:
              bo.snapshot!.workItems.find((w) => w.id === d.workItemId)?.title ?? null,
          };
        });
    }
    return documents;
  }, [bo.ready, bo.snapshot, documents]);

  return (
    <section
      aria-labelledby="docs-panel-title"
      className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-marine-profond/[0.07] bg-gris-bleute/60">
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="w-[18px] h-[18px] text-orange-contrast" aria-hidden />
          <h2 id="docs-panel-title" className="font-bold text-marine-profond text-[15px]">
            Documents &amp; fichiers de travail
          </h2>
          <span className="font-inter text-[11px] px-2 py-0.5 rounded-full bg-marine-profond/[0.06] text-gris-texte tabular-nums">
            {rows.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto bo-scrollbar-light">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gris-bleute/40">
              <th className="text-left px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gris-texte">Document</th>
              <th className="text-left px-4 py-2.5 hidden md:table-cell text-[11px] font-bold uppercase tracking-wider text-gris-texte">Client / Dossier</th>
              <th className="text-left px-4 py-2.5 hidden sm:table-cell text-[11px] font-bold uppercase tracking-wider text-gris-texte">Type</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gris-texte">Modifié</th>
              <th className="px-5 py-2.5 text-right w-[76px] text-[11px] font-bold uppercase tracking-wider text-gris-texte">Ouvrir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-marine-profond/[0.05]">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-gris-texte">
                  Aucun document. Créez tableurs et documents depuis l&apos;explorateur
                  de fichiers d&apos;un dossier client, ou importez-y vos fichiers Excel,
                  Word et PDF.
                </td>
              </tr>
            )}
            {rows.map((doc) => {
              const meta = KIND_META[doc.kind] ?? KIND_META.FILE;
              const Icon = meta.icon;
              return (
                <tr key={doc.id} className="group">
                  <td className="px-5 py-3 min-w-0">
                    <Link
                      href={`/back-office/cabinet/documents/${doc.id}`}
                      className="flex items-center gap-3 min-w-0 hover:text-orange-contrast"
                    >
                      <span className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${meta.tone}`}>
                        <Icon className="w-[18px] h-[18px]" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-marine-profond text-[13.5px] truncate group-hover:text-orange-contrast transition-colors">
                          {doc.name}
                        </span>
                        <span className="block text-[11px] text-gris-texte mt-0.5">
                          v{doc.version} · {doc.source === "IMPORT" ? "Importé" : "Interne"}
                          {doc.size ? ` · ${(doc.size / 1024).toFixed(0)} Ko` : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gris-texte min-w-0">
                    {doc.clientName ? (
                      <span className="block truncate">
                        <span className="font-semibold text-marine-profond/80">{doc.clientName}</span>
                        {doc.folderPath && ` · ${doc.folderPath}`}
                      </span>
                    ) : (
                      "Non rattaché"
                    )}
                    {doc.workItemTitle && (
                      <span className="block truncate text-[10.5px] text-orange-contrast/80">
                        Mission : {doc.workItemTitle}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="inline-flex items-center rounded-full border border-marine-profond/15 px-2 py-0.5 text-[11px] font-semibold text-gris-texte">
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-inter text-xs text-gris-texte tabular-nums whitespace-nowrap">
                    {formatDateFr(doc.updatedAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/back-office/cabinet/documents/${doc.id}`}
                      aria-label={`Ouvrir ${doc.name}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-orange-contrast hover:text-orange-logo hover:bg-orange-logo/[0.08] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
