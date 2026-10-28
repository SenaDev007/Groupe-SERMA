import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyOfficeFileToken } from "@/lib/office/token";
import { readBoFile } from "@/lib/office/storage";

/**
 * GET /api/back-office/files/[id]/office?token=…
 *
 * Sert le VRAI fichier Microsoft (.xlsx / .docx) aux applications Office
 * de bureau lancées via les schémas d'URI officiels (ms-excel:ofe|u|…,
 * ms-word:ofe|u|…) — exactement le mécanisme « Ouvrir dans l'application »
 * de OneDrive / SharePoint.
 *
 * Les applications Office ne transmettant pas les cookies du navigateur,
 * l'accès est contrôlé par un jeton signé compact (HMAC, 6 h) émis côté
 * page document pour l'utilisateur authentifié — compact car Excel limite
 * l'URL des commandes URI à 216 caractères ([MS-OFFURI] §1.7).
 */

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Jeton signé obligatoire — aucun fichier n'est servi sans autorisation.
  const token = new URL(request.url).searchParams.get("token");
  if (!token || !(await verifyOfficeFileToken(token, id))) {
    return NextResponse.json(
      { error: "Lien d'accès au fichier invalide ou expiré." },
      { status: 401 }
    );
  }

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || !doc.filePath) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  // Disque local d'abord, puis octets archivés en base (Vercel : FS en
  // lecture seule — les fichiers y vivent dans la table BoFile).
  const data = await readBoFile(id, doc.filePath);
  if (!data) {
    return NextResponse.json(
      { error: "Fichier physique introuvable sur le serveur." },
      { status: 404 }
    );
  }

  const isWord =
    doc.mimeType?.includes("wordprocessingml") || /\.docx?$/i.test(doc.name);
  const contentType =
    doc.mimeType ||
    (isWord
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // « inline » : Office ouvre le document directement (pas de boîte
      // de téléchargement) ; nom de fichier RFC 5987 pour les accents.
      "Content-Disposition": `inline; filename="${asciiFallback(doc.name)}"; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
      "Content-Length": String(data.length),
      "Cache-Control": "private, no-store",
      // Office valide parfois l'existence du fichier via HEAD / OPTIONS :
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Expose-Headers": "Content-Disposition, Content-Length",
    },
  });
}

/** Nom de repli ASCII (noms accentués → tirets). */
function asciiFallback(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 ._\-$()]/g, "-")
      .slice(0, 120) || "document"
  );
}

export async function HEAD(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const res = await GET(request, ctx);
  return new NextResponse(null, {
    status: res.status,
    headers: res.headers,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    },
  });
}
