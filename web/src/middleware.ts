import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "register"];
const DEFAULT_LOGIN = "/login";
const DEFAULT_HOME = "/dashboard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("pb_access_token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Unauthenticated user trying to access a protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN, request.url));
  }

  // Authenticated user trying to access login/register
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
