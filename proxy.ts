import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string })?.role;
  const pathname = req.nextUrl.pathname;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isAdminLoginPage = pathname === "/admin/login";

  const isCustomerRoute = pathname.startsWith("/compte");

  // Routes admin
  if (isAdminRoute) {
    if (isAdminLoginPage) {
      return NextResponse.next();
    }

    if (!isLoggedIn || role !== "admin") {
      const loginUrl = new URL("/admin/login", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Routes client (compte)
  if (isCustomerRoute) {
    if (!isLoggedIn || role !== "customer") {
      const loginUrl = new URL("/connexion", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/compte/:path*"],
};