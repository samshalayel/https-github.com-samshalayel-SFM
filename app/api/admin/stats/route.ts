import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    // Get all users from auth
    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers({ perPage: 1000 })

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Get all snapshots grouped by user
    const { data: snapshots, error: snapshotsError } = await supabase
      .from("snapshots")
      .select("user_id, id")

    if (snapshotsError) {
      return NextResponse.json(
        { error: snapshotsError.message },
        { status: 500 }
      )
    }

    // Get all tasks grouped by user
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("user_id, id")

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    // Get all columns grouped by user
    const { data: columns, error: columnsError } = await supabase
      .from("columns")
      .select("user_id, id")

    if (columnsError) {
      return NextResponse.json(
        { error: columnsError.message },
        { status: 500 }
      )
    }

    // Count per user
    const snapshotCounts: Record<string, number> = {}
    snapshots?.forEach((s) => {
      snapshotCounts[s.user_id] = (snapshotCounts[s.user_id] || 0) + 1
    })

    const taskCounts: Record<string, number> = {}
    tasks?.forEach((t) => {
      taskCounts[t.user_id] = (taskCounts[t.user_id] || 0) + 1
    })

    const columnCounts: Record<string, number> = {}
    columns?.forEach((c) => {
      columnCounts[c.user_id] = (columnCounts[c.user_id] || 0) + 1
    })

    // Build user stats
    const userStats = (users || []).map((user) => ({
      id: user.id,
      email: user.email || "N/A",
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      snapshots_count: snapshotCounts[user.id] || 0,
      tasks_count: taskCounts[user.id] || 0,
      columns_count: columnCounts[user.id] || 0,
      total_items:
        (snapshotCounts[user.id] || 0) +
        (taskCounts[user.id] || 0) +
        (columnCounts[user.id] || 0),
    }))

    // Sort by total items descending
    userStats.sort((a, b) => b.total_items - a.total_items)

    // Summary totals
    const summary = {
      total_users: users?.length || 0,
      total_snapshots: snapshots?.length || 0,
      total_tasks: tasks?.length || 0,
      total_columns: columns?.length || 0,
    }

    return NextResponse.json({ summary, userStats })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
