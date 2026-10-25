import { buildBoSnapshot } from "@/lib/back-office/snapshot";
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

  // Données dérivées de l'instantané partagé avec le layout (cache court) :
  // zéro requête supplémentaire — la base Neon distante coûte ~1 s par
  // requête, ce portefeuille n'en ajoute AUCUNE.
  const snap = await buildBoSnapshot();

  const foldersByClient = new Map<string, number>();
  for (const f of snap.folders) {
    foldersByClient.set(f.clientId, (foldersByClient.get(f.clientId) ?? 0) + 1);
  }
  const missionMap = new Map<string, number>();
  for (const w of snap.workItems) {
    if (w.status === "TERMINE") continue;
    missionMap.set(w.clientId, (missionMap.get(w.clientId) ?? 0) + 1);
  }

  // Nombre de fichiers par client via l'appartenance des dossiers
  const folderClient = new Map(snap.folders.map((f) => [f.id, f.clientId] as const));
  const docsByClient = new Map<string, number>();
  for (const d of snap.documents) {
    const cid = d.folderId ? folderClient.get(d.folderId) : undefined;
    if (!cid) continue;
    docsByClient.set(cid, (docsByClient.get(cid) ?? 0) + 1);
  }

  const rows: ClientRow[] = snap.clients.map((c) => ({
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
    createdAt: c.createdAt,
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
