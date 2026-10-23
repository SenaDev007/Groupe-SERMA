import prisma from "@/lib/prisma";
import { BoPageHeader } from "@/components/back-office/BoKit";
import { FormationsView, type FormationRow } from "@/components/back-office/FormationsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formations — Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FormationsPage() {
  const formations = await prisma.formation.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const rows: FormationRow[] = formations.map((f) => ({
    id: f.id,
    title: f.title,
    hook: f.hook,
    description: f.description,
    category: f.category,
    duration: f.duration,
    price: f.price,
    level: f.level,
    skills: parseSkills(f.skills),
    outcome: f.outcome,
    status: f.status,
    order: f.order,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <BoPageHeader
        eyebrow="Contenus du site"
        title="Filières & formations"
        description="Les formations gérées ici alimentent directement la page Academy du site public : filières métiers (6 mois) et formations courtes (3 jours)."
      />
      <FormationsView formations={rows} />
    </div>
  );
}

function parseSkills(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((s) => String(s)).filter(Boolean);
  } catch {
    // ignore
  }
  return [];
}
