import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Generate a secure random API key
function generateApiKey(): string {
  const prefix = "sfm_"
  const randomBytes = crypto.randomBytes(32).toString("hex")
  return `${prefix}${randomBytes}`
}

// Hash the API key for storage
function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "اسم المفتاح مطلوب" },
        { status: 400 }
      )
    }

    // Generate the API key
    const fullKey = generateApiKey()
    const keyHash = hashApiKey(fullKey)
    const keyPrefix = fullKey.substring(0, 12) // "sfm_" + first 8 chars

    // Insert into database
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        name: name.trim(),
        key_hash: keyHash,
        key_prefix: keyPrefix,
        is_active: true,
      })
      .select("id, name, key_prefix, created_at, last_used_at, expires_at, is_active")
      .single()

    if (error) {
      console.error("Error creating API key:", error)
      return NextResponse.json(
        { error: "فشل في إنشاء المفتاح" },
        { status: 500 }
      )
    }

    // Return the full key only once - it cannot be retrieved again
    return NextResponse.json({
      key: data,
      fullKey: fullKey,
    })
  } catch (error: any) {
    console.error("Error in POST /api/api-keys:", error)
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير معروف" },
      { status: 500 }
    )
  }
}

// GET - List all API keys for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, expires_at, is_active")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching API keys:", error)
      return NextResponse.json(
        { error: "فشل في جلب المفاتيح" },
        { status: 500 }
      )
    }

    return NextResponse.json({ keys: data })
  } catch (error: any) {
    console.error("Error in GET /api/api-keys:", error)
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير معروف" },
      { status: 500 }
    )
  }
}

// DELETE - Delete an API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get("id")

    if (!keyId) {
      return NextResponse.json(
        { error: "معرف المفتاح مطلوب" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", keyId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting API key:", error)
      return NextResponse.json(
        { error: "فشل في حذف المفتاح" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/api-keys:", error)
    return NextResponse.json(
      { error: error?.message || "حدث خطأ غير معروف" },
      { status: 500 }
    )
  }
}
