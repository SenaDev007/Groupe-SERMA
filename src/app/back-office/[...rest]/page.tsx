import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable — Back-Office SERMA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Filet de sécurité : toute URL /back-office/... ne correspondant à aucune
 * route déclarée (ex. ancien favori obsolète) tombe ici et déclenche la
 * page 404 du back-office (branded, avec liens de secours) au lieu de la
 * 404 générique « This page could not be found ».
 */
export default function BackOfficeCatchAllPage() {
  notFound();
}
