import { createServerClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient()

  // Check if this is an auth callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up") ||
    request.nextUrl.pathname === "/auth/callback"

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard")

  if (isDashboardRoute && !isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // If trying to access dashboard without auth, redirect to login
      const redirectUrl = new URL("/auth/login", request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  if (isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return supabaseResponse
}
