import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  BoPageHeader,
  BoBadge,
  BoStatCard,
  STATUS_TONES,
  PRIORITY_TONES,
} from "@/components/back-office/BoKit";
import {
  WORK_CATEGORY_LABELS,
  WORK_STATUS_LABELS,
  formatDateFr,
  SUBMISSION_SOURCES,
} from "@/lib/back-office/constants";
import { Button } from "@/components/ui/button";
import {
  HeartHandshake,
  Building2,
  FolderOpen,
  ClipboardList,
  FileSpreadsheet,
  Inbox,
  ArrowRight,
  AlarmClock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { priorityLabel } from "@/lib/back-office/labels";

export const dynamic = "force-dynamic";

export default async function CabinetDashboardPage() {
  const session = await getSession();

  const [
    totalClients,
    totalOng,
    totalEntreprises,
    totalFolders,
    missionsEnCours,
    missionsTerminees,
    totalDocs,
    newSubmissions,
    upcoming,
    recentSubs,
    recentDocs,
  ] = await Promise.all([
    prisma.client.count({ where: { status: "ACTIF" } }),
    prisma.client.count({ where: { type: "ONG", status: "ACTIF" } }),
    prisma.client.count({ where: { type: "ENTREPRISE", status: "ACTIF" } }),
    prisma.folder.count(),
    prisma.workItem.count({ where: { status: { in: ["A_FAIRE", "EN_COURS", "EN_REVISION"] } } }),
    prisma.workItem.count({ where: { status: "TERMINE" } }),
    prisma.document.count({ where: { entity: "CABINET" } }),
    prisma.submission.count({ where: { entity: "CABINET", status: "NOUVEAU" } }),
    prisma.workItem.findMany({
      where: { status: { not: "TERMINE" }, dueDate: { not: null } },
      orderBy: { dueDate: "asc" },
      take: 7,
      include: { client: { select: { name: true, type: true } } },
    }),
    prisma.submission.findMany({
      where: { entity: "CABINET" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.document.findMany({
      where: { entity: "CABINET" },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { folder: { select: { id: true, name: true, clientId: true, client: { select: { name: true } } } } },
    }),
  ]);

  const now = new Date();
  const lateCount = upcoming.filter((w) => w.dueDate && w.dueDate < now).length;

  return (
    <div className="max-w-7xl mx-auto">
      <BoPageHeader
        eyebrow="Cockpit digital"
        title={`Bonjour ${session?.name.split(" ")[0] ?? ""} — vue d'ensemble du cabinet`}
        description="Pilotage du Cabinet SERMA : dossiers ONG et clients, explorateur de fichiers libre, missions comptables et fiscales, documents de travail."
        actions={
          <>
            <Button asChild variant="outline" className="h-10 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
              <Link href="/back-office/cabinet/documents">
                <FileSpreadsheet className="w-4 h-4 mr-2" aria-hidden />
                Documents
              </Link>
            </Button>
            <Button asChild className="h-10 bg-orange-logo hover:bg-orange-sature text-white shadow-orange">
              <Link href="/back-office/cabinet/clients?tab=ONG">
                <HeartHandshake className="w-4 h-4 mr-2" aria-hidden />
                Ouvrir les dossiers
              </Link>
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <BoStatCard label="Clients actifs" value={totalClients} hint={`${totalOng} ONG · ${totalEntreprises} autres clients`} icon={Building2} tone="marine" />
        <BoStatCard label="Dossiers & sous-dossiers" value={totalFolders} hint="Arborescence libre type Windows" icon={FolderOpen} tone="orange" />
        <BoStatCard label="Missions en cours" value={missionsEnCours} hint={`${missionsTerminees} clôturées au total`} icon={ClipboardList} tone="green" />
        <BoStatCard label="Demandes non traitées" value={newSubmissions} hint="Reçues du site public" icon={Inbox} tone={newSubmissions > 0 ? "red" : "marine"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Échéancier — colonne principale */}
        <section className="lg:col-span-2 rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden" aria-labelledby="echéancier-title">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-marine-profond/[0.07] bg-gris-bleute/60">
            <div className="flex items-center gap-2.5">
              <AlarmClock className="w-[18px] h-[18px] text-orange-contrast" aria-hidden />
              <h2 id="echéancier-title" className="font-bold text-marine-profond text-[15px]">
                Échéancier des missions
              </h2>
              {lateCount > 0 && <BoBadge tone="red">{lateCount} en retard</BoBadge>}
            </div>
            <span className="text-[11px] font-semibold text-gris-texte">{upcoming.length} à venir</span>
          </div>

          <ul className="divide-y divide-marine-profond/[0.06]">
            {upcoming.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-gris-texte">
                Aucune échéance en attente — tout est à jour.
              </li>
            )}
            {upcoming.map((w) => {
              const late = w.dueDate && w.dueDate < now;
              const soon = w.dueDate && !late && (w.dueDate.getTime() - now.getTime()) < 30 * 24 * 3600 * 1000;
              return (
                <li key={w.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gris-bleute/40 transition-colors">
                  <div className={`w-1.5 h-11 rounded-full shrink-0 ${late ? "bg-red-500" : soon ? "bg-orange-logo" : "bg-marine-profond/15"}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-marine-profond truncate">{w.title}</p>
                    <p className="text-xs text-gris-texte mt-0.5 truncate">
                      {w.client.type === "ONG" ? "ONG" : "Client"} · {w.client.name}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 shrink-0">
                    <BoBadge tone={PRIORITY_TONES(w.priority)}>{priorityLabel(w.priority)}</BoBadge>
                    <BoBadge tone={STATUS_TONES[w.status] ?? "neutral"}>{WORK_STATUS_LABELS[w.status]}</BoBadge>
                  </div>
                  <div className="text-right shrink-0 w-[92px]">
                    <p className={`font-inter text-xs font-bold tabular-nums ${late ? "text-red-600" : "text-marine-profond"}`}>
                      {formatDateFr(w.dueDate)}
                    </p>
                    <p className="text-[10.5px] text-gris-texte/80">{WORK_CATEGORY_LABELS[w.category]}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Entrées récentes du site public */}
          <section className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden" aria-labelledby="demandes-title">
            <div className="flex items-center justify-between px-5 py-4 border-b border-marine-profond/[0.07] bg-gris-bleute/60">
              <div className="flex items-center gap-2.5">
                <Inbox className="w-[18px] h-[18px] text-orange-contrast" aria-hidden />
                <h2 id="demandes-title" className="font-bold text-marine-profond text-[15px]">Demandes du site</h2>
              </div>
              <Link href="/back-office/cabinet/demandes" className="text-[11px] font-bold text-orange-contrast hover:text-orange-logo inline-flex items-center gap-1">
                Tout voir <ArrowRight className="w-3 h-3" aria-hidden />
              </Link>
            </div>
            <ul className="divide-y divide-marine-profond/[0.06]">
              {recentSubs.length === 0 && (
                <li className="px-5 py-6 text-center text-xs text-gris-texte">Aucune demande reçue pour le moment.</li>
              )}
              {recentSubs.map((s) => (
                <li key={s.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-marine-profond truncate">{s.name || SUBMISSION_SOURCES[s.source]}</p>
                    <p className="text-[11px] text-gris-texte mt-0.5 truncate">{s.email || s.phone || "—"}</p>
                  </div>
                  <BoBadge tone={STATUS_TONES[s.status] ?? "neutral"}>{s.status === "NOUVEAU" ? "Nouveau" : s.status === "TRAITE" ? "Traité" : "Archivé"}</BoBadge>
                </li>
              ))}
            </ul>
          </section>

          {/* Documents récents */}
          <section className="rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden" aria-labelledby="docs-title">
            <div className="flex items-center justify-between px-5 py-4 border-b border-marine-profond/[0.07] bg-gris-bleute/60">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-[18px] h-[18px] text-orange-contrast" aria-hidden />
                <h2 id="docs-title" className="font-bold text-marine-profond text-[15px]">Documents récents</h2>
              </div>
              <Link href="/back-office/cabinet/documents" className="text-[11px] font-bold text-orange-contrast hover:text-orange-logo inline-flex items-center gap-1">
                Tout voir <ArrowRight className="w-3 h-3" aria-hidden />
              </Link>
            </div>
            <ul className="divide-y divide-marine-profond/[0.06]">
              {recentDocs.map((d) => (
                <li key={d.id}>
                  <Link href={`/back-office/cabinet/documents/${d.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gris-bleute/40 transition-colors">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-logo/[0.08] text-orange-contrast shrink-0 font-inter text-[10px] font-extrabold uppercase">
                      {d.kind === "SHEET" ? "XLS" : d.kind === "DOC" ? "DOC" : "FIC"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-marine-profond truncate">{d.name}</p>
                      <p className="text-[11px] text-gris-texte mt-0.5 truncate">
                        {d.folder ? `${d.folder.client.name}${d.folder.id.startsWith("root_") ? " · Racine" : ` · ${d.folder.name}`}` : "Non rattaché"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Rappel organisation */}
          <section className="rounded-xl bg-marine-profond text-white p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-grain opacity-25 pointer-events-none" aria-hidden />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <TrendingUp className="w-[18px] h-[18px] text-orange-sature" aria-hidden />
                <h2 className="font-bold text-[15px]">Organisation du cockpit</h2>
              </div>
              <ul className="space-y-2 text-[12.5px] text-white/75 leading-relaxed">
                <li className="flex items-start gap-2">
                  <HeartHandshake className="w-3.5 h-3.5 text-orange-sature/80 mt-0.5 shrink-0" aria-hidden />
                  <span><strong className="text-white">Dossiers ONG</strong> — séparés des autres clients, avec reporting bailleurs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="w-3.5 h-3.5 text-orange-sature/80 mt-0.5 shrink-0" aria-hidden />
                  <span><strong className="text-white">Autres clients</strong> — entreprises, startups, professions libérales.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-orange-sature/80 mt-0.5 shrink-0" aria-hidden />
                  <span>Chaque dossier s&apos;organise en <strong className="text-white">dossiers et sous-dossiers libres</strong> — exactement comme l&apos;explorateur Windows.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-sature/80 mt-0.5 shrink-0" aria-hidden />
                  <span>Excel, Word et PDF : <strong className="text-white">édition, import, export</strong> au cœur du poste de travail.</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
