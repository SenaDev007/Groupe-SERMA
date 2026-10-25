import Link from "next/link";
import { buildBoSnapshot } from "@/lib/back-office/snapshot";
import { BoPageHeader, BoEmptyState } from "@/components/back-office/BoKit";
import { DocumentsPanel, type DocumentRow } from "@/components/back-office/DocumentsPanel";
import {
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents — Cabinet",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientFilter } = await searchParams;

  // Données dérivées de l'instantané partagé avec le layout (cache court) :
  // zéro requête supplémentaire — la base Neon distante coûte ~1 s par
  // requête, cette bibliothèque n'en ajoute AUCUNE.
  const snap = await buildBoSnapshot();

  // Documents du client = documents rangés dans ses dossiers
  const documents = snap.documents
    .filter((d) => d.entity === "CABINET")
    .filter((d) =>
      clientFilter
        ? snap.folders.some((f) => f.id === d.folderId && f.clientId === clientFilter)
        : true
    );

  // Chemin complet de chaque dossier (pour l'affichage)
  const folderById = new Map(snap.folders.map((f) => [f.id, f]));

  function pathLabel(folderId: string | null): string | null {
    if (!folderId) return null;
    const names: string[] = [];
    let current = folderById.get(folderId);
    let guard = 0;
    while (current && guard < 100) {
      if (!current.id.startsWith("root_")) names.unshift(current.name);
      current = current.parentId ? folderById.get(current.parentId) : undefined;
      guard++;
    }
    return names.length > 0 ? names.join(" / ") : null;
  }

  const clientNames = new Map(snap.clients.map((c) => [c.id, c]));

  const rows: DocumentRow[] = documents.map((d) => ({
    id: d.id,
    name: d.name,
    kind: d.kind,
    source: d.source,
    size: d.size,
    mimeType: d.mimeType,
    updatedAt: d.updatedAt,
    version: d.version,
    clientName: d.folderId
      ? (snap.folders.find((f) => f.id === d.folderId) &&
          clientNames.get(snap.folders.find((f) => f.id === d.folderId)!.clientId)
            ?.name) ??
        null
      : null,
    folderPath: pathLabel(d.folderId),
    workItemTitle: d.workItemId
      ? snap.workItems.find((w) => w.id === d.workItemId)?.title ?? null
      : null,
  }));

  const clients = [...snap.clients].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="max-w-7xl mx-auto">
      <BoPageHeader
        eyebrow="Bibliothèque"
        title="Documents & fichiers du cabinet"
        description="Tous les documents de travail : tableurs Excel, documents Word, PDF et fichiers importés — rangés dans les dossiers libres de chaque client."
      />

      {/* Filtres clients */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Button
          asChild
          variant={!clientFilter ? "default" : "outline"}
          className={
            !clientFilter
              ? "h-8 bg-marine-profond hover:bg-marine-moyen text-white"
              : "h-8 border-marine-profond/20 text-marine-profond"
          }
          size="sm"
        >
          <Link href="/back-office/cabinet/documents">Tous les clients</Link>
        </Button>
        {clients.map((c) => (
          <Button
            key={c.id}
            asChild
            variant={clientFilter === c.id ? "default" : "outline"}
            className={
              clientFilter === c.id
                ? "h-8 bg-marine-profond hover:bg-marine-moyen text-white"
                : "h-8 border-marine-profond/20 text-marine-profond"
            }
            size="sm"
          >
            <Link href={`/back-office/cabinet/documents?client=${c.id}`}>
              {c.type === "ONG" ? "ONG" : "Client"} · {c.name}
            </Link>
          </Button>
        ))}
      </div>

      <DocumentsPanel documents={rows} />

      {rows.length === 0 && (
        <div className="mt-4">
          <BoEmptyState
            icon={FileSpreadsheet}
            title="Aucun document pour ce filtre"
            description="Les documents se créent et s'importent depuis l'explorateur de fichiers, dans le dossier de chaque client."
          />
        </div>
      )}
    </div>
  );
}
