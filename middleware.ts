import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Skip auth check for static files and API routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // If no user, redirect to cp.sillar.us/auth/login
    if (!user) {
      const returnUrl = encodeURIComponent(request.nextUrl.href)
      return NextResponse.redirect(
        `https://cp.sillar.us/auth/login?returnUrl=${returnUrl}`
      )
    }
  } catch (error) {
    // If Supabase error, redirect to login
    const returnUrl = encodeURIComponent(request.nextUrl.href)
    return NextResponse.redirect(
      `https://cp.sillar.us/auth/login?returnUrl=${returnUrl}`
    )
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
