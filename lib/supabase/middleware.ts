import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const EXTERNAL_LOGIN_URL = "https://cp.sillar.us/login"

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Add return URL so user can come back after login
    const returnUrl = encodeURIComponent(request.nextUrl.href)
    const loginUrl = `${EXTERNAL_LOGIN_URL}?returnUrl=${returnUrl}`
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}
