import { NextResponse } from "next/server"
import { pool } from "@/lib/db/pool"
import { currentUser, listUsers } from "@/lib/auth/users"

export const dynamic = "force-dynamic"

export async function GET() {
  const me = await currentUser()
  if (!me) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  if (me.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح — يجب أن تكون مديراً" }, { status: 403 })
  }

  try {
    const users = await listUsers()
    const counts = async (table: string) => {
      const { rows } = await pool.query(`SELECT user_id, count(*)::int AS n FROM ${table} GROUP BY user_id`)
      return new Map<string, number>(rows.map((r: any) => [r.user_id, r.n]))
    }
    const [snaps, tasks, cols] = await Promise.all([counts("snapshots"), counts("tasks"), counts("columns")])

    const userStats = users.map((u) => {
      const s = snaps.get(u.id) || 0
      const t = tasks.get(u.id) || 0
      const c = cols.get(u.id) || 0
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        snapshots_count: s,
        tasks_count: t,
        columns_count: c,
        total_items: s + t + c,
        role: u.app_metadata?.role || "developer",
        is_active: u.app_metadata?.is_active !== false,
        has_password: Boolean(u.password_hash),
      }
    })
    userStats.sort((a, b) => b.total_items - a.total_items)

    const sum = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0)
    return NextResponse.json({
      summary: {
        total_users: users.length,
        total_snapshots: sum(snaps),
        total_tasks: sum(tasks),
        total_columns: sum(cols),
      },
      userStats,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 })
  }
}
