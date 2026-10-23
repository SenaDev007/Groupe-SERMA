/**
 * WhatsApp — centralisation conformément au CDC §3.3 (lib/whatsapp.ts)
 * et à la micro-copy du document de copywriting (messages pré-remplis).
 */

/** Numéro WhatsApp principal du Groupe (+229 01 40 37 71 99) */
export const WHATSAPP_NUMBER = "2290140377199";

/** Ligne directe du Groupe (+229 01 96 23 73 43) — appels téléphoniques */
export const PHONE_DIRECT = "+2290196237343";
export const PHONE_DIRECT_DISPLAY = "+229 01 96 23 73 43";

/** WhatsApp affichable */
export const WHATSAPP_DISPLAY = "+229 01 40 37 71 99";

/** Construit une URL wa.me avec message pré-rempli */
export function buildWhatsAppUrl(
  message: string,
  phone: string = WHATSAPP_NUMBER
): string {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    message
  )}`;
}

/**
 * Messages pré-remplis — templates du document de copywriting
 * (section MICRO-COPY — Messages WhatsApp pré-remplis).
 */
export const WHATSAPP_MESSAGES = {
  /** Depuis la homepage Groupe */
  homepage:
    "Bonjour Groupe SERMA,\n\nJ'aimerais en savoir plus sur vos activités (Cabinet et Academy).\n\nMerci de me recontacter.",

  /** Depuis l'espace Cabinet — générique */
  cabinet:
    "Bonjour Cabinet SERMA,\n\nJe cherche un expert-comptable pour ma structure.\n\nMerci de me recontacter.",

  /** Depuis l'espace Cabinet — service ciblé */
  cabinetService: (service: string) =>
    `Bonjour Cabinet SERMA,\n\nJe cherche : ${service}.\n\nMerci de me recontacter pour prendre rendez-vous.`,

  /** Cabinet — après soumission du formulaire RDV (données du formulaire) */
  cabinetRdv: (nom: string, besoin: string, message?: string, tel?: string) =>
    `Bonjour Cabinet SERMA,\n\nJe m'appelle ${nom}.\nJe cherche : ${besoin}.${
      message ? `\n\n${message}` : ""
    }\n\nMon numéro : ${tel || "—"}`,

  /** Depuis l'espace Academy — générique */
  academy:
    "Bonjour SERMA HUB,\n\nJe suis intéressé(e) par vos filières de formation et j'aimerais avoir plus d'informations sur l'inscription.\n\nMerci de me recontacter.",

  /** Depuis l'espace Academy — filière / formation ciblée */
  academyFormation: (formation: string) =>
    `Bonjour SERMA HUB,\n\nJe suis intéressé(e) par : ${formation}.\n\nJ'aimerais connaître les modalités d'inscription et les prochaines dates.`,
} as const;
