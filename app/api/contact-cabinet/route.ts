import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

const b2bCabinetSchema = z.object({
  raisonSociale: z.string().min(2),
  whatsapp: z.string().min(8),
  email: z.string().email(),
  secteur: z.string(),
  besoin: z.string(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = b2bCabinetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;

    console.log("[Cabinet SERMA B2B] Demande de contact reçue:", JSON.stringify({
      raisonSociale: data.raisonSociale,
      email: data.email,
      whatsapp: data.whatsapp,
      besoin: data.besoin,
      timestamp: new Date().toISOString(),
    }));

    const toEmail = process.env.RESEND_TO_EMAIL;

    if (toEmail && process.env.RESEND_API_KEY) {
      try {
        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau contact B2B - Cabinet SERMA</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F6FB;font-family:'Segoe UI',Arial,sans-serif;color:#4A4E69;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6FB;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;box-shadow:0 4px 12px rgba(12,25,61,0.05);max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#0C193D;padding:32px 36px;border-bottom:3px solid #E07F0A;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#E07F0A;">Cabinet SERMA SARL</p>
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#FFFFFF;">Nouvelle Demande B2B</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#94A3B8;">Prise de contact via le site internet</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px;">
              <p style="margin:0 0 20px;font-size:15px;line-height: relaxed;color:#0C193D;font-weight:600;">
                Une nouvelle demande d'analyse de dossier a été soumise par un prospect B2B :
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6FB;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;margin-bottom:24px;">
                ${[
                  ["Structure / Nom", data.raisonSociale],
                  ["Secteur d'activité", data.secteur],
                  ["Besoin principal", data.besoin],
                  ["Adresse E-mail", data.email],
                  ["Téléphone WhatsApp", data.whatsapp],
                ].map(([label, val], idx) => `
                <tr style="${idx < 4 ? "border-bottom:1px solid #E2E8F0;" : ""}">
                  <td style="padding:14px 16px;font-size:11px;color:#4A4E69;font-weight:700;text-transform:uppercase;letter-spacing:1px;width:35%;">${label}</td>
                  <td style="padding:14px 16px;font-size:13px;color:#0C193D;font-weight:500;">${val}</td>
                </tr>
                `).join("")}
              </table>

              ${data.message ? `
              <div style="margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#4A4E69;">Description du besoin :</p>
                <div style="background-color:#F4F6FB;border-left:4px solid #E07F0A;padding:16px;border-radius:0 12px 12px 0;font-size:13px;line-height:1.6;color:#0C193D;white-space:pre-wrap;">${data.message}</div>
              </div>
              ` : ""}

              <div style="background-color:rgba(224,127,10,0.08);border:1px solid rgba(224,127,10,0.25);border-radius:12px;padding:16px;text-align:center;margin-top:8px;">
                <p style="margin:0;font-size:12px;color:#C86E09;font-weight:700;">Action requise</p>
                <p style="margin:6px 0 0;font-size:13px;color:#0C193D;line-height:1.5;">
                  Veuillez recontacter ce prospect sous 24h ouvrées par e-mail ou sur son WhatsApp au <strong>${data.whatsapp}</strong>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;background-color:#0C193D;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="margin:0;font-size:11px;color:#94A3B8;">
                © ${new Date().getFullYear()} Cabinet SERMA SARL · Groupe SERMA
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        const { error: sendError } = await resend.emails.send({
          from: "Cabinet SERMA SARL <noreply@academiahelm.com>", // Make sure sending domain is verified on Resend
          to: [toEmail],
          subject: `[Cabinet SERMA B2B] Nouveau lead — ${data.besoin} — ${data.raisonSociale}`,
          html,
          reply_to: data.email,
        });

        if (sendError) {
          console.error("[Cabinet SERMA B2B] Erreur Resend:", JSON.stringify(sendError));
        } else {
          console.log("[Cabinet SERMA B2B] E-mail envoyé avec succès.");
        }
      } catch (e) {
        console.error("[Cabinet SERMA B2B] Exception lors de l'envoi de l'e-mail:", e);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("[Cabinet SERMA B2B] Erreur serveur:", err);
    return NextResponse.json({ error: "Erreur serveur inattendue" }, { status: 500 });
  }
}
