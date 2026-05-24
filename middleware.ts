import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /admin routes but allow /admin/login
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session")?.value;

    // Check if the cookie value is correct
    if (!sessionCookie || sessionCookie !== "serma_admin_token_2026") {
      const loginUrl = new URL("/admin/login", request.url);
      // Pass the original URL to redirect back after login if desired
      loginUrl.searchParams.set("from", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
