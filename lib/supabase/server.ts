// Server client (route handlers / server components). Same API shape as the
// old Supabase server client, but runs SQL directly, scoped to the signed-in user.
import "server-only"
import { QueryBuilder } from "@/lib/db/query-builder"
import { executeQuery, type Scope } from "@/lib/db/execute"
import { currentUser, publicUser } from "@/lib/auth/users"

export function isSupabaseConfigured(): boolean {
  return true
}

export async function createClient() {
  const user = await currentUser()
  const scope: Scope | null = user ? { userId: user.id } : null
  return {
    auth: {
      async getUser() {
        return user
          ? { data: { user: publicUser(user) }, error: null }
          : { data: { user: null }, error: { message: "Not authenticated" } }
      },
    },
    from: (table: string) =>
      new QueryBuilder(table, (spec) =>
        scope ? executeQuery(spec, scope) : Promise.resolve({ data: null, error: { message: "Not authenticated" } }),
      ),
  } as any
}

/** Bypasses per-user scoping. Only for trusted server code (API-key login, admin). */
export function createAdminClient() {
  return {
    from: (table: string) => new QueryBuilder(table, (spec) => executeQuery(spec, { admin: true })),
  } as any
}
