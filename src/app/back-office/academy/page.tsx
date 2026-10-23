import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { BoPageHeader, BoStatCard, BoBadge, STATUS_TONES } from "@/components/back-office/BoKit";
import { formatDateFr } from "@/lib/back-office/constants";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  ClipboardList,
  BookOpen,
  Star,
  ArrowRight,
  Users,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Console Academy — SERMA HUB",
  robots: { index: false, follow: false },
};

export default async function AcademyDashboardPage() {
  const session = await getSession();

  const [
    publishedFormations,
    draftFormations,
    filieres,
    newInscriptions,
    totalInscriptions,
    publishedArticles,
    draftArticles,
    publishedTestimonials,
  ] = await Promise.all([
    prisma.formation.count({ where: { status: "PUBLIE" } }),
    prisma.formation.count({ where: { status: "BROUILLON" } }),
    prisma.formation.count({ where: { category: "FILIERE", status: "PUBLIE" } }),
    prisma.submission.count({ where: { entity: "ACADEMY", status: "NOUVEAU" } }),
    prisma.submission.count({ where: { entity: "ACADEMY" } }),
    prisma.article.count({ where: { status: "PUBLIE" } }),
    prisma.article.count({ where: { status: "BROUILLON" } }),
    prisma.testimonial.count({ where: { status: "PUBLIE" } }),
  ]);

  const recentInscriptions = await prisma.submission.findMany({
    where: { entity: "ACADEMY" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="max-w-7xl mx-auto">
      <BoPageHeader
        eyebrow="Console de gestion"
        title={`Bonjour ${session?.name.split(" ")[0] ?? ""} — SERMA HUB Impact Academy`}
        description="Pilotage de l'Academy : formations publiées sur le site, inscriptions reçues, articles du blog et témoignages — tout est connecté à l'espace public."
        actions={
          <>
            <Button asChild variant="outline" className="h-10 border-marine-profond/20 text-marine-profond hover:bg-marine-profond/[0.04]">
              <a href="/academy" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" aria-hidden />
                Voir le site public
              </a>
            </Button>
            <Button asChild className="h-10 bg-orange-logo hover:bg-orange-sature text-white shadow-orange">
              <Link href="/back-office/academy/formations">
                <GraduationCap className="w-4 h-4 mr-2" aria-hidden />
                Gérer les formations
              </Link>
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <BoStatCard label="Formations publiées" value={publishedFormations} hint={`${filieres} filières · ${publishedFormations - filieres} formations courtes`} icon={GraduationCap} tone="green" />
        <BoStatCard label="Inscriptions à traiter" value={newInscriptions} hint={`${totalInscriptions} reçues au total`} icon={ClipboardList} tone={newInscriptions > 0 ? "red" : "marine"} />
        <BoStatCard label="Articles publiés" value={publishedArticles} hint={`${draftArticles} brouillon${draftArticles > 1 ? "s" : ""} en préparation`} icon={BookOpen} tone="orange" />
        <BoStatCard label="Témoignages en ligne" value={publishedTestimonials} hint="Affichés sur le site public" icon={Star} tone="marine" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inscriptions récentes */}
        <section className="lg:col-span-2 rounded-xl border border-marine-profond/[0.07] bg-white shadow-[0_2px_12px_rgba(12,25,61,0.05)] overflow-hidden" aria-labelledby="inscriptions-title">
          <div className="flex items-center justify-between px-5 py-4 border-b border-marine-profond/[0.07] bg-gris-bleute/60">
            <div className="flex items-center gap-2.5">
              <ClipboardList className="w-[18px] h-[18px] text-orange-contrast" aria-hidden />
              <h2 id="inscriptions-title" className="font-bold text-marine-profond text-[15px]">
                Dernières inscriptions
              </h2>
            </div>
            <Link href="/back-office/academy/inscriptions" className="text-[11px] font-bold text-orange-contrast hover:text-orange-logo inline-flex items-center gap-1">
              Tout voir <ArrowRight className="w-3 h-3" aria-hidden />
            </Link>
          </div>
          <ul className="divide-y divide-marine-profond/[0.06]">
            {recentInscriptions.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-gris-texte">
                Aucune inscription reçue pour le moment — le formulaire public alimente cette liste en temps réel.
              </li>
            )}
            {recentInscriptions.map((s) => (
              <li key={s.id} className="px-5 py-3.5 flex items-center gap-4">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-logo/[0.08] text-orange-contrast shrink-0">
                  <Users className="w-4 h-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-marine-profond truncate">{s.name || "Candidat"}</p>
                  <p className="text-xs text-gris-texte mt-0.5 truncate">
                    {s.email || s.phone || "—"} · reçu le {formatDateFr(s.createdAt)}
                  </p>
                </div>
                <BoBadge tone={STATUS_TONES[s.status] ?? "neutral"}>
                  {s.status === "NOUVEAU" ? "Nouveau" : s.status === "TRAITE" ? "Traité" : "Archivé"}
                </BoBadge>
              </li>
            ))}
          </ul>
        </section>

        {/* Connexion site public */}
        <section className="rounded-xl bg-marine-profond text-white p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grain opacity-25 pointer-events-none" aria-hidden />
          <div className="relative">
            <h2 className="font-bold text-[15px] mb-4 flex items-center gap-2.5">
              <ExternalLink className="w-[18px] h-[18px] text-orange-sature" aria-hidden />
              Connecté au site public
            </h2>
            <ul className="space-y-3.5 text-[12.5px] text-white/75 leading-relaxed">
              <li>
                <strong className="text-white">Formations</strong> — toute modification
                ici est publiée instantanément sur la page Academy du site.
              </li>
              <li>
                <strong className="text-white">Articles</strong> — la page Blog du site
                lit directement vos articles publiés.
              </li>
              <li>
                <strong className="text-white">Témoignages</strong> — les témoignages
                publiés s&apos;affichent sur les pages publiques du Groupe.
              </li>
              <li>
                <strong className="text-white">Inscriptions</strong> — le formulaire
                multi-étapes du site alimente cette console en temps réel.
              </li>
            </ul>
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-[11px] text-white/50 leading-relaxed">
                SERMA HUB Impact Academy (CFPEA) · 5 filières métiers ·
                formations certifiantes · Parakou
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
