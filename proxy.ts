import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth.js session cookie names
const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_PREFIXES = ["/api/auth/", "/api/health"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based checks are enforced in server components via auth()
  // The proxy only handles the fast "is authenticated?" redirect
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
