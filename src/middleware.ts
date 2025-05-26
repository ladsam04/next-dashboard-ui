import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { routeAccessMap } from "./lib/settings"
import { NextResponse } from "next/server"

// Define truly public routes (only sign-in related)
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"])

// Define the homepage as requiring authentication
const isHomePage = createRouteMatcher(["/"])

// Create matchers from your routeAccessMap for protected routes
const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}))

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Allow public routes to proceed without any checks
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // For all other routes (including homepage), require authentication
  const { userId, sessionClaims } = await auth()

  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("redirect_url", req.url)
    return NextResponse.redirect(signInUrl)
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role

  // If user is authenticated but has no role, redirect to sign-in for role assignment
  if (!role) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("error", "no_role")
    return NextResponse.redirect(signInUrl)
  }

  // Handle homepage - redirect authenticated users to their dashboard
  if (isHomePage(req)) {
    return NextResponse.redirect(new URL(`/${role}`, req.url))
  }

  // Check if user has permission to access the current route
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req)) {
      if (!allowedRoles.includes(role)) {
        // User is authenticated but doesn't have permission for this route
        // Redirect to their role-specific dashboard
        return NextResponse.redirect(new URL(`/${role}`, req.url))
      }
      // User has permission, allow access
      return NextResponse.next()
    }
  }

  // If no specific route matcher found, allow access (for dynamic routes, etc.)
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
