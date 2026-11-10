// Sign in with an API key (sfm_...). Sets the session cookie directly.
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase/server"
import { findUserById, isActive, startSession } from "@/lib/auth/users"

const hashApiKey = (key: string) => crypto.createHash("sha256").update(key).digest("hex")

export async function POST(request: NextRequest) {
  try {
    const { key, embedded, next } = await request.json().catch(() => ({}))
    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "مفتاح API مطلوب" }, { status: 400 })
    }
    if (!key.startsWith("sfm_")) {
      return NextResponse.json({ error: "تنسيق المفتاح غير صحيح" }, { status: 400 })
    }

    const db = createAdminClient()
    const { data: apiKey } = await db
      .from("api_keys")
      .select("id, user_id, is_active, expires_at")
      .eq("key_hash", hashApiKey(key))
      .maybeSingle()

    if (!apiKey) return NextResponse.json({ error: "مفتاح API غير صالح" }, { status: 401 })
    if (!apiKey.is_active) return NextResponse.json({ error: "مفتاح API غير مفعل" }, { status: 401 })
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return NextResponse.json({ error: "مفتاح API منتهي الصلاحية" }, { status: 401 })
    }

    const user = await findUserById(apiKey.user_id)
    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    if (!isActive(user)) return NextResponse.json({ error: "الحساب موقوف" }, { status: 403 })

    await db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", apiKey.id)
    await startSession(user, { embedded: !!embedded })

    // next: مسار داخلي فقط (يبدأ بـ / وليس //) — يمنع التحويل لموقع خارجي
    const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/"

    return NextResponse.json({
      success: true,
      redirectUrl: safeNext,
      user: { id: user.id, email: user.email },
      message: "تم التحقق بنجاح",
    })
  } catch (error: any) {
    console.error("Error in POST /api/auth/api-login:", error)
    return NextResponse.json({ error: error?.message || "حدث خطأ غير معروف" }, { status: 500 })
  }
}
