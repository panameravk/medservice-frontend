import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USER_PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];
const RESET_PASSWORD_PATH = "/reset-password";
const USER_HOME = "/branches";
const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_HOME = "/admin/branches";

function isUserPublicPath(pathname: string) {
  return USER_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isAdminLoginPath(pathname: string) {
  return (
    pathname === ADMIN_LOGIN_PATH ||
    pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  );
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function middleware(request: NextRequest) {
  const userToken = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  if (isAdminLoginPath(pathname)) {
    if (adminToken) {
      return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
    }
    return NextResponse.next();
  }

  if (isAdminPath(pathname)) {
    if (!adminToken) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }
    return NextResponse.next();
  }

  const userPublicPath = isUserPublicPath(pathname);

  // A reset link must remain reachable even when the browser has an existing
  // (or stale) session cookie. Redirecting it would discard the emailed token
  // before the client has a chance to submit the new password.
  if (
    pathname === RESET_PASSWORD_PATH ||
    pathname.startsWith(`${RESET_PASSWORD_PATH}/`)
  ) {
    return NextResponse.next();
  }

  if (!userToken) {
    if (userPublicPath) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (userPublicPath) {
    return NextResponse.redirect(new URL(USER_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/analytics/:path*",
    "/blacklist/:path*",
    "/bonuses/:path*",
    "/request-feedback/:path*",
    "/reviews-and-requests/:path*",
    "/settings/:path*",
    "/branches/:path*",
    "/admin/:path*",
  ],
};
