import prisma from "@/lib/prisma";
import { BoPageHeader } from "@/components/back-office/BoKit";
import { ClientsView } from "@/components/back-office/ClientsView";
import type { ClientRow } from "@/lib/back-office/derive";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dossiers clients — Cabinet",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab = tab === "ENTREPRISE" ? "ENTREPRISE" : "ONG";

  const [clients, folders, activeMissions, documents] = await Promise.all([
    prisma.client.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.folder.findMany({ select: { id: true, clientId: true } }),
    prisma.workItem.groupBy({
      by: ["clientId"],
      where: { status: { not: "TERMINE" } },
      _count: { _all: true },
    }),
    prisma.document.findMany({ select: { folderId: true } }),
  ]);

  const foldersByClient = new Map<string, number>();
  for (const f of folders) {
    foldersByClient.set(f.clientId, (foldersByClient.get(f.clientId) ?? 0) + 1);
  }
  const missionMap = new Map(activeMissions.map((m) => [m.clientId, m._count._all]));

  // Nombre de fichiers par client via l'appartenance des dossiers
  const folderClient = new Map(folders.map((f) => [f.id, f.clientId] as const));
  const docsByClient = new Map<string, number>();
  for (const d of documents) {
    const cid = d.folderId ? folderClient.get(d.folderId) : undefined;
    if (!cid) continue;
    docsByClient.set(cid, (docsByClient.get(cid) ?? 0) + 1);
  }

  const rows: ClientRow[] = clients.map((c) => ({
    id: c.id,
    type: c.type,
    name: c.name,
    sector: c.sector,
    contactName: c.contactName,
    email: c.email,
    phone: c.phone,
    address: c.address,
    taxId: c.taxId,
    status: c.status,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
    foldersCount: foldersByClient.get(c.id) ?? 0,
    documentsCount: docsByClient.get(c.id) ?? 0,
    activeMissions: missionMap.get(c.id) ?? 0,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <BoPageHeader
        eyebrow="Dossiers"
        title="Portefeuille clients du cabinet"
        description="Les dossiers ONG sont rigoureusement séparés des autres clients. Dans chaque dossier client, les fichiers s'organisent en dossiers et sous-dossiers libres — exactement comme dans l'explorateur Windows."
      />
      <ClientsView clients={rows} initialTab={initialTab} />
    </div>
  );
}
