import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  const isSocios = host.startsWith("socios.");

  // On socios subdomain: redirect root to /login, allow everything else
  if (isSocios) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login?role=socio", req.url));
    }
    return NextResponse.next();
  }

  // On main domain: block /socio and /admin paths (redirect to their portals)
  if (pathname.startsWith("/socio") || pathname.startsWith("/admin")) {
    const sociosUrl = host.includes("localhost")
      ? new URL(pathname, req.url)
      : new URL(`https://socios.pekinglobalparts.com${pathname}`);
    return NextResponse.redirect(sociosUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
