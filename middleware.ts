import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get("admin_session")?.value

  // Allow login page always
  if (pathname === "/admin/login") {
    // If already logged in, redirect to dashboard
    if (session === "authenticated") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Protect all other /admin routes
  if (pathname.startsWith("/admin")) {
    if (!session || session !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}