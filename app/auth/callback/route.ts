// Step 2 of Google sign-in: Google sends the user back here with a code.
// Only emails that an admin already added can sign in (no open sign-up).
import { NextRequest, NextResponse } from "next/server"
import { publicOrigin } from "@/lib/auth/origin"
import { findUserByEmail, isActive, startSession } from "@/lib/auth/users"

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request)
  const fail = (msg: string) => {
    const res = NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(msg)}`)
    res.cookies.delete("sfm_oauth_state")
    return res
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  if (searchParams.get("error")) return fail("تم إلغاء الدخول عبر Google")
  if (!code || !state || state !== request.cookies.get("sfm_oauth_state")?.value) {
    return fail("انتهت صلاحية محاولة الدخول، جرّب مرة ثانية")
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/auth/callback`,
        grant_type: "authorization_code",
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokenRes.ok || !tokens.access_token) return fail("فشل التحقق من Google")

    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const info = await infoRes.json()
    if (!info?.email || info.email_verified === false) return fail("إيميل Google غير مؤكد")

    const user = await findUserByEmail(info.email)
    if (!user) return fail(`الحساب ${info.email} غير مضاف، اطلب من المدير يضيفك`)
    if (!isActive(user)) return fail("الحساب موقوف، تواصل مع المدير")

    await startSession(user)
    const res = NextResponse.redirect(`${origin}/`)
    res.cookies.delete("sfm_oauth_state")
    return res
  } catch (e) {
    console.error("[auth/callback]", e)
    return fail("صار خطأ أثناء الدخول عبر Google")
  }
}
