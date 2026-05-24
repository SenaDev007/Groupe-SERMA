import { NextRequest, NextResponse } from "next/server";
import { getSubmissions, deleteSubmission } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return session === "serma_admin_token_2026";
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const submissions = await getSubmissions();
    return NextResponse.json(submissions);
  } catch (err) {
    console.error("GET Submissions error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const success = await deleteSubmission(id);
    if (!success) {
      return NextResponse.json({ error: "Soumission non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Submission error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
