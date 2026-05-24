import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { fullFormSchema } from "@/lib/validations";
import { generateEmailHTML } from "@/lib/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = fullFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;

    console.log("[SERMA HUB] Paiement confirmé — envoi email:", JSON.stringify({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      timestamp: new Date().toISOString(),
    }));

    const toEmail = process.env.RESEND_TO_EMAIL;

    if (toEmail && process.env.RESEND_API_KEY) {
      try {
        const html = generateEmailHTML(data);
        const { data: sendData, error: sendError } = await resend.emails.send({
          from: "SERMA HUB Impact Academy <noreply@academiahelm.com>",
          to: [toEmail],
          subject: `✅ Paiement confirmé — ${data.prenom} ${data.nom}`,
          html,
          reply_to: data.email,
        });

        if (sendError) {
          console.error("[SERMA HUB] Erreur Resend:", JSON.stringify(sendError));
        } else {
          console.log("[SERMA HUB] Email envoyé après paiement. ID:", sendData?.id);
        }
      } catch (e) {
        console.error("[SERMA HUB] Exception email:", e);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("[SERMA HUB] Erreur serveur:", err);
    return NextResponse.json({ error: "Erreur serveur inattendue" }, { status: 500 });
  }
}
