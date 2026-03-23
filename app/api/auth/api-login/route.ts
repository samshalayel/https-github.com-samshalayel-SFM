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

    // Update last_used_at
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKey.id)

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", apiKey.user_id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // Create a session for the user using admin API
    // Note: This requires service role key for admin operations
    // For now, we'll return success with user info and let the client handle session

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
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
