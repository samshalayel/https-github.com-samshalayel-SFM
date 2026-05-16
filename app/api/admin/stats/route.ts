import { createClient as createServiceClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 })
  }

  // Verify current user session
  const userSupabase = await createClient()
  const { data: { user: sessionUser }, error: authError } = await userSupabase.auth.getUser()
  if (authError || !sessionUser) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const supabase = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 })

    // Bootstrap: if no admins exist, make current user admin
    const admins = (users || []).filter(u => u.app_metadata?.role === "admin")
    let currentUserMeta = users?.find(u => u.id === sessionUser.id)?.app_metadata || {}

    if (admins.length === 0) {
      currentUserMeta = { ...currentUserMeta, role: "admin", is_active: true }
      await supabase.auth.admin.updateUserById(sessionUser.id, { app_metadata: currentUserMeta })
    }

    // Admin check
    if (currentUserMeta?.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح — يجب أن تكون مديراً" }, { status: 403 })
    }

    // Fetch data
    const [{ data: snapshots }, { data: tasks }, { data: columns }] = await Promise.all([
      supabase.from("snapshots").select("user_id, id"),
      supabase.from("tasks").select("user_id, id"),
      supabase.from("columns").select("user_id, id"),
    ])

    const count = (arr: any[] | null, userId: string) =>
      (arr || []).filter(r => r.user_id === userId).length

    const userStats = (users || []).map(user => {
      const s = count(snapshots, user.id)
      const t = count(tasks, user.id)
      const col = count(columns, user.id)
      return {
        id: user.id,
        email: user.email || "N/A",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        snapshots_count: s,
        tasks_count: t,
        columns_count: col,
        total_items: s + t + col,
        role: (user.app_metadata?.role as string) || "developer",
        is_active: user.app_metadata?.is_active !== false,
      }
    })

    userStats.sort((a, b) => b.total_items - a.total_items)

    return NextResponse.json({
      summary: {
        total_users: users?.length || 0,
        total_snapshots: snapshots?.length || 0,
        total_tasks: tasks?.length || 0,
        total_columns: columns?.length || 0,
      },
      userStats,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 })
  }
}
