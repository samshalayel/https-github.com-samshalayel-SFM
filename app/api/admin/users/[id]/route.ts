import { createClient as createServiceClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Verify session
  const userSupabase = await createClient()
  const { data: { user: sessionUser }, error: authError } = await userSupabase.auth.getUser()
  if (authError || !sessionUser) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const supabase = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Check caller is admin
  const { data: { user: callerData } } = await supabase.auth.admin.getUserById(sessionUser.id)
  if (callerData?.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const { id } = params
  const body = await request.json()
  const { role, is_active } = body

  // Get target user current metadata
  const { data: { user: targetUser } } = await supabase.auth.admin.getUserById(id)
  const existingMeta = targetUser?.app_metadata || {}

  const newMeta: Record<string, any> = { ...existingMeta }
  if (role !== undefined) newMeta.role = role
  if (is_active !== undefined) newMeta.is_active = is_active

  const { error } = await supabase.auth.admin.updateUserById(id, { app_metadata: newMeta })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
