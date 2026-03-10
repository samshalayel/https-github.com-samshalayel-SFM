import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const next = searchParams.get("next") ?? "/"

  // Handle OAuth errors from provider
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription)
    const errorMessage = encodeURIComponent(errorDescription || error || "Authentication failed")
    return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[Auth Callback] Supabase not configured")
      return NextResponse.redirect(`${origin}/auth/login?error=supabase_not_configured`)
    }

    try {
      const cookieStore = await cookies()
      
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      })

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error("[Auth Callback] Code exchange error:", exchangeError.message)
        const errorMessage = encodeURIComponent(exchangeError.message || "Failed to authenticate")
        return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
      }
      
      // Successful authentication - redirect to intended destination
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (err) {
      console.error("[Auth Callback] Unexpected error:", err)
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected_error`)
    }
  }

  // No code provided - return to login
  return NextResponse.redirect(`${origin}/auth/login?error=no_code_provided`)
}
