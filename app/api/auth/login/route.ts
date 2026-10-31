import { NextRequest, NextResponse } from "next/server"
import { findUserByEmail, checkPassword, isActive, startSession } from "@/lib/auth/users"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json().catch(() => ({}))
  if (!email || !password) {
    return NextResponse.json({ error: "الإيميل وكلمة المرور مطلوبين" }, { status: 400 })
  }
  const user = await findUserByEmail(String(email))
  if (!user || !(await checkPassword(user, String(password)))) {
    return NextResponse.json({ error: "الإيميل أو كلمة المرور غير صحيحة" }, { status: 401 })
  }
  if (!isActive(user)) {
    return NextResponse.json({ error: "الحساب موقوف، تواصل مع المدير" }, { status: 403 })
  }
  await startSession(user)
  return NextResponse.json({ ok: true })
}
