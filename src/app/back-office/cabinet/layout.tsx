import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BO_PATHS } from "@/lib/back-office/constants";
import { buildBoSnapshot } from "@/lib/back-office/snapshot";
import { BoShell } from "@/components/back-office/BoShell";
import { BoDataProvider } from "@/components/back-office/pwa/BoDataProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cabinet SERMA — Cockpit",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect(BO_PATHS.login);

  // Amorçage du moteur offline : instantané serveur complet
  // (ignoré côté client si des mutations locales sont en attente)
  const snapshot = await buildBoSnapshot();

  return (
    <BoShell entity="cabinet" user={{ name: session.name, email: session.email }}>
      <BoDataProvider snapshot={snapshot} seedAt={new Date().toISOString()}>
        {children}
      </BoDataProvider>
    </BoShell>
  );
}
