// Session = a signed JWT in an httpOnly cookie. Edge-safe (used by middleware).
import { SignJWT, jwtVerify } from "jose"

export const SESSION_COOKIE = "sfm_session"
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export interface SessionUser {
  id: string
  email: string
  role: string
}

function secret() {
  const s = process.env.AUTH_SECRET
  if (!s || s.length < 32) throw new Error("AUTH_SECRET is missing or shorter than 32 characters")
  return new TextEncoder().encode(s)
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
}

export async function verifySession(token?: string | null): Promise<SessionUser | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] })
    if (!payload.sub) return null
    return { id: payload.sub, email: String(payload.email || ""), role: String(payload.role || "developer") }
  } catch {
    return null
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
}
