import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/forgot-password"];
const AUTHENTICATED_HOME_PATH = "/branches";

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicPath = isPublicPath(pathname);

  if (!token && !publicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && publicPath) {
    return NextResponse.redirect(new URL(AUTHENTICATED_HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/forgot-password",
    "/analytics/:path*",
    "/blacklist/:path*",
    "/request-feedback/:path*",
    "/reviews-and-requests/:path*",
    "/settings/:path*",
    "/branches/:path*",
  ],
};
