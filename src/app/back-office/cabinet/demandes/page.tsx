import prisma from "@/lib/prisma";
import { BoPageHeader, BoBadge, STATUS_TONES, BoEmptyState } from "@/components/back-office/BoKit";
import { formatDateFr, SUBMISSION_SOURCES } from "@/lib/back-office/constants";
import { SubmissionsInbox } from "@/components/back-office/SubmissionsInbox";
import { Inbox } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demandes reçues — Cabinet",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CabinetDemandesPage() {
  const submissions = await prisma.submission.findMany({
    where: { entity: "CABINET" },
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
        title="Demandes reçues du site public"
        description="Messages du formulaire de contact et demandes de rendez-vous envoyés depuis les pages publiques du cabinet — traités ici, dans le cockpit."
      />

      {rows.length === 0 ? (
        <BoEmptyState
          icon={Inbox}
          title="Aucune demande pour le moment"
          description="Les soumissions du formulaire de contact et des demandes de rendez-vous apparaîtront ici en temps réel."
        />
      ) : (
        <SubmissionsInbox submissions={rows} scope="cabinet" />
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
