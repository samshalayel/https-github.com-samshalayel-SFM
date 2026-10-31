import "server-only"
import path from "node:path"

export const BUCKETS = new Set(["documents", "logos"])
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function storageRoot() {
  return path.resolve(process.env.STORAGE_DIR || path.join(process.cwd(), "storage"))
}

/** Validate bucket + relative path and return the absolute file path, or null. */
export function resolveFile(bucket: string, rel: string): string | null {
  if (!BUCKETS.has(bucket)) return null
  const parts = rel.split("/").filter(Boolean)
  if (!parts.length || parts.some((p) => p === "." || p === ".." || !/^[A-Za-z0-9._-]+$/.test(p))) return null
  const root = path.join(storageRoot(), bucket)
  const full = path.join(root, ...parts)
  return full.startsWith(root + path.sep) ? full : null
}

const TYPES: Record<string, string> = {
  pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", json: "application/json",
  txt: "text/plain; charset=utf-8", md: "text/markdown; charset=utf-8",
  doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}
export const contentType = (file: string) => TYPES[file.split(".").pop()?.toLowerCase() || ""] || "application/octet-stream"
