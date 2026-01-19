import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              ...(cookieDomain && {
                domain: cookieDomain,
                path: "/",
                sameSite: "lax" as const,
                secure: true,
              }),
            })
          )
        },
      },
    }
  )

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user and not on login page, redirect to cp.sillar.us/login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // Redirect to main login at cp.sillar.us
    const currentUrl = request.nextUrl.href
    const loginUrl = new URL("https://cp.sillar.us/login")
    loginUrl.searchParams.set("returnUrl", currentUrl)
    return NextResponse.redirect(loginUrl)
  }

  // If user exists and on login page, redirect to home
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/"
    const url = request.nextUrl.clone()
    url.pathname = returnUrl
    url.search = ""
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
