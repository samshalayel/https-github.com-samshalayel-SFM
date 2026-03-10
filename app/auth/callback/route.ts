import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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
    try {
      const supabase = await createClient()
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
        // In development, use the origin directly
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // In production behind a proxy, use the forwarded host
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
