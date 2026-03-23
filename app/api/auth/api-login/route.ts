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

    const supabase = await createClient()

    // Hash the provided key and look it up
    const keyHash = hashApiKey(key)

    const { data: apiKey, error: fetchError } = await supabase
      .from("api_keys")
      .select("id, user_id, is_active, expires_at")
      .eq("key_hash", keyHash)
      .single()

    if (fetchError || !apiKey) {
      return NextResponse.json(
        { error: "مفتاح API غير صالح" },
        { status: 401 }
      )
    }

    // Check if key is active
    if (!apiKey.is_active) {
      return NextResponse.json(
        { error: "مفتاح API غير مفعل" },
        { status: 401 }
      )
    }

    // Check if key has expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "مفتاح API منتهي الصلاحية" },
        { status: 401 }
      )
    }

    // Update last_used_at using service role to bypass RLS
    const { createClient: createAdminClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await supabaseAdmin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKey.id)

    // Get user data from auth.users using admin client
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(apiKey.user_id)

    if (userError || !userData.user) {
      console.error("[v0] Error fetching user:", userError)
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // Create a magic link session for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email!,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(request.url).origin : "http://localhost:3000"}/`,
      },
    })

    if (linkError || !linkData) {
      console.error("[v0] Error generating magic link:", linkError)
      return NextResponse.json(
        { error: "فشل في إنشاء جلسة تسجيل الدخول" },
        { status: 500 }
      )
    }

    // Extract the token from the magic link
    const magicLinkUrl = new URL(linkData.properties.action_link)
    const token = magicLinkUrl.searchParams.get("token")
    const tokenHash = magicLinkUrl.hash || ""

    return NextResponse.json({
      success: true,
      redirectUrl: linkData.properties.action_link,
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
