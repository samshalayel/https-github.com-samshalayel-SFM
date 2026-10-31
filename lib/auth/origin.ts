import type { NextRequest } from "next/server"

/** Public origin of the site (nginx sits in front, so request.url may say localhost). */
export function publicOrigin(request: NextRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "")
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") || "https"
  return host ? `${proto}://${host}` : new URL(request.url).origin
}
