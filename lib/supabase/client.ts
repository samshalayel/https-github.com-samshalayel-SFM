"use client"

import { createBrowserClient } from "@supabase/ssr"

const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Use custom cookie options for cross-subdomain SSO
      },
      cookieOptions: cookieDomain
        ? {
            domain: cookieDomain,
            path: "/",
            sameSite: "lax" as const,
            secure: true,
          }
        : undefined,
    }
  )
}
