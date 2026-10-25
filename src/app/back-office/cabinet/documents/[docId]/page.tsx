import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { OfficeLauncher } from "@/components/back-office/OfficeLauncher";
import { FileViewer } from "@/components/back-office/FileViewer";
import { SyncWaiter } from "@/components/back-office/SyncWaiter";
import { BoBadge, BoPageHeader } from "@/components/back-office/BoKit";
import { DOC_KIND_LABELS, formatDateFr, formatBytes } from "@/lib/back-office/constants";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { ensureOfficeFile } from "@/lib/office/generate";
import { signOfficeFileToken, officeFilePath } from "@/lib/office/token";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Fichier Microsoft Office — Document", robots: { index: false, follow: false } };
}

/** Document tableur / Excel → lanceur Microsoft Excel. */
function isExcelFile(doc: { name: string; mimeType: string | null; kind: string }): boolean {
  return (
    doc.kind === "SHEET" ||
    /\.(xlsx|xls|csv)$/i.test(doc.name) ||
    !!doc.mimeType?.includes("spreadsheetml") ||
    !!doc.mimeType?.includes("ms-excel")
  );
}

/** Document texte / Word → lanceur Microsoft Word. */
function isWordFile(doc: { name: string; mimeType: string | null; kind: string }): boolean {
  return (
    doc.kind === "DOC" ||
    /\.(docx|doc)$/i.test(doc.name) ||
    !!doc.mimeType?.includes("wordprocessingml")
  );
}

export default async function DocumentOfficePage({
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

  // Création hors-ligne en cours de synchronisation → attente active
  // (le moteur rejoue la mutation vers PostgreSQL, la page se rafraîchit).
  if (!doc) return <SyncWaiter label={docId} />;

  // Tableur / document interne : le VRAI fichier Microsoft (.xlsx / .docx)
  // est matérialisé sur le serveur s'il n'existe pas encore (documents
  // hérités, créés hors-ligne…) — idempotent.
  const isOfficeKind = doc.kind === "SHEET" || doc.kind === "DOC";
  const isExcel = isExcelFile(doc);
  const isWord = !isExcel && isWordFile(doc);

  if (isOfficeKind) {
    const materialized = await ensureOfficeFile(doc.id, {
      id: doc.id,
      name: doc.name,
      kind: doc.kind,
      content: doc.content,
      filePath: doc.filePath,
      mimeType: doc.mimeType,
      size: doc.size,
    });
    if (!materialized) return notFound();
    doc.name = materialized.name;
    doc.filePath = materialized.filePath;
    if (materialized.size) doc.size = materialized.size;
    if (materialized.mimeType) doc.mimeType = materialized.mimeType;
  }

  // Fichier Office importé sans fichier physique → import en cours de sync
  if (doc.kind === "FILE" && !doc.filePath && (isExcel || isWord)) {
    return <SyncWaiter label={doc.name} />;
  }

  // Fil d'Ariane contextuel : chaîne complète de dossiers jusqu'au fichier
  // (client + dossiers en UNE salve parallèle — base distante)
  let clientInfo: { id: string; name: string } | null = null;
  const folderChain: { id: string; name: string }[] = [];
  if (doc.folder) {
    const [client, allFolders] = await Promise.all([
      prisma.client.findUnique({
        where: { id: doc.folder.clientId },
        select: { id: true, name: true },
      }),
      prisma.folder.findMany({
        where: { clientId: doc.folder.clientId },
        select: { id: true, name: true, parentId: true },
      }),
    ]);
    clientInfo = client;
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

  // ── Fichier Microsoft Office réel → lanceur Excel / Word ──
  if ((isOfficeKind || doc.kind === "FILE") && (isExcel || isWord) && doc.filePath) {
    const app = isExcel ? "excel" : "word";
    const token = await signOfficeFileToken(doc.id);
    const fileUrl = officeFilePath(doc.id, token);

    return (
      <div className="max-w-7xl mx-auto">
        {breadcrumb}
        <BoPageHeader
          eyebrow={isExcel ? "Classeur Microsoft Excel" : "Document Microsoft Word"}
          title={doc.name}
        />
        {meta}
        <OfficeLauncher
          documentId={doc.id}
          name={doc.name}
          app={app}
          fileUrl={fileUrl}
          content={doc.content}
          size={doc.size}
          version={doc.version}
          updatedAt={doc.updatedAt.toISOString()}
        />
      </div>
    );
  }

  // ── Autre fichier importé (PDF, image, archive…) → téléchargement ──
  return (
    <div className="max-w-7xl mx-auto">
      {breadcrumb}
      <BoPageHeader eyebrow="Fichier importé" title={doc.name} />
      {meta}
      <FileViewer
        documentId={doc.id}
        name={doc.name}
        mimeType={doc.mimeType}
        size={doc.size}
      />
    </div>
  );
}
