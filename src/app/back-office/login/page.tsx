import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BO_PATHS } from "@/lib/back-office/constants";
import { LoginForm } from "@/components/back-office/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — Back-Office SERMA",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Déjà connecté ? → directement vers le choix d'espace
  const session = await getSession();
  if (session) redirect(BO_PATHS.selection);

  return <LoginForm />;
}
