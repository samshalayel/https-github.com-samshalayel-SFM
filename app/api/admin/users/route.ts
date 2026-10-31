// Admin creates accounts (there is no public sign-up).
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, createUser, findUserByEmail, publicUser } from "@/lib/auth/users"

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 })

  const { email, password, role } = await request.json().catch(() => ({}))
  const e = String(email || "").trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return NextResponse.json({ error: "إيميل غير صالح" }, { status: 400 })
  }
  if (password && String(password).length < 8) {
    return NextResponse.json({ error: "كلمة المرور لازم تكون 8 أحرف على الأقل" }, { status: 400 })
  }
  if (await findUserByEmail(e)) {
    return NextResponse.json({ error: "الإيميل موجود مسبقاً" }, { status: 409 })
  }
  const user = await createUser(e, password ? String(password) : null, role === "admin" ? "admin" : "developer")
  return NextResponse.json({ user: publicUser(user) })
}
