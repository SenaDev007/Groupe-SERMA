import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { UniverSheetEditor } from "@/components/back-office/UniverSheetEditor";
import { DocumentEditor } from "@/components/back-office/DocumentEditor";
import { FileViewer } from "@/components/back-office/FileViewer";
import { BoBadge, BoPageHeader } from "@/components/back-office/BoKit";
import { DOC_KIND_LABELS, formatDateFr, formatBytes } from "@/lib/back-office/constants";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Éditeur — Document", robots: { index: false, follow: false } };
}

export default async function DocumentEditorPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: {
      folder: { select: { id: true, name: true, parentId: true, clientId: true } },
      workItem: { select: { id: true, title: true } },
    },
  });
  if (!doc) notFound();

  // Fil d'Ariane contextuel : chaîne complète de dossiers jusqu'au fichier
  let clientInfo: { id: string; name: string } | null = null;
  const folderChain: { id: string; name: string }[] = [];
  if (doc.folder) {
    const client = await prisma.client.findUnique({
      where: { id: doc.folder.clientId },
      select: { id: true, name: true },
    });
    clientInfo = client;
    const allFolders = await prisma.folder.findMany({
      where: { clientId: doc.folder.clientId },
      select: { id: true, name: true, parentId: true },
    });
    const byId = new Map(allFolders.map((f) => [f.id, f]));
    let current = byId.get(doc.folder.id);
    let guard = 0;
    while (current && guard < 100) {
      if (!current.id.startsWith("root_")) {
        folderChain.unshift({ id: current.id, name: current.name });
      }
      current = current.parentId ? byId.get(current.parentId) : undefined;
      guard++;
    }
  }

  const breadcrumb = clientInfo ? (
    <nav aria-label="Fil d'Ariane" className="mb-4 flex items-center gap-1.5 text-[13px] text-gris-texte flex-wrap">
      <Link href="/back-office/cabinet/clients" className="hover:text-marine-profond transition-colors">Dossiers</Link>
      <ChevronRight className="w-3.5 h-3.5 text-gris-texte/50" aria-hidden />
      <Link href={`/back-office/cabinet/clients/${clientInfo.id}`} className="hover:text-marine-profond transition-colors truncate max-w-[180px]">
        {clientInfo.name}
      </Link>
      {folderChain.map((seg) => (
        <span key={seg.id} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-gris-texte/50" aria-hidden />
          <Link
            href={`/back-office/cabinet/clients/${clientInfo.id}`}
            className="hover:text-marine-profond transition-colors truncate max-w-[160px]"
          >
            {seg.name}
          </Link>
        </span>
      ))}
      <ChevronRight className="w-3.5 h-3.5 text-gris-texte/50" aria-hidden />
      <span className="font-semibold text-marine-profond truncate max-w-[220px]">{doc.name}</span>
    </nav>
  ) : (
    <Button asChild variant="ghost" className="mb-4 -ml-2 text-gris-texte hover:text-marine-profond h-9">
      <Link href="/back-office/cabinet/documents">
        <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden />
        Tous les documents
      </Link>
    </Button>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <BoBadge tone="orange">{DOC_KIND_LABELS[doc.kind] ?? doc.kind}</BoBadge>
      {clientInfo && (
        <BoBadge tone="outline">
          {clientInfo.name}
          {folderChain.length > 0 && ` · ${folderChain.map((s) => s.name).join(" / ")}`}
        </BoBadge>
      )}
      {doc.workItem && <BoBadge tone="outline">Mission : {doc.workItem.title}</BoBadge>}
      <BoBadge tone="outline">v{doc.version} · {formatDateFr(doc.updatedAt)}</BoBadge>
      {doc.size ? <BoBadge tone="outline">{formatBytes(doc.size)}</BoBadge> : null}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {breadcrumb}

      {doc.kind === "SHEET" && (
        <>
          <BoPageHeader eyebrow="Éditeur Excel" title="Classeur Excel" description="Vrai fichier .xlsx — formules complètes (400+ fonctions), feuilles multiples, formats. S'ouvre dans Microsoft Excel, Google Sheets et LibreOffice." />
          {meta}
          <UniverSheetEditor
            documentId={doc.id}
            documentName={doc.name}
            hasFile={!!doc.filePath}
            fallbackLegacy={parseLegacy(doc.content)}
          />
        </>
      )}

      {doc.kind === "DOC" && (
        <>
          <BoPageHeader eyebrow="Éditeur de document" title="Document de travail" description="Rédaction riche : titres, listes, citations. Export PDF prêt à envoyer et Word compatible Google Docs." />
          {meta}
          <DocumentEditor
            documentId={doc.id}
            documentName={doc.name}
            initialContent={doc.content ?? "<p></p>"}
          />
        </>
      )}

      {/* Fichier Excel importé (.xlsx) → édition directe du VRAI fichier */}
      {doc.kind === "FILE" && isXlsx(doc) && (
        <>
          <BoPageHeader
            eyebrow="Fichier Excel importé"
            title="Classeur Excel"
            description="Le fichier original s'ouvre ici avec ses formules et formats d'origine — les modifications l'enregistrent en tant que vrai fichier .xlsx."
          />
          {meta}
          <UniverSheetEditor
            documentId={doc.id}
            documentName={doc.name}
            hasFile={!!doc.filePath}
            fallbackLegacy={parseLegacy(doc.content)}
          />
        </>
      )}

      {/* Fichier non-Excel importé (PDF, image…) → visionnage */}
      {doc.kind === "FILE" && !isXlsx(doc) && (
        <>
          <BoPageHeader eyebrow="Fichier importé" title={doc.name} description="Fichier du dossier client — téléchargeable à tout moment." />
          {meta}
          <FileViewer
            documentId={doc.id}
            name={doc.name}
            mimeType={doc.mimeType}
            size={doc.size}
          />
        </>
      )}
    </div>
  );
}

function isXlsx(doc: { name: string; mimeType: string | null }): boolean {
  return (
    /\.xlsx?$/i.test(doc.name) ||
    !!doc.mimeType?.includes("spreadsheetml") ||
    !!doc.mimeType?.includes("ms-excel")
  );
}

function parseLegacy(content: string | null): { cols: string[]; rows: string[][] } | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed?.cols) && Array.isArray(parsed?.rows)) {
      return {
        cols: parsed.cols.map((c: unknown) => String(c ?? "")),
        rows: parsed.rows.map((r: unknown[]) =>
          Array.isArray(r) ? r.map((c) => String(c ?? "")) : []
        ),
      };
    }
  } catch {
    // contenu illisible → pas de repli
  }
  return null;
}
