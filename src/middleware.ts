import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal middleware - auth is primarily handled by server components in layouts
// Using new Next.js 16 middleware pattern
export function middleware(request: NextRequest) {
  // Pass through all requests - auth checking is done per-page/layout
  return NextResponse.next();
}

export const config = {
  // Apply to all routes except static assets and images
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
