import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const user = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)

  // api-login يمر دائماً: يعيد الدخول بالمفتاح ثم يحوّل إلى next (مثل /?import=...)
  const isAuthPage = pathname.startsWith("/auth/") && pathname !== "/auth/callback" && pathname !== "/auth/api-login"
  const isProtected = pathname === "/" || pathname.startsWith("/builder") || pathname.startsWith("/dashboard")

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.search = ""
    return NextResponse.redirect(url)
  }
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.search = ""
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
