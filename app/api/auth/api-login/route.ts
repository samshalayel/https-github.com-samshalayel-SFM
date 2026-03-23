import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Hash the API key for comparison
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key } = body

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "مفتاح API مطلوب" },
        { status: 400 }
      )
    }

    // Validate key format
    if (!key.startsWith("sfm_")) {
      return NextResponse.json(
        { error: "تنسيق المفتاح غير صحيح" },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS for api_keys lookup
    const { createClient: createAdminClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Hash the provided key and look it up
    const keyHash = hashApiKey(key)
    console.log("[v0] Looking up API key with hash:", keyHash)

    const { data: apiKey, error: fetchError } = await supabaseAdmin
      .from("api_keys")
      .select("id, user_id, is_active, expires_at")
      .eq("key_hash", keyHash)
      .single()

    console.log("[v0] API key lookup result:", { apiKey, fetchError })

    if (fetchError || !apiKey) {
      console.log("[v0] API key not found or error:", fetchError?.message)
      return NextResponse.json(
        { error: "مفتاح API غير صالح" },
        { status: 401 }
      )
    }

    console.log("[v0] Checking if key is active:", apiKey.is_active)
    
    // Check if key is active
    if (!apiKey.is_active) {
      return NextResponse.json(
        { error: "مفتاح API غير مفعل" },
        { status: 401 }
      )
    }

    // Check if key has expired
    const isExpired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date()
    console.log("[v0] Key expiry check:", { expires_at: apiKey.expires_at, isExpired })
    
    if (isExpired) {
      return NextResponse.json(
        { error: "مفتاح API منتهي الصلاحية" },
        { status: 401 }
      )
    }

    console.log("[v0] Updating last_used_at...")
    // Update last_used_at
    await supabaseAdmin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKey.id)
    console.log("[v0] last_used_at updated")

    // Get user data from auth.users using admin client
    console.log("[v0] Getting user by ID:", apiKey.user_id)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(apiKey.user_id)
    console.log("[v0] User lookup result:", { user: userData?.user?.email, error: userError?.message })

    if (userError || !userData.user) {
      console.error("[v0] Error fetching user:", userError)
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // Generate redirect URL with user_id (the callback will create the session)
    const origin = new URL(request.url).origin
    const redirectUrl = `${origin}/auth/api-callback?user_id=${apiKey.user_id}`
    
    console.log("[v0] Final redirect URL:", redirectUrl)

    return NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: userData.user.id,
        email: userData.user.email,
      },
      message: "تم التحقق بنجاح",
    })
  } catch (error: any) {
    console.error("Error in POST /api/auth/api-login:", error)
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير معروف" },
      { status: 500 }
    )
  }
}
