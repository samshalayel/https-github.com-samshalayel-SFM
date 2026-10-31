import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, findUserById, updateAppMetadata, setPassword, deleteUser } from "@/lib/auth/users"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 })

  const { id } = await params
  const target = await findUserById(id)
  if (!target) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })

  const { role, is_active, password } = await request.json().catch(() => ({}))
  if (id === admin.id && (role === "developer" || is_active === false)) {
    return NextResponse.json({ error: "ما بتقدر تشيل صلاحيات حسابك أو توقفه" }, { status: 400 })
  }

  const meta: Record<string, any> = { ...(target.app_metadata || {}) }
  if (role !== undefined) meta.role = role === "admin" ? "admin" : "developer"
  if (is_active !== undefined) meta.is_active = Boolean(is_active)
  await updateAppMetadata(id, meta)

  if (password !== undefined) {
    if (String(password).length < 8) {
      return NextResponse.json({ error: "كلمة المرور لازم تكون 8 أحرف على الأقل" }, { status: 400 })
    }
    await setPassword(id, String(password))
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  const { id } = await params
  if (id === admin.id) return NextResponse.json({ error: "ما بتقدر تحذف حسابك" }, { status: 400 })
  await deleteUser(id)
  return NextResponse.json({ success: true })
}
