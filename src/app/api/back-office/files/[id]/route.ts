import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

/** Répertoire des fichiers : fonctionne quel que soit le répertoire de
 *  travail (dev, build standalone lancé depuis la racine du projet…). */
function resolveUploadDir(): string {
  const candidates = [
    process.env.BO_UPLOAD_DIR,
    path.join(process.cwd(), "upload", "bo-files"),
    path.join(process.cwd(), "..", "upload", "bo-files"),
    path.join(process.cwd(), "../..", "upload", "bo-files"),
  ].filter((p): p is string => !!p);
  for (const c of candidates) {
    try {
      if (fsSync.existsSync(c)) return c;
    } catch {
      /* continuer */
    }
  }
  return candidates[0] ?? path.join(process.cwd(), "upload", "bo-files");
}
const UPLOAD_DIR = resolveUploadDir();

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

  // Sécurité : basename uniquement, aucun traversal possible
  const safePath = path.join(UPLOAD_DIR, path.basename(doc.filePath));

  try {
    const data = await fs.readFile(safePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.name)}"`,
        "Content-Length": String(data.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Fichier physique introuvable sur le serveur." },
      { status: 404 }
    );
  }
}
