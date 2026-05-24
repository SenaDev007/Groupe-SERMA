import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password, action } = await req.json();

    // If logging out
    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0), // expire immediately
      });
      return response;
    }

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "SERMA_admin_2026!";

    if (username === expectedUsername && password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      // Set the session cookie
      response.cookies.set("admin_session", "serma_admin_token_2026", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
      return response;
    }

    return NextResponse.json(
      { error: "Identifiants incorrects" },
      { status: 401 }
    );
  } catch (err) {
    console.error("Admin Auth API error:", err);
    return NextResponse.json(
      { error: "Une erreur interne est survenue" },
      { status: 500 }
    );
  }
}

// Support GET for status check
export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  const isAuthenticated = session === "serma_admin_token_2026";
  
  return NextResponse.json({ authenticated: isAuthenticated });
}
