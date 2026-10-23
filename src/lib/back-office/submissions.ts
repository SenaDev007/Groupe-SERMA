import prisma from "@/lib/prisma";

/**
 * Pont site public → back-office.
 * Enregistre une soumission de formulaire public dans la base du back-office
 * (boîte de réception Cabinet ou Academy). Ne lève jamais d'exception :
 * une défaillance de ce pont ne doit jamais bloquer la soumission publique.
 */

export type SubmissionSource =
  | "CONTACT_CABINET"
  | "RDV_CABINET"
  | "INSCRIPTION_ACADEMY";

export async function saveSubmissionToDb(input: {
  source: SubmissionSource;
  entity: "CABINET" | "ACADEMY";
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  payload: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.submission.create({
      data: {
        source: input.source,
        entity: input.entity,
        name: input.name ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        payload: JSON.stringify(input.payload),
        status: "NOUVEAU",
      },
    });
  } catch (err) {
    console.error("[BACK-OFFICE] Échec de l'enregistrement de la soumission :", err);
  }
}
