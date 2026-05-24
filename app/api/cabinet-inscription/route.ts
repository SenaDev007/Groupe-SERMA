import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { cabinetFormSchema } from "@/lib/validations";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = cabinetFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;

    console.log("[SERMA Cabinet] Inscription reçue:", JSON.stringify({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      whatsapp: data.whatsapp,
      timestamp: new Date().toISOString(),
    }));

    const toEmail = process.env.RESEND_TO_EMAIL;

    if (toEmail && process.env.RESEND_API_KEY) {
      try {
        const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nouvelle inscription Cabinet SERMA</title></head>
<body style="margin:0;padding:0;background:#05091a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#05091a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0b1527;border-radius:16px;border:1px solid rgba(245,155,30,0.2);overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d1a3a 0%,#0b1527 100%);padding:32px 36px;border-bottom:1px solid rgba(245,155,30,0.15);">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#2BA96B;">Cabinet SERMA SARL</p>
            <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">Nouvelle Inscription</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#64748b;">Formation Caissier · Samedis 15h–17h</p>
          </td>
        </tr>

        <!-- Alert badge -->
        <tr>
          <td style="padding:20px 36px 0;">
            <table cellpadding="0" cellspacing="0" style="background:rgba(43,169,107,0.1);border:1px solid rgba(43,169,107,0.3);border-radius:10px;padding:10px 16px;">
              <tr>
                <td style="font-size:12px;color:#2BA96B;font-weight:600;">
                  ✅ &nbsp;${data.prenom} ${data.nom} vient de s'inscrire à la formation Cabinet SERMA
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Participant info -->
        <tr>
          <td style="padding:24px 36px 0;">
            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#F59B1E;">Informations du participant</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#060d1f;border-radius:12px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
              ${[
                ["Nom complet", `${data.prenom} ${data.nom}`],
                ["Sexe", data.sexe],
                ["WhatsApp", data.whatsapp],
                ["E-mail", data.email],
                ["Ville", data.ville],
                ...(data.poste ? [["Poste / Entreprise", data.poste]] : []),
              ].map(([label, value], i) => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:12px 16px;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;width:40%;background:${i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"};">${label}</td>
                <td style="padding:12px 16px;font-size:13px;color:#e2e8f0;font-weight:500;background:${i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"};">${value}</td>
              </tr>`).join("")}
            </table>
          </td>
        </tr>

        <!-- Formation details -->
        <tr>
          <td style="padding:24px 36px 0;">
            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#F59B1E;">Détails de la formation</p>
            <table width="100%" cellpadding="8" cellspacing="0">
              <tr>
                <td width="50%" style="padding:8px;">
                  <div style="background:#060d1f;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#475569;font-weight:600;">Séances</p>
                    <p style="margin:0;font-size:13px;color:#ffffff;font-weight:700;">Tous les samedis</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#64748b;">15h – 17h</p>
                  </div>
                </td>
                <td width="50%" style="padding:8px;">
                  <div style="background:#060d1f;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#475569;font-weight:600;">Période</p>
                    <p style="margin:0;font-size:13px;color:#ffffff;font-weight:700;">16 Mai – 14 Juin</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#64748b;">2026</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding:8px;">
                  <div style="background:#060d1f;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#475569;font-weight:600;">Inscription</p>
                    <p style="margin:0;font-size:16px;color:#F59B1E;font-weight:800;">2 000 FCFA</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#64748b;">une fois</p>
                  </div>
                </td>
                <td width="50%" style="padding:8px;">
                  <div style="background:#060d1f;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#475569;font-weight:600;">Par séance</p>
                    <p style="margin:0;font-size:16px;color:#F59B1E;font-weight:800;">5 000 FCFA</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#64748b;">chaque samedi</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Action -->
        <tr>
          <td style="padding:24px 36px;">
            <div style="background:rgba(245,155,30,0.08);border:1px solid rgba(245,155,30,0.2);border-radius:12px;padding:16px;">
              <p style="margin:0;font-size:12px;color:#F59B1E;font-weight:600;">Action requise</p>
              <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Contacter <strong style="color:#ffffff;">${data.prenom} ${data.nom}</strong> sur WhatsApp au <strong style="color:#ffffff;">${data.whatsapp}</strong> pour confirmer la place et les modalités de paiement.</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 36px 28px;border-top:1px solid rgba(255,255,255,0.04);">
            <p style="margin:0;font-size:11px;color:#334155;text-align:center;">
              © 2026 <strong style="color:#475569;">SERMA HUB</strong> Impact Academy · Cabinet SERMA SARL
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        const { error: sendError } = await resend.emails.send({
          from: "SERMA HUB Impact Academy <noreply@academiahelm.com>",
          to: [toEmail],
          subject: `📋 Inscription Cabinet SERMA — ${data.prenom} ${data.nom}`,
          html,
          reply_to: data.email,
        });

        if (sendError) {
          console.error("[SERMA Cabinet] Erreur Resend:", JSON.stringify(sendError));
        } else {
          console.log("[SERMA Cabinet] Email envoyé.");
        }
      } catch (e) {
        console.error("[SERMA Cabinet] Exception email:", e);
      }
    }

    // Save to local database for backoffice management
    const { saveSubmission } = await import("@/lib/db");
    await saveSubmission({
      formId: "cabinet-inscription-caissier",
      formTitle: "Formulaire d'Inscription Caissier - Cabinet SERMA",
      entity: "cabinet",
      data: {
        nom: data.nom,
        prenom: data.prenom,
        sexe: data.sexe,
        whatsapp: data.whatsapp,
        email: data.email,
        ville: data.ville,
        poste: data.poste || "",
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("[SERMA Cabinet] Erreur serveur:", err);
    return NextResponse.json({ error: "Erreur serveur inattendue" }, { status: 500 });
  }
}
