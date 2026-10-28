import { createHmac, timingSafeEqual } from "crypto";
import { jwtVerify } from "jose";

/**
 * JETONS D'ACCÈS AUX FICHIERS OFFICE — Cabinet SERMA.
 *
 * Les applications Microsoft Office de bureau (Excel, Word) lancées via les
 * schémas d'URI officiels (ms-excel: / ms-word:) téléchargent le fichier
 * elles-mêmes — elles ne partagent PAS les cookies du navigateur. Comme
 * OneDrive avec « Ouvrir dans l'application », on leur fournit une URL
 * signée à durée limitée qui sert le vrai fichier sans exposer publiquement
 * l'API authentifiée.
 *
 * ⚠️ FORMAT COMPACT — LIMITE MICROSOFT OFFICE [MS-OFFURI] §1.7 :
 * « For URI command arguments, the maximum path length is 256 characters
 * for all apps except Excel, where the limit is 216. »
 * Un JWT HS256 classique (header + payload + signature ≈ 158 caractères)
 * portait l'URL à ~251 caractères → Excel REFUSAIT la commande
 * (« Office ne reconnaît pas la commande ») alors même que le protocole
 * avait correctement lancé l'application.
 *
 * Le jeton est donc un format signé minimaliste :
 *     <expiration base36>.<HMAC-SHA256 tronqué à 16 octets, base64url>
 * soit ~29 caractères → URL complète ≈ 122 caractères, très en dessous de
 * la limite Excel (marge de sécurité pour tout domaine/identifiant).
 * Security : HMAC tronqué à 128 bits + expiration 6 h — inviolable en
 * pratique pour un lien de téléchargement temporaires.
 */

const OFFICE_TOKEN_MAX_AGE = 60 * 60 * 6; // 6 heures de session de travail

function getSecretString(): string {
  return (
    process.env.BO_SESSION_SECRET ||
    process.env.DATABASE_URL + "|groupe-serma-bo|dev-secret"
  );
}

/** MAC du couple (document, expiration) — 16 octets (128 bits) suffisants. */
function officeMac(docId: string, exp36: string): Buffer {
  return createHmac("sha256", getSecretString())
    .update(`${docId}.${exp36}`)
    .digest()
    .subarray(0, 16);
}

function b64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

/** Signe un jeton d'accès compact (~29 caractères) pour le document. */
export async function signOfficeFileToken(docId: string): Promise<string> {
  const exp36 = (
    Math.floor(Date.now() / 1000) + OFFICE_TOKEN_MAX_AGE
  ).toString(36);
  return `${exp36}.${b64url(officeMac(docId, exp36))}`;
}

/** Vérifie un jeton d'accès pour un document donné. */
export async function verifyOfficeFileToken(
  token: string,
  docId: string
): Promise<boolean> {
  const t = token.trim();

  // ── Format compact actuel ──
  const m = /^([0-9a-z]{4,10})\.([A-Za-z0-9_-]{16,32})$/.exec(t);
  if (m) {
    const expMs = parseInt(m[1], 36) * 1000;
    if (!Number.isFinite(expMs) || expMs < Date.now()) return false;
    const expected = b64url(officeMac(docId, m[1]));
    const a = Buffer.from(m[2]);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  // ── Ancien format JWT (liens émis avant le raccourcissement) ──
  // Transition en douceur : aucune page ouverte ne doit se retrouver
  // avec un lien mort juste après le déploiement.
  try {
    const { payload } = await jwtVerify(
      t,
      new TextEncoder().encode(getSecretString())
    );
    return String(payload.docId || "") === docId;
  } catch {
    return false;
  }
}

/**
 * Chemin (relatif) de l'URL Office signée d'un document. Le composant
 * client la résout en URL absolue (origine courant) au moment de lancer
 * Excel / Word — fonctionne en local comme sur le domaine public.
 */
export function officeFilePath(docId: string, token: string): string {
  return `/api/back-office/files/${docId}/office?token=${encodeURIComponent(token)}`;
}
