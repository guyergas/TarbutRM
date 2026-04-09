import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

const PUBLIC_PATHS = ["/login", "/register", "/reset-password", "/contactus"];
const PUBLIC_PREFIXES = ["/api/auth/", "/api/health", "/api/register"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // If "no remember me" was chosen, re-set the session cookie without Expires
  // so it becomes a session cookie that clears when the browser closes.
  if (searchParams.get("_rm") === "0") {
    const sessionValue = request.cookies.get(SESSION_COOKIE)!.value;
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("_rm");
    const res = NextResponse.redirect(cleanUrl);
    res.cookies.set(SESSION_COOKIE, sessionValue, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      // No maxAge/expires → session cookie
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
