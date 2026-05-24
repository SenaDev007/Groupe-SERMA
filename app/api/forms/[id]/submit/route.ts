import { NextRequest, NextResponse } from "next/server";
import { getFormById, saveSubmission } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const form = await getFormById(id);

    if (!form) {
      return NextResponse.json(
        { error: "Formulaire non trouvé" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Basic server-side validation based on fields config
    const errors: Record<string, string> = {};
    for (const field of form.fields) {
      const val = body[field.id];
      if (field.required && (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0))) {
        errors[field.id] = "Ce champ est obligatoire";
      } else if (val) {
        if (field.type === "email" && !/\S+@\S+\.\S+/.test(val)) {
          errors[field.id] = "Adresse email invalide";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Données invalides", details: errors },
        { status: 422 }
      );
    }

    // Save the submission
    const submission = await saveSubmission({
      formId: form.id,
      formTitle: form.title,
      entity: form.entity,
      data: body,
    });

    console.log(`[SERMA Custom Form: ${form.title}] Inscription reçue:`, JSON.stringify(submission));

    // Send email notification to admin via Resend
    const toEmail = process.env.RESEND_TO_EMAIL;
    if (toEmail && process.env.RESEND_API_KEY) {
      try {
        const entityLabel = form.entity === "academy" ? "Academy" : "Cabinet";
        
        // Build the HTML list of fields dynamically
        const fieldsHtml = form.fields.map((field) => {
          let value = body[field.id];
          if (Array.isArray(value)) {
            value = value.join(", ");
          } else if (typeof value === "boolean") {
            value = value ? "Oui" : "Non";
          }
          return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
              <td style="padding:12px 16px;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;width:40%;">${field.label}</td>
              <td style="padding:12px 16px;font-size:13px;color:#e2e8f0;font-weight:500;">${value || "-"}</td>
            </tr>
          `;
        }).join("");

        const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nouvelle inscription - ${form.title}</title></head>
<body style="margin:0;padding:0;background:#05091a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#05091a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0b1527;border-radius:16px;border:1px solid rgba(245,155,30,0.2);overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d1a3a 0%,#0b1527 100%);padding:32px 36px;border-bottom:1px solid rgba(245,155,30,0.15);">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#F59B1E;">GROUPE SERMA - ${entityLabel}</p>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">${form.title}</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#64748b;">Nouvelle soumission via le formulaire dynamique</p>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding:24px 36px 0;">
            <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#2BA96B;">Détails de la soumission</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#060d1f;border-radius:12px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
              ${fieldsHtml}
            </table>
          </td>
        </tr>

        ${
          form.price && form.price > 0
            ? `
        <!-- Pricing info -->
        <tr>
          <td style="padding:24px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(245,155,30,0.05);border:1px solid rgba(245,155,30,0.15);border-radius:10px;padding:12px 16px;">
              <tr>
                <td style="font-size:13px;color:#e2e8f0;">
                  Tarif associé : <strong style="color:#F59B1E;">${form.price.toLocaleString("fr-FR")} FCFA</strong>
                  ${form.paymentLink ? `<br /><a href="${form.paymentLink}" style="color:#2BA96B;text-decoration:underline;font-weight:600;">Lien de paiement associé</a>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        `
            : ""
        }

        <!-- Footer -->
        <tr>
          <td style="padding:16px 36px 28px;border-top:1px solid rgba(255,255,255,0.04);margin-top:24px;">
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

        const replyToEmail = body.email || body.Email || body.mail || body.Mail;

        await resend.emails.send({
          from: "SERMA HUB Custom Forms <noreply@academiahelm.com>",
          to: [toEmail],
          subject: `📋 Formulaire ${entityLabel} : ${form.title}`,
          html,
          ...(replyToEmail ? { reply_to: replyToEmail } : {}),
        });
      } catch (emailErr) {
        console.error("Error sending notification email for dynamic form:", emailErr);
      }
    }

    return NextResponse.json({ success: true, submission });
  } catch (err) {
    console.error("Public submission endpoint error:", err);
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    );
  }
}
