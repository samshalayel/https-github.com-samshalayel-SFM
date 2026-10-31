// Browser client. Supabase is gone — this keeps the same API shape
// (auth / from / storage) but talks to our own Next.js routes.
import { QueryBuilder, type QuerySpec, type QueryResult } from "@/lib/db/query-builder"

export function isSupabaseConfigured(): boolean {
  return true
}

const err = (message: string) => ({ message })

async function runRemote(spec: QuerySpec): Promise<QueryResult> {
  try {
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spec),
      credentials: "same-origin",
    })
    const body = await res.json().catch(() => null)
    if (!body) return { data: null, error: err(`HTTP ${res.status}`) }
    return body
  } catch (e: any) {
    return { data: null, error: err(e?.message || "Network error") }
  }
}

// getUser() is called from many components on load; share one request.
let meCache: { at: number; p: Promise<any> } | null = null
function fetchMe() {
  if (meCache && Date.now() - meCache.at < 3000) return meCache.p
  const p = fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
    .then((r) => r.json())
    .then((b) => b.user ?? null)
    .catch(() => null)
  meCache = { at: Date.now(), p }
  return p
}

const auth = {
  async getUser() {
    const user = await fetchMe()
    return { data: { user }, error: user ? null : err("Not authenticated") }
  },
  async getSession() {
    const user = await fetchMe()
    return { data: { session: user ? { user } : null }, error: null }
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    meCache = null
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return { data: { user: null, session: null }, error: new Error(body.error || "فشل تسجيل الدخول") }
    return { data: { user: null, session: null }, error: null }
  },
  async signInWithOAuth(_opts: { provider: string; options?: any }) {
    window.location.href = "/api/auth/google"
    return { data: { url: "/api/auth/google", provider: "google" }, error: null }
  },
  async signUp(_opts: any) {
    return { data: { user: null, session: null }, error: new Error("التسجيل مغلق — المدير بيضيف الحسابات") }
  },
  async signOut() {
    meCache = null
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    return { error: null }
  },
  onAuthStateChange(_cb: any) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  },
}

function storageBucket(bucket: string) {
  return {
    async upload(path: string, file: Blob, _opts?: any) {
      const fd = new FormData()
      fd.append("bucket", bucket)
      fd.append("path", path)
      fd.append("file", file)
      try {
        const res = await fetch("/api/storage/upload", { method: "POST", body: fd })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) return { data: null, error: err(body.error || `Upload failed (${res.status})`) }
        return { data: { path: body.path, fullPath: `${bucket}/${body.path}` }, error: null }
      } catch (e: any) {
        return { data: null, error: err(e?.message || "Upload failed") }
      }
    },
    getPublicUrl(path: string) {
      const clean = path.split("/").map(encodeURIComponent).join("/")
      return { data: { publicUrl: `${window.location.origin}/api/storage/${bucket}/${clean}` } }
    },
  }
}

// One shared instance, like the old Supabase browser client. Components put
// `supabase` in hook dependency arrays, so a fresh object per call would loop.
const client = {
  auth,
  from: (table: string) => new QueryBuilder(table, runRemote),
  storage: { from: storageBucket },
}

export function createClient() {
  return client as any
}
