import type { FullFormData } from "./validations";

export function generateEmailHTML(data: FullFormData): string {
  const {
    nom,
    prenom,
    sexe,
    whatsapp,
    email,
    ville,
    statut,
    domaine,
    niveauEtudes,
    modules,
    source,
    motivation,
    attentes,
    attestation,
  } = data;

  const waNumber = (() => {
    let n = whatsapp.replace(/[\s\-\(\)\.+]/g, "");
    if (n.startsWith("229")) n = n.slice(3);
    if (n.startsWith("01")) n = n.slice(2);
    if (n.startsWith("0")) n = n.slice(1);
    return "229" + n;
  })();

  const waText = encodeURIComponent(
    `Bonjour ${prenom}, nous avons bien reçu votre inscription à la formation SERMA HUB Impact Academy (07-09 Mai 2026). Nous vous contactons pour confirmer votre place.`
  );
  const waDeepLink = `https://wa.me/${waNumber}?text=${waText}`;

  const modulesList = modules
    .map(
      (m) =>
        `<tr><td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:20px;vertical-align:top;padding-top:1px;">
              <div style="width:6px;height:6px;border-radius:50%;background-color:#F59B1E;margin-top:5px;"></div>
            </td>
            <td style="color:#e2e8f0;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">${m}</td>
          </tr></table>
        </td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouvelle inscription — SERMA HUB Impact Academy</title>
</head>
<body style="margin:0;padding:0;background-color:#05091a;font-family:Arial,'Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#05091a;padding:40px 16px 56px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- PRE-HEADER SPACER -->
          <tr><td style="height:8px;"></td></tr>

          <!-- ══════════════════════════════════════════
               HEADER
          ══════════════════════════════════════════ -->
          <tr>
            <td style="background-color:#0b1527;border-radius:16px 16px 0 0;padding:48px 48px 36px;text-align:center;border-bottom:2px solid #F59B1E;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:11px;letter-spacing:5px;color:#2BA96B;font-weight:700;text-transform:uppercase;font-family:Arial,sans-serif;">Impact Academy</p>
                    <p style="margin:10px 0 0;font-size:34px;font-weight:800;letter-spacing:1.5px;line-height:1;font-family:Arial,sans-serif;">
                      <span style="color:#ffffff;">SERMA</span><span style="color:#F59B1E;"> HUB</span>
                    </p>
                    <div style="margin:24px auto 0;width:40px;height:2px;background:linear-gradient(90deg,transparent,rgba(245,155,30,0.5),transparent);"></div>
                    <p style="margin:20px 0 0;font-size:18px;font-weight:700;color:#F59B1E;letter-spacing:0.3px;font-family:Arial,sans-serif;">Nouvelle Inscription Reçue</p>
                    <p style="margin:10px 0 0;font-size:13px;color:#64748b;letter-spacing:0.5px;font-family:Arial,sans-serif;">Jeudi 07 · Vendredi 08 · Samedi 09 Mai 2026</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#475569;font-family:Arial,sans-serif;">Présentiel &amp; En ligne · Places limitées</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════════════════════════════════════════
               PAYMENT CTA BANNER
          ══════════════════════════════════════════ -->
          <tr>
            <td style="background-color:#0e1e10;padding:20px 48px;border-bottom:1px solid rgba(43,169,107,0.15);">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:3px;color:#2BA96B;font-weight:700;text-transform:uppercase;font-family:Arial,sans-serif;">Paiement de la caution</p>
                    <p style="margin:0 0 14px;font-size:13px;color:#94a3b8;font-family:Arial,sans-serif;line-height:1.5;">Une caution de <strong style="color:#F59B1E;">2 000 FCFA</strong> est requise pour confirmer la place de ce participant. Cliquez ci-dessous pour accéder à la page de paiement sécurisé.</p>
                    <a href="https://me.fedapay.com/eUT2Wc_i" style="display:block;background-color:#F59B1E;color:#05091a;font-size:14px;font-weight:800;text-decoration:none;padding:14px 24px;border-radius:10px;text-align:center;letter-spacing:0.5px;font-family:Arial,sans-serif;">
                      Payer la caution — 2 000 FCFA
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════════════════════════════════════════
               SECTION 1 — INFORMATIONS PERSONNELLES
          ══════════════════════════════════════════ -->
          <tr>
            <td style="background-color:#0b1527;padding:32px 48px 8px;border-top:1px solid rgba(255,255,255,0.04);">
              ${sectionHeading("Informations personnelles")}
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${row("Nom complet", `${prenom} ${nom}`)}
                ${row("Sexe", sexe)}
                ${row("WhatsApp", whatsapp)}
                ${row("Email", email)}
                ${row("Ville de résidence", ville)}
              </table>
            </td>
          </tr>

          <!-- WHATSAPP BUTTON -->
          <tr>
            <td style="background-color:#0b1527;padding:16px 48px 32px;">
              <a href="${waDeepLink}" style="display:block;background-color:#128c7e;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:10px;text-align:center;letter-spacing:0.3px;font-family:Arial,sans-serif;">
                <table cellpadding="0" cellspacing="0" role="presentation" align="center" style="margin:0 auto;">
                  <tr>
                    <td style="vertical-align:middle;padding-right:10px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" style="display:block;">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </td>
                    <td style="vertical-align:middle;color:#ffffff;font-size:14px;font-weight:700;white-space:nowrap;font-family:Arial,sans-serif;">
                      Ouvrir la discussion WhatsApp
                    </td>
                  </tr>
                </table>
              </a>
              <p style="margin:10px 0 0;color:#475569;font-size:11px;text-align:center;font-family:Arial,sans-serif;">
                ${whatsapp} &rarr; <span style="color:#25D366;">+${waNumber}</span>
              </p>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr><td style="background-color:#0b1527;padding:0 48px;"><div style="height:1px;background:rgba(255,255,255,0.05);"></div></td></tr>

          <!-- ══════════════════════════════════════════
               SECTION 2 — PROFIL PROFESSIONNEL
          ══════════════════════════════════════════ -->
          <tr>
            <td style="background-color:#0b1527;padding:32px 48px 8px;">
              ${sectionHeading("Profil professionnel")}
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${row("Statut", statut)}
                ${row("Domaine / Secteur", domaine)}
                ${row("Niveau d'études", niveauEtudes)}
              </table>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr><td style="background-color:#0b1527;padding:0 48px;"><div style="height:1px;background:rgba(255,255,255,0.05);"></div></td></tr>

          <!-- ══════════════════════════════════════════
               SECTION 3 — MODULES & SOURCE
          ══════════════════════════════════════════ -->
          <tr>
            <td style="background-color:#0b1527;padding:32px 48px 8px;">
              ${sectionHeading("Modules choisis")}
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:4px 0 4px 12px;border-left:2px solid rgba(245,155,30,0.3);">
                    <p style="margin:0 0 10px;font-size:10px;letter-spacing:2px;color:#64748b;text-transform:uppercase;font-family:Arial,sans-serif;">Sélectionnés</p>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      ${modulesList}
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${row("Source de découverte", source)}
              </table>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr><td style="background-color:#0b1527;padding:0 48px;"><div style="height:1px;background:rgba(255,255,255,0.05);"></div></td></tr>

          <!-- ══════════════════════════════════════════
               SECTION 4 — MOTIVATION & ATTENTES
          ══════════════════════════════════════════ -->
          <tr>
            <td style="background-color:#0b1527;padding:32px 48px 8px;">
              ${sectionHeading("Motivation & Attentes")}
              ${blockRow("Motivation", motivation)}
              ${attentes ? blockRow("Attentes concrètes", attentes) : ""}
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${row("Attestation souhaitée (3 000 FCFA)", attestation)}
              </table>
            </td>
          </tr>

          <!-- BOTTOM PADDING -->
          <tr><td style="background-color:#0b1527;height:24px;"></td></tr>

          <!-- ══════════════════════════════════════════
               FOOTER
          ══════════════════════════════════════════ -->
          <tr>
            <td style="background-color:#080f20;border-radius:0 0 16px 16px;padding:28px 48px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:11px;color:#334155;font-family:Arial,sans-serif;line-height:1.7;">
                Email généré automatiquement · Formulaire d'inscription en ligne<br/>
                <strong style="color:#F59B1E;">SERMA HUB Impact Academy</strong>
                <span style="color:#1e2d4a;"> · </span>
                <span style="color:#334155;">01 40 37 71 99</span>
              </p>
              <p style="margin:10px 0 0;font-size:10px;color:#1e3050;font-family:Arial,sans-serif;line-height:1.6;">
                Zongo 2, von AXE BENI CHIC – PRESIDO<br/>à 100 m du carrefour après EPP La SOURCE
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`.trim();
}

function sectionHeading(title: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
      <tr>
        <td>
          <p style="margin:0;font-size:10px;letter-spacing:3px;color:#F59B1E;font-weight:700;text-transform:uppercase;font-family:Arial,sans-serif;">${title}</p>
          <div style="margin-top:8px;height:1px;background:linear-gradient(90deg,rgba(245,155,30,0.3),transparent);"></div>
        </td>
      </tr>
    </table>
  `;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="42%" style="vertical-align:top;padding-right:12px;">
              <p style="margin:0;font-size:10px;letter-spacing:1.5px;color:#475569;text-transform:uppercase;font-family:Arial,sans-serif;padding-top:1px;">${label}</p>
            </td>
            <td style="vertical-align:top;">
              <p style="margin:0;font-size:13px;color:#e2e8f0;font-weight:500;font-family:Arial,sans-serif;line-height:1.5;">${value}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function blockRow(label: string, value: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:1.5px;color:#475569;text-transform:uppercase;font-family:Arial,sans-serif;">${label}</p>
          <div style="background-color:#060d1f;border-radius:8px;border-left:2px solid #2BA96B;padding:14px 16px;">
            <p style="margin:0;font-size:13px;color:#cbd5e1;line-height:1.75;font-family:Arial,sans-serif;">${value.replace(/\n/g, "<br/>")}</p>
          </div>
        </td>
      </tr>
    </table>
  `;
}
