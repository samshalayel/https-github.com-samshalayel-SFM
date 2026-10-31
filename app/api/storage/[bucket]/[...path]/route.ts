// Public file URLs (what getPublicUrl() returns), like a Supabase public bucket.
import { NextRequest, NextResponse } from "next/server"
import fs from "node:fs/promises"
import { resolveFile, contentType } from "@/lib/storage/files"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ bucket: string; path: string[] }> }) {
  const { bucket, path } = await params
  const full = resolveFile(bucket, path.map(decodeURIComponent).join("/"))
  if (!full) return new NextResponse("Not found", { status: 404 })
  try {
    const data = await fs.readFile(full)
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType(full),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
