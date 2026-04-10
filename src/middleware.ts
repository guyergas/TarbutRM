import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: Request) {
  const pathname = new URL(request.url).pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/register", "/api/health"];

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session?.user?.id) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const userRole = session.user.role;

  // Admin-only routes
  if (pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Staff-only routes (or admin)
  if (pathname.startsWith("/staff")) {
    if (userRole !== "STAFF" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets and api
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
