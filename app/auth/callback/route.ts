import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const next = searchParams.get("next") ?? "/"

  // Handle OAuth errors from provider
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription)
    const errorMessage = encodeURIComponent(errorDescription || error || "Authentication failed")
    return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
  }

  // Handle magic link tokens (from API key login)
  if (tokenHash && type) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[Auth Callback] Supabase not configured")
      return NextResponse.redirect(`${origin}/auth/login?error=supabase_not_configured`)
    }

    try {
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      
      let redirectUrl: string
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }
      
      const response = NextResponse.redirect(redirectUrl)
      
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, { ...options, sameSite: "none", secure: true })
            })
          },
        },
      })

      // Verify the token hash for magic link
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "magiclink" | "email",
      })
      
      if (verifyError) {
        console.error("[Auth Callback] Magic link verification error:", verifyError.message)
        const errorMessage = encodeURIComponent(verifyError.message || "Failed to authenticate")
        return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
      }
      
      return response
    } catch (err) {
      console.error("[Auth Callback] Unexpected error:", err)
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected_error`)
    }
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[Auth Callback] Supabase not configured")
      return NextResponse.redirect(`${origin}/auth/login?error=supabase_not_configured`)
    }

    try {
      // Create response that we'll return - cookies will be set on this
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      
      let redirectUrl: string
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }
      
      const response = NextResponse.redirect(redirectUrl)
      
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, { ...options, sameSite: "none", secure: true })
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
      
      // Successful authentication - return response with cookies set
      return response
    } catch (err) {
      console.error("[Auth Callback] Unexpected error:", err)
      return NextResponse.redirect(`${origin}/auth/login?error=unexpected_error`)
    }
  }

  // No code provided - return to login
  return NextResponse.redirect(`${origin}/auth/login?error=no_code_provided`)
}
