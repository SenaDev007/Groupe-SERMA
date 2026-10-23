import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildBoSnapshot } from "@/lib/back-office/snapshot";

export const dynamic = "force-dynamic";

/**
 * GET /api/back-office/snapshot
 * Instantané complet des données du back-office (requête authentifiée).
 * Utilisé par le moteur offline pour l'amorçage et le rafraîchissement.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  try {
    const snapshot = await buildBoSnapshot();
    return NextResponse.json(
      { serverTime: new Date().toISOString(), snapshot },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("[snapshot] échec :", e);
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }
}
