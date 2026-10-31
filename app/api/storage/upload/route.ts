import { NextRequest, NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"
import { currentUser } from "@/lib/auth/users"
import { resolveFile, MAX_UPLOAD_BYTES } from "@/lib/storage/files"

export async function POST(request: NextRequest) {
  if (!(await currentUser())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

  const form = await request.formData().catch(() => null)
  const bucket = String(form?.get("bucket") || "")
  const rel = String(form?.get("path") || "")
  const file = form?.get("file")
  if (!(file instanceof Blob)) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "الملف أكبر من 10MB" }, { status: 413 })

  const full = resolveFile(bucket, rel)
  if (!full) return NextResponse.json({ error: "Invalid bucket or path" }, { status: 400 })
  if (/\.(html?|svg|js|mjs)$/i.test(full)) {
    return NextResponse.json({ error: "نوع الملف غير مسموح" }, { status: 400 })
  }

  await fs.mkdir(path.dirname(full), { recursive: true })
  try {
    await fs.writeFile(full, Buffer.from(await file.arrayBuffer()), { flag: "wx" })
  } catch (e: any) {
    if (e?.code === "EEXIST") return NextResponse.json({ error: "The resource already exists" }, { status: 409 })
    throw e
  }
  return NextResponse.json({ path: rel })
}
