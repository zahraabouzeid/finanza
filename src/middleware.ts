import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow PIN page and auth API through
  if (pathname === "/pin" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow static files and Next internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname === "/manifest.json") {
    return NextResponse.next();
  }

  const auth = req.cookies.get("finanza_auth");
  if (!auth) {
    return NextResponse.redirect(new URL("/pin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
