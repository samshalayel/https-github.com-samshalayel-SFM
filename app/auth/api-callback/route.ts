import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const userId = searchParams.get("user_id")

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

    if (userError || !userData.user) {
      console.error("[v0] Error fetching user:", userError)
      return NextResponse.redirect(`${origin}/auth/login?error=user_not_found`)
    }

    // Generate magic link with proper settings
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email!,
      options: {
        redirectTo: `${origin}/`,
      },
    })

    if (linkError || !linkData) {
      console.error("[v0] Error generating link:", linkError)
      return NextResponse.redirect(`${origin}/auth/login?error=link_generation_failed`)
    }

    console.log("[v0] Generated link properties:", linkData.properties)
    
    // The action_link contains the full URL with hashed_token in the fragment
    // We need to parse the URL and extract token information
    const actionLink = linkData.properties.action_link
    console.log("[v0] Action link:", actionLink)
    
    // Parse the URL - token may be in query params or hash fragment
    const parsedUrl = new URL(actionLink)
    let tokenHash = parsedUrl.searchParams.get("token_hash")
    let type = parsedUrl.searchParams.get("type") || "magiclink"
    
    // If not in query params, check the hash/fragment
    if (!tokenHash && parsedUrl.hash) {
      const hashParams = new URLSearchParams(parsedUrl.hash.substring(1))
      tokenHash = hashParams.get("token_hash")
      type = hashParams.get("type") || type
    }
    
    // Also check for 'token' parameter
    if (!tokenHash) {
      tokenHash = parsedUrl.searchParams.get("token")
    }

    console.log("[v0] Extracted token_hash:", tokenHash, "type:", type)

    // If still no token_hash, the link may use a different format
    // Try to use the hashed_token from properties directly
    if (!tokenHash && linkData.properties.hashed_token) {
      tokenHash = linkData.properties.hashed_token
      console.log("[v0] Using hashed_token from properties:", tokenHash)
    }

    if (!tokenHash) {
      console.error("[v0] No token_hash found in magic link. Full link:", actionLink)
      console.error("[v0] Link properties:", JSON.stringify(linkData.properties))
      return NextResponse.redirect(`${origin}/auth/login?error=no_token_hash`)
    }

    // Create response
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
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Verify the OTP to create session
    const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink",
    })

    if (verifyError) {
      console.error("[v0] Verify OTP error:", verifyError)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(verifyError.message)}`)
    }

    console.log("[v0] Session created successfully for:", userData.user.email)

    return response
  } catch (error: any) {
    console.error("[v0] API callback error:", error)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message || "unknown_error")}`)
  }
}
