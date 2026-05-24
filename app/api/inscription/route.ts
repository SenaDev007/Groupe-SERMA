import { NextRequest, NextResponse } from "next/server";
import { fullFormSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { skipEmail: _skip, ...formFields } = body;

    const parsed = fullFormSchema.safeParse(formFields);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;

    console.log("[SERMA HUB] Inscription reçue (paiement en attente):", JSON.stringify({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      whatsapp: data.whatsapp,
      ville: data.ville,
      modules: data.modules,
      timestamp: new Date().toISOString(),
    }));

    // Save to local database for backoffice management
    const { saveSubmission } = await import("@/lib/db");
    await saveSubmission({
      formId: "academy-inscription-free",
      formTitle: "Formulaire d'Inscription Gratuite - SERMA Academy",
      entity: "academy",
      data: {
        nom: data.nom,
        prenom: data.prenom,
        sexe: data.sexe,
        ville: data.ville,
        email: data.email,
        whatsapp: data.whatsapp,
        statut: data.statut,
        domaine: data.domaine,
        niveauEtudes: data.niveauEtudes,
        motivation: data.motivation,
        attentes: data.attentes || "",
        attestation: data.attestation,
        modules: data.modules,
        source: data.source,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("[SERMA HUB] Erreur serveur:", err);
    return NextResponse.json({ error: "Erreur serveur inattendue" }, { status: 500 });
  }
}
