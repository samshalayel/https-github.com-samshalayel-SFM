// Generic data endpoint used by the browser client (replaces Supabase REST).
// Every query is forced to the signed-in user's rows in executeQuery().
import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@/lib/auth/users"
import { executeQuery } from "@/lib/db/execute"
import type { QuerySpec } from "@/lib/db/query-builder"

export async function POST(request: NextRequest) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ data: null, error: { message: "Not authenticated" } }, { status: 401 })
  }
  const spec = (await request.json().catch(() => null)) as QuerySpec | null
  if (!spec || typeof spec.table !== "string" || !Array.isArray(spec.filters) || !Array.isArray(spec.order)) {
    return NextResponse.json({ data: null, error: { message: "Bad query" } }, { status: 400 })
  }
  const result = await executeQuery(spec, { userId: user.id })
  return NextResponse.json(result)
}
