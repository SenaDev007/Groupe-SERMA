import { SignJWT, jwtVerify } from "jose";

/**
 * JETONS D'ACCÈS AUX FICHIERS OFFICE — Cabinet SERMA.
 *
 * Les applications Microsoft Office de bureau (Excel, Word) lancées via les
 * schémas d'URI officiels (ms-excel: / ms-word:) téléchargent le fichier
 * elles-mêmes — elles ne partagent PAS les cookies du navigateur. Comme
 * OneDrive avec « Ouvrir dans l'application », on leur fournit une URL
 * signée à durée limitée qui sert le vrai fichier sans exposer publiquement
 * l'API authentifiée.
 */

const OFFICE_TOKEN_MAX_AGE = 60 * 60 * 6; // 6 heures de session de travail

function getSecret(): Uint8Array {
  const secret =
    process.env.BO_SESSION_SECRET ||
    process.env.DATABASE_URL + "|groupe-serma-bo|dev-secret";
  return new TextEncoder().encode(secret);
}

/** Signe un jeton d'accès au fichier Office du document (id + péremption). */
export async function signOfficeFileToken(docId: string): Promise<string> {
  return new SignJWT({ docId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${OFFICE_TOKEN_MAX_AGE}s`)
    .sign(getSecret());
}

/** Vérifie un jeton d'accès pour un document donné. */
export async function verifyOfficeFileToken(
  token: string,
  docId: string
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
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
