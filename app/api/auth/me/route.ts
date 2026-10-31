import { NextResponse } from "next/server"
import { currentUser, publicUser } from "@/lib/auth/users"

export const dynamic = "force-dynamic"

export async function GET() {
  const u = await currentUser()
  return NextResponse.json({ user: u ? publicUser(u) : null })
}
