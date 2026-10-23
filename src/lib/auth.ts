import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Session back-office Groupe SERMA.
 * Cookie httpOnly signé (JWT HS256) — aucune donnée sensible côté client.
 */

export const BO_SESSION_COOKIE = "serma_bo_session";
export const BO_ENTITY_COOKIE = "serma_bo_entity";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

export interface BoSession {
  userId: string;
  email: string;
  name: string;
  role: string;
}

function getSecret(): Uint8Array {
  const secret =
    process.env.BO_SESSION_SECRET ||
    process.env.DATABASE_URL + "|groupe-serma-bo|dev-secret";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: BoSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<BoSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: String(payload.userId || ""),
      email: String(payload.email || ""),
      name: String(payload.name || ""),
      role: String(payload.role || "LECTEUR"),
    };
  } catch {
    return null;
  }
}

/** Lit la session courante (mise en cache par requête). */
export const getSession = cache(async (): Promise<BoSession | null> => {
  const store = await cookies();
  const token = store.get(BO_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
});

/** Entité sélectionnée après login : "cabinet" | "academy". */
export async function getSelectedEntity(): Promise<"cabinet" | "academy" | null> {
  const store = await cookies();
  const value = store.get(BO_ENTITY_COOKIE)?.value;
  return value === "cabinet" || value === "academy" ? value : null;
}

export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE;
