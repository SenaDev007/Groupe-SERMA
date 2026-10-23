import prisma from "@/lib/prisma";
import { BoPageHeader, BoEmptyState } from "@/components/back-office/BoKit";
import { SUBMISSION_SOURCES } from "@/lib/back-office/constants";
import { SubmissionsInbox } from "@/components/back-office/SubmissionsInbox";
import { ClipboardList } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscriptions — Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AcademyInscriptionsPage() {
  const submissions = await prisma.submission.findMany({
    where: { entity: "ACADEMY" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const rows = submissions.map((s) => ({
    id: s.id,
    source: SUBMISSION_SOURCES[s.source] ?? s.source,
    name: s.name,
    email: s.email,
    phone: s.phone,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    payload: safeParse(s.payload),
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <BoPageHeader
        eyebrow="Boîte de réception"
        title="Inscriptions reçues du site public"
        description="Chaque inscription envoyée via le formulaire multi-étapes de l'Academy arrive ici : profil, filière choisie, disponibilité et financement — à traiter au cas par cas."
      />

      {rows.length === 0 ? (
        <BoEmptyState
          icon={ClipboardList}
          title="Aucune inscription pour le moment"
          description="Les inscriptions soumises depuis la page publique de l'Academy apparaîtront ici en temps réel."
        />
      ) : (
        <SubmissionsInbox submissions={rows} scope="academy" />
      )}
    </div>
  );
}

function safeParse(payload: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(payload);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
