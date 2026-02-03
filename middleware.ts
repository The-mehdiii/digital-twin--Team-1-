import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const sessionToken = req.cookies.get("authjs.session-token")?.value 
    || req.cookies.get("__Secure-authjs.session-token")?.value;
  
  const isLoggedIn = !!sessionToken;
  const isOnChat = req.nextUrl.pathname.startsWith("/chat");
  const isOnAuth = req.nextUrl.pathname.startsWith("/auth");
  const isOnApi = req.nextUrl.pathname.startsWith("/api");

  // Allow API routes to handle their own auth
  if (isOnApi) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
  }

  // Protect chat routes - require login
  if (isOnChat && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
