import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { readBoFile } from "@/lib/office/storage";

/**
 * Téléchargement sécurisé des fichiers du back-office.
 * Authentification requise — aucun fichier n'est servi publiquement.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { id } = await params;
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

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.name)}"`,
      "Content-Length": String(data.length),
      "Cache-Control": "private, no-store",
    },
  });
}
