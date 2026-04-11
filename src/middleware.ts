import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/api/health"];

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Note: Full auth checking is done per-page/layout using server components
  // This middleware just ensures basic routing doesn't break
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets and api
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
