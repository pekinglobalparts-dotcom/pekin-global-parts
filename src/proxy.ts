import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export async function proxy(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const isSocios = host.startsWith("socios.");

  // socios subdomain: redirect root to login
  if (isSocios && pathname === "/") {
    return NextResponse.redirect(new URL("/login?role=socio", req.url));
  }

  // main domain: redirect /admin and /socio paths to socios subdomain
  if (!isSocios && !host.includes("localhost") && !host.includes("vercel.app")) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/socio")) {
      return NextResponse.redirect(new URL(`https://socios.pekinglobalparts.com${pathname}`));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/login?role=admin", req.url));
    }
  }

  if (pathname.startsWith("/socio")) {
    if (!session || session.user.role !== "socio") {
      return NextResponse.redirect(new URL("/login?role=socio", req.url));
    }
  }

  if (pathname === "/login" && session) {
    if (session.user.role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
    if (session.user.role === "socio") return NextResponse.redirect(new URL("/socio", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
