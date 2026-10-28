import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dossier client — Back-Office SERMA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Compatibilité anciens favoris : avant la migration vers l'explorateur de
 * dossiers libre, les pages étaient de la forme /clients/<id>/<yearId>.
 * Toute URL de ce genre (et tout sous-chemin inconnu d'un client) est
 * redirigée vers la fiche client actuelle, qui contient l'explorateur
 * de fichiers et les missions.
 */
export default async function ClientLegacyRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/back-office/cabinet/clients/${id}`);
}
