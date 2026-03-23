import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const userId = searchParams.get("user_id")
  const isPopup = searchParams.get("popup") === "true"

  console.log("[v0] API Callback started with userId:", userId, "isPopup:", isPopup)

  if (!userId) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_request`)
  }

  try {
    // Use admin client
    const { createClient: createAdminClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user data
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    console.log("[v0] User data:", userData?.user?.email, "Error:", userError?.message)

    if (userError || !userData.user) {
      return NextResponse.redirect(`${origin}/auth/login?error=user_not_found`)
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email!,
    })

    if (linkError || !linkData) {
      console.error("[v0] Link generation error:", linkError)
      return NextResponse.redirect(`${origin}/auth/login?error=link_generation_failed`)
    }

    console.log("[v0] Link generated. Properties keys:", Object.keys(linkData.properties))
    
    // Get the hashed_token directly from properties
    const hashedToken = linkData.properties.hashed_token
    console.log("[v0] Hashed token exists:", !!hashedToken)

    if (!hashedToken) {
      // If no hashed_token, try parsing action_link
      const actionLink = linkData.properties.action_link
      console.log("[v0] Trying action_link:", actionLink)
      return NextResponse.redirect(`${origin}/auth/login?error=no_hashed_token`)
    }

    // Create response that redirects to home
    const response = NextResponse.redirect(`${origin}/`)

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // SameSite=None and Secure required for cross-site requests
              response.cookies.set(name, value, {
                ...options,
                sameSite: "none",
                secure: true,
              })
            })
          },
        },
      }
    )

    // Verify OTP using hashed_token
    const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: hashedToken,
      type: "magiclink",
    })

    console.log("[v0] Verify OTP result - Session:", !!sessionData?.session, "Error:", verifyError?.message)

    if (verifyError) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(verifyError.message)}`)
    }

    if (!sessionData?.session) {
      return NextResponse.redirect(`${origin}/auth/login?error=no_session_created`)
    }

    console.log("[v0] Session created successfully!")
    
    // If this is a popup, return an HTML page that notifies the parent and closes
    if (isPopup) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head><title>تم تسجيل الدخول</title></head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: "API_LOGIN_SUCCESS" }, "${origin}");
                setTimeout(() => window.close(), 500);
              } else {
                window.location.href = "/";
              }
            </script>
            <p>تم تسجيل الدخول بنجاح! جارٍ الإغلاق...</p>
          </body>
        </html>
      `
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html",
          // Set cookies from the response
          ...Object.fromEntries(response.headers.entries()),
        },
      })
    }
    
    return response
  } catch (error: any) {
    console.error("[v0] API callback error:", error)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message || "unknown_error")}`)
  }
}
