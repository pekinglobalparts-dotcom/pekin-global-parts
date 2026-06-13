import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/login?role=admin", req.url));
    }
  }

  // Socio routes protection
  if (pathname.startsWith("/socio")) {
    if (!session || session.user.role !== "socio") {
      return NextResponse.redirect(new URL("/login?role=socio", req.url));
    }
  }

  // Redirect authenticated users away from login
  if (pathname === "/login" && session) {
    if (session.user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (session.user.role === "socio") {
      return NextResponse.redirect(new URL("/socio", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/socio/:path*", "/login"],
};
