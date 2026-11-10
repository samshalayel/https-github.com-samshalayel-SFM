import "server-only"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { pool } from "@/lib/db/pool"
import { SESSION_COOKIE, verifySession, signSession, sessionCookieOptions, type SessionUser } from "./session"

export interface DbUser {
  id: string
  email: string
  password_hash: string | null
  app_metadata: { role?: string; is_active?: boolean; [k: string]: any }
  created_at: string
  last_sign_in_at: string | null
}

// Shape the old Supabase `user` object had, so components keep working
export function publicUser(u: DbUser) {
  return {
    id: u.id,
    email: u.email,
    app_metadata: u.app_metadata || {},
    user_metadata: {},
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }
}

export const normalizeEmail = (e: string) => e.trim().toLowerCase()

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [normalizeEmail(email)])
  return rows[0] ?? null
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id])
  return rows[0] ?? null
}

export async function listUsers(): Promise<DbUser[]> {
  const { rows } = await pool.query("SELECT * FROM users ORDER BY created_at")
  return rows
}

export async function createUser(email: string, password: string | null, role = "developer"): Promise<DbUser> {
  const hash = password ? await bcrypt.hash(password, 12) : null
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, app_metadata) VALUES ($1, $2, $3) RETURNING *`,
    [normalizeEmail(email), hash, JSON.stringify({ role, is_active: true })],
  )
  return rows[0]
}

export async function setPassword(id: string, password: string) {
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(password, 12), id])
}

export async function updateAppMetadata(id: string, meta: Record<string, any>) {
  await pool.query("UPDATE users SET app_metadata = $1 WHERE id = $2", [JSON.stringify(meta), id])
}

export async function deleteUser(id: string) {
  await pool.query("DELETE FROM users WHERE id = $1", [id])
}

export async function checkPassword(user: DbUser, password: string): Promise<boolean> {
  if (!user.password_hash) return false
  return bcrypt.compare(password, user.password_hash)
}

export const isActive = (u: DbUser) => u.app_metadata?.is_active !== false

export async function markSignedIn(id: string) {
  await pool.query("UPDATE users SET last_sign_in_at = NOW() WHERE id = $1", [id])
}

export function sessionFor(u: DbUser): SessionUser {
  return { id: u.id, email: u.email, role: u.app_metadata?.role || "developer" }
}

/** Issue the session cookie for this user (call from a route handler). */
export async function startSession(u: DbUser, opts: { embedded?: boolean } = {}) {
  await markSignedIn(u.id)
  const token = await signSession(sessionFor(u))
  // داخل iframe لموقع آخر (سيسو) الكوكي العادي (SameSite=Lax) لا يُرسل — نستخدم كوكي
  // مقسّم (Partitioned/CHIPS): يعمل فقط داخل ذلك الـ iframe ولا يغيّر جلسة الموقع المباشر.
  ;(await cookies()).set(
    SESSION_COOKIE,
    token,
    opts.embedded ? { ...sessionCookieOptions, sameSite: "none", secure: true, partitioned: true } : sessionCookieOptions,
  )
}

export async function endSession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}

/** Current signed-in user, re-checked against the DB (disabled users are rejected). */
export async function currentUser(): Promise<DbUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const s = await verifySession(token)
  if (!s) return null
  const u = await findUserById(s.id)
  if (!u || !isActive(u)) return null
  return u
}

export async function requireAdmin(): Promise<DbUser | null> {
  const u = await currentUser()
  return u && u.app_metadata?.role === "admin" ? u : null
}
