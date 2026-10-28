import { redirect } from "next/navigation";
import { getSession, getSelectedEntity } from "@/lib/auth";
import { BO_PATHS } from "@/lib/back-office/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Back-Office — Groupe SERMA",
  robots: { index: false, follow: false },
};

// Route d'entrée du back-office : oriente vers la connexion, le choix
// d'espace ou directement le cockpit de l'entité déjà sélectionnée.
// (Avant, cette URL renvoyait une 404 car aucune page n'existait ici.)
export const dynamic = "force-dynamic";

export default async function BackOfficeRootPage() {
  const session = await getSession();
  if (!session) redirect(BO_PATHS.login);

  const entity = await getSelectedEntity();
  if (entity === "cabinet") redirect(BO_PATHS.cabinet);
  if (entity === "academy") redirect(BO_PATHS.academy);

  redirect(BO_PATHS.selection);
}
