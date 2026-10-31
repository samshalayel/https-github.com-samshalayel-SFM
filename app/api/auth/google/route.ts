import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { publicOrigin } from "@/lib/auth/origin"

// Step 1 of Google sign-in: send the browser to Google's consent screen.
export async function GET(request: NextRequest) {
  const origin = publicOrigin(request)
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent("دخول Google غير مفعّل على السيرفر")}`)
  }
  const state = crypto.randomBytes(16).toString("hex")
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", `${origin}/auth/callback`)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "openid email")
  url.searchParams.set("state", state)
  url.searchParams.set("prompt", "select_account")

  const res = NextResponse.redirect(url.toString())
  res.cookies.set("sfm_oauth_state", state, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600,
  })
  return res
}
