import Link from "next/link";
import { notFound } from "next/navigation";
import { buildBoSnapshot } from "@/lib/back-office/snapshot";
import { BoPageHeader, BoBadge, STATUS_TONES } from "@/components/back-office/BoKit";
import { ClientExplorer, type ExplorerDocument } from "@/components/back-office/ClientExplorer";
import { WorkItemsPanel, type WorkItemRow } from "@/components/back-office/WorkItemsPanel";
import { CLIENT_TYPE_LABELS } from "@/lib/back-office/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FolderOpen,
  ClipboardList,
  HeartHandshake,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Dossier client — Cabinet", robots: { index: false, follow: false } };
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Données dérivées de l'instantané partagé avec le layout (cache court) :
  // zéro requête supplémentaire — la base Neon distante coûte ~1 s par
  // requête, ce dossier client n'en ajoute AUCUNE.
  const snap = await buildBoSnapshot();
  let client = snap.clients.find((c) => c.id === id);

  // Repli direct (client créé très récemment, pas encore dans le cache) :
  // une seule requête, uniquement dans ce cas rare.
  if (!client) {
    const { default: prisma } = await import("@/lib/prisma");
    const fresh = await prisma.client.findUnique({ where: { id } });
    if (fresh) {
      client = {
        id: fresh.id,
        type: fresh.type,
        name: fresh.name,
        sector: fresh.sector,
        contactName: fresh.contactName,
        email: fresh.email,
        phone: fresh.phone,
        address: fresh.address,
        taxId: fresh.taxId,
        status: fresh.status,
        notes: fresh.notes,
        createdAt: fresh.createdAt.toISOString(),
        updatedAt: fresh.updatedAt.toISOString(),
      };
    }
  }
  if (!client) notFound();

  const clientFolderIds = new Set(
    snap.folders.filter((f) => f.clientId === id).map((f) => f.id)
  );

  const folders = snap.folders
    .filter((f) => f.clientId === id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const documents = snap.documents
    .filter((d) => d.folderId && clientFolderIds.has(d.folderId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const workItems = snap.workItems
    .filter((w) => w.clientId === id)
    .sort(
      (a, b) =>
        a.status.localeCompare(b.status) ||
        String(a.dueDate ?? "").localeCompare(String(b.dueDate ?? ""))
    );

  // Props SSR : premier rendu instantané, store local dès que prêt
  const initialFolders = folders.map((f) => ({
    id: f.id,
    clientId: f.clientId,
    parentId: f.parentId,
    name: f.name,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  }));

  const initialDocuments: ExplorerDocument[] = documents.map((d) => ({
    id: d.id,
    name: d.name,
    kind: d.kind,
    source: d.source,
    size: d.size,
    folderId: d.folderId,
    updatedAt: d.updatedAt,
    version: d.version,
  }));

  const items: WorkItemRow[] = workItems.map((w) => ({
    id: w.id,
    title: w.title,
    category: w.category,
    status: w.status,
    priority: w.priority,
    dueDate: w.dueDate,
    notes: w.notes,
    documentCount: documents.filter((d) => d.workItemId === w.id).length,
  }));

  const totalDocs = documents.length;
  const activeMissions = workItems.filter((w) => w.status !== "TERMINE").length;

  return (
    <div className="max-w-7xl mx-auto">
      <Button asChild variant="ghost" className="mb-4 -ml-2 text-gris-texte hover:text-marine-profond h-9">
        <Link href="/back-office/cabinet/clients">
          <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden />
          Tous les dossiers
        </Link>
      </Button>

      <BoPageHeader
        eyebrow={client.type === "ONG" ? "Dossier ONG" : "Autre client"}
        title={client.name}
        description={`${CLIENT_TYPE_LABELS[client.type]} — ${client.sector || "secteur non renseigné"}. Fichiers organisés en dossiers et sous-dossiers libres, exactement comme dans l'explorateur Windows.`}
        actions={
          <BoBadge tone={STATUS_TONES[client.status] ?? "neutral"}>
            {client.status === "ACTIF" ? "Client actif" : client.status === "SUSPENDU" ? "Suspendu" : "Archivé"}
          </BoBadge>
        }
      />

      {/* Fiche client */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 rounded-xl border border-marine-profond/[0.07] bg-white p-5 shadow-[0_2px_12px_rgba(12,25,61,0.05)]">
          <div className="flex items-center gap-3 mb-4">
            <span className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${client.type === "ONG" ? "bg-vert-tech/10 text-[#256b4d]" : "bg-marine-profond/[0.06] text-marine-profond/70"}`}>
              {client.type === "ONG" ? <HeartHandshake className="w-5 h-5" aria-hidden /> : <Building2 className="w-5 h-5" aria-hidden />}
            </span>
            <div>
              <p className="font-semibold text-marine-profond">{client.contactName || "Contact non renseigné"}</p>
              <p className="text-xs text-gris-texte">{client.taxId || "IFU non renseigné"}</p>
            </div>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gris-texte/60 shrink-0" aria-hidden />
              <dd className="text-gris-texte truncate">{client.email || "—"}</dd>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gris-texte/60 shrink-0" aria-hidden />
              <dd className="text-gris-texte">{client.phone || "—"}</dd>
            </div>
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <MapPin className="w-4 h-4 text-gris-texte/60 shrink-0" aria-hidden />
              <dd className="text-gris-texte">{client.address || "—"}</dd>
            </div>
          </dl>
          {client.notes && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-gris-bleute/70 px-4 py-3">
              <FileText className="w-4 h-4 text-orange-contrast mt-0.5 shrink-0" aria-hidden />
              <p className="text-[13px] text-marine-profond/80 leading-relaxed">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-marine-profond text-white p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grain opacity-25 pointer-events-none" aria-hidden />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50 mb-3">Synthèse du dossier</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/70 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" aria-hidden /> Dossiers &amp; sous-dossiers
                </span>
                <span className="font-inter font-extrabold text-lg tabular-nums">{folders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/70 flex items-center gap-2">
                  <FileText className="w-4 h-4" aria-hidden /> Fichiers
                </span>
                <span className="font-inter font-extrabold text-lg tabular-nums">{totalDocs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/70 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" aria-hidden /> Missions
                </span>
                <span className="font-inter font-extrabold text-lg tabular-nums">
                  {activeMissions}
                  <span className="text-white/50 text-xs font-bold ml-1">/ {workItems.length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Espace de travail : explorateur + missions */}
      <Tabs defaultValue="fichiers">
        <TabsList className="mb-4">
          <TabsTrigger value="fichiers" className="gap-2">
            <FolderOpen className="w-4 h-4" aria-hidden />
            Fichiers
          </TabsTrigger>
          <TabsTrigger value="missions" className="gap-2">
            <ClipboardList className="w-4 h-4" aria-hidden />
            Missions
            <span className="ml-1 text-[10px] font-bold tabular-nums bg-marine-profond/[0.08] rounded-full px-1.5">
              {workItems.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fichiers">
          <ClientExplorer
            clientId={client.id}
            clientName={client.name}
            clientType={client.type}
            initialFolders={initialFolders}
            initialDocuments={initialDocuments}
            workItemOptions={workItems.map((w) => ({ id: w.id, title: w.title }))}
          />
        </TabsContent>

        <TabsContent value="missions">
          <WorkItemsPanel clientId={client.id} items={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
