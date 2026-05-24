import { NextRequest, NextResponse } from "next/server";
import { getForms, saveForm, deleteForm } from "@/lib/db";

// Helper function to verify admin session
function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return session === "serma_admin_token_2026";
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const forms = await getForms();
    return NextResponse.json(forms);
  } catch (err) {
    console.error("GET Forms error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const form = await req.json();
    if (!form.id || !form.title || !form.entity || !Array.isArray(form.fields)) {
      return NextResponse.json(
        { error: "Données de formulaire invalides. L'id, le titre, l'entité et les champs sont requis." },
        { status: 400 }
      );
    }

    await saveForm(form);
    return NextResponse.json({ success: true, form });
  } catch (err) {
    console.error("POST Form error:", err);
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

    const success = await deleteForm(id);
    if (!success) {
      return NextResponse.json({ error: "Formulaire non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Form error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
