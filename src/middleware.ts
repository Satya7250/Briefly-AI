import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SESSION_COOKIE_NAME } from "@/constants/auth"

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
  const pathname = request.nextUrl.pathname
  console.log("[MIDDLEWARE] Processing request:", pathname)
  console.log("[MIDDLEWARE] Session cookie present:", !!sessionCookie)

  // Public routes
  const publicRoutes = ["/login", "/register", "/api/corsair", "/api/auth/logout"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // API routes that require authentication
  const isProtectedApiRoute = pathname.startsWith("/api") && !isPublicRoute

  // Dashboard routes
  const dashboardRoutes = ["/dashboard", "/onboarding"]
  const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route))

  // If accessing protected API route without session, return 401
  if (isProtectedApiRoute && !sessionCookie) {
    console.log("[MIDDLEWARE] Protected API route without session, returning 401")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // If accessing dashboard route without session, redirect to login
  if (isDashboardRoute && !sessionCookie) {
    console.log("[MIDDLEWARE] Dashboard route without session, redirecting to login")
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()
  
  // Add security headers for all routes
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  console.log("[MIDDLEWARE] Allowing request to proceed")
  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/onboarding", 
    "/api/mail/:path*",
    "/api/calendar/:path*",
    "/api/integrations/:path*",
    "/api/ai/:path*"
  ],
}
