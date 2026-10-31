#!/usr/bin/env node
// Create (or reset) a user from the command line — used for the first admin.
//   node scripts/create-user.mjs you@example.com 'StrongPassword' --admin
// Reads DATABASE_URL from the environment or from .env.local / .env
import fs from "node:fs"
import pg from "pg"
import bcrypt from "bcryptjs"

for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}

const [email, password] = process.argv.slice(2).filter((a) => !a.startsWith("--"))
const admin = process.argv.includes("--admin")
if (!email) {
  console.error("Usage: node scripts/create-user.mjs <email> [password] [--admin]")
  process.exit(1)
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
const hash = password ? await bcrypt.hash(password, 12) : null
const meta = JSON.stringify({ role: admin ? "admin" : "developer", is_active: true })
const { rows } = await client.query(
  `INSERT INTO users (email, password_hash, app_metadata) VALUES (lower($1), $2, $3)
   ON CONFLICT (email) DO UPDATE SET password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
                                     app_metadata = users.app_metadata || EXCLUDED.app_metadata
   RETURNING id, email, app_metadata`,
  [email.trim(), hash, meta],
)
console.log("OK:", rows[0])
await client.end()
